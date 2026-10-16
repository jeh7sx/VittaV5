import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  verifyBeforeUpdateEmail,
  updatePassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { auth, db } from '../services/firebase';
import { notificarAdmin } from '../utils/notificacaoAdmin';

export interface DadosPerfil {
  nome: string;
  dataNascimento: string;
  email: string;
}

const PERFIL_VAZIO: DadosPerfil = {
  nome: '',
  dataNascimento: '',
  email: '',
};

export function formatarData(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

function obterMensagemErro(erro: unknown) {
  if (erro instanceof Error) {
    return erro.message;
  }

  return 'Ocorreu um erro inesperado.';
}

function obterCodigoErro(erro: unknown) {
  if (
    typeof erro === 'object' &&
    erro !== null &&
    'code' in erro &&
    typeof erro.code === 'string'
  ) {
    return erro.code;
  }

  return '';
}

export function usePerfil() {
  const [dadosSalvos, setDadosSalvos] = useState<DadosPerfil | null>(null);

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');

  const limparCamposSenha = useCallback(() => {
    setSenhaAtual('');
    setSenhaNova('');
    setSenhaConfirm('');
    setMostrarSenha(false);
  }, []);

  const carregarPerfil = useCallback(async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
      setDadosSalvos(null);
      setNome('');
      setDataNascimento('');
      setEmail('');
      setFoto('');
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);

      const perfilRef = doc(db, 'usuarios', usuario.uid);
      const fotoRef = doc(db, 'fotos', usuario.uid);

      const [perfilSnapshot, fotoSnapshot] = await Promise.all([
        getDoc(perfilRef),
        getDoc(fotoRef),
      ]);

      let perfil: DadosPerfil = {
        ...PERFIL_VAZIO,
        email: usuario.email ?? '',
      };

      if (perfilSnapshot.exists()) {
        const dados = perfilSnapshot.data();

        perfil = {
          nome: dados.nome ?? '',
          dataNascimento: dados.dataNascimento ?? '',
          email: dados.email ?? usuario.email ?? '',
        };
      }

      setDadosSalvos(perfil);
      setNome(perfil.nome);
      setDataNascimento(perfil.dataNascimento);
      setEmail(perfil.email);

      const imagemFirestore = fotoSnapshot.exists()
        ? fotoSnapshot.data().imagemBase64
        : null;

      if (
        typeof imagemFirestore === 'string' &&
        imagemFirestore.length > 0
      ) {
        setFoto(imagemFirestore);
      } else {
        const fotoLocal = await AsyncStorage.getItem(`foto_${usuario.uid}`);
        setFoto(fotoLocal ?? '');
      }
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void carregarPerfil();
      limparCamposSenha();
    }, [carregarPerfil, limparCamposSenha]),
  );

  const alterarDataNascimento = useCallback((valor: string) => {
    setDataNascimento(formatarData(valor));
  }, []);

  const alternarCamposSenha = useCallback(() => {
    setMostrarSenha(valorAtual => {
      if (valorAtual) {
        setSenhaAtual('');
        setSenhaNova('');
        setSenhaConfirm('');
      }

      return !valorAtual;
    });
  }, []);

  const cancelar = useCallback(() => {
    if (dadosSalvos) {
      setNome(dadosSalvos.nome);
      setDataNascimento(dadosSalvos.dataNascimento);
      setEmail(dadosSalvos.email);
    }

    limparCamposSenha();
  }, [dadosSalvos, limparCamposSenha]);

  function validarPerfil() {
    if (!nome.trim()) {
      return 'Informe o seu nome.';
    }

    if (!email.trim()) {
      return 'Informe o seu e-mail.';
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValido.test(email.trim())) {
      return 'Informe um e-mail válido.';
    }

    if (
      dataNascimento &&
      !/^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento)
    ) {
      return 'Informe a data de nascimento no formato DD/MM/AAAA.';
    }

    const desejaAlterarSenha =
      mostrarSenha && Boolean(senhaAtual || senhaNova || senhaConfirm);

    if (desejaAlterarSenha) {
      if (!senhaAtual) {
        return 'Informe sua senha atual para alterar a senha.';
      }

      if (!senhaNova) {
        return 'Informe a nova senha.';
      }

      if (senhaNova.length < 6) {
        return 'A nova senha deve ter pelo menos 6 caracteres.';
      }

      if (senhaNova !== senhaConfirm) {
        return 'A nova senha e a confirmação não coincidem.';
      }
    }

    return null;
  }

  const salvarPerfil = useCallback(async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert('Atenção', 'É necessário estar autenticado para salvar o perfil.');
      return;
    }

    const erroValidacao = validarPerfil();
    if (erroValidacao) {
      Alert.alert('Atenção', erroValidacao);
      return;
    }

    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();
    const emailAtual = usuario.email?.toLowerCase() ?? '';

    const emailFoiAlterado = emailTratado !== emailAtual;
    const senhaFoiPreenchida =
      mostrarSenha && Boolean(senhaAtual && senhaNova && senhaConfirm);

    try {
      setSalvando(true);

      // Reautentica se houver senha atual informada para alteração segura
      if (senhaAtual && usuario.email) {
        const credencial = EmailAuthProvider.credential(usuario.email, senhaAtual);
        await reauthenticateWithCredential(usuario, credencial);
      }

      // Atualiza e-mail no Authentication
      if (emailFoiAlterado) {
        try {
          await updateEmail(usuario, emailTratado);
        } catch (eAuth: any) {
          // Se exigir verificação prévia conforme SDKs novos
          if (verifyBeforeUpdateEmail) {
            await verifyBeforeUpdateEmail(usuario, emailTratado);
            Alert.alert(
              'Confirmação enviada',
              'Um link de verificação foi enviado para o novo e-mail para confirmar a alteração.',
            );
          } else {
            throw eAuth;
          }
        }
      }

      // Atualiza senha no Authentication se preenchida
      if (senhaFoiPreenchida) {
        await updatePassword(usuario, senhaNova);
      }

      // Atualiza Firestore no documento do usuário
      await setDoc(
        doc(db, 'usuarios', usuario.uid),
        {
          nome: nomeTratado,
          dataNascimento,
          email: emailTratado,
          atualizadoEm: serverTimestamp(),
        },
        { merge: true },
      );

      await notificarAdmin({
        titulo: 'Perfil Atualizado',
        descricao: `${nomeTratado} concluiu a atualização dos dados de perfil.`,
        tipo: 'perfil',
      });
      
      const novosDadosSalvos: DadosPerfil = {
        nome: nomeTratado,
        dataNascimento,
        email: emailTratado,
      };

      setNome(nomeTratado);
      setEmail(emailTratado);
      setDadosSalvos(novosDadosSalvos);
      limparCamposSenha();

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (erro) {
      const codigo = obterCodigoErro(erro);
      console.error('Erro ao salvar perfil:', erro);

      if (
        codigo === 'auth/wrong-password' ||
        codigo === 'auth/invalid-credential' ||
        codigo === 'auth/invalid-login-credentials'
      ) {
        Alert.alert('Erro', 'Senha atual incorreta.');
        return;
      }

      if (codigo === 'auth/requires-recent-login') {
        Alert.alert(
          'Erro',
          'Por segurança, informe sua senha atual para alterar o e-mail ou a senha.',
        );
        return;
      }

      if (codigo === 'auth/email-already-in-use') {
        Alert.alert('Erro', 'Este e-mail já está sendo utilizado por outra conta.');
        return;
      }

      if (codigo === 'auth/invalid-email') {
        Alert.alert('Erro', 'O e-mail informado é inválido.');
        return;
      }

      if (codigo === 'auth/weak-password') {
        Alert.alert('Erro', 'A nova senha é muito fraca. Utilize pelo menos 6 caracteres.');
        return;
      }

      Alert.alert('Erro', obterMensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  }, [
    nome,
    dataNascimento,
    email,
    mostrarSenha,
    senhaAtual,
    senhaNova,
    senhaConfirm,
    limparCamposSenha,
  ]);

  const escolherFoto = useCallback(async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
      Alert.alert('Atenção', 'É necessário estar autenticado para alterar a foto.');
      return;
    }

    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para escolher uma foto.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,
        base64: true,
      });

      if (resultado.canceled) {
        return;
      }

      const imagem = resultado.assets[0];

      if (!imagem.base64) {
        Alert.alert('Erro', 'Não foi possível processar a imagem selecionada.');
        return;
      }

      setCarregandoFoto(true);

      const extensaoUri = imagem.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const formato = extensaoUri === 'jpg' ? 'jpeg' : extensaoUri;
      const base64Final = `data:image/${formato};base64,${imagem.base64}`;

      setFoto(base64Final);

      await Promise.all([
        AsyncStorage.setItem(`foto_${usuario.uid}`, base64Final),
        setDoc(
          doc(db, 'fotos', usuario.uid),
          {
            usuarioId: usuario.uid,
            imagemBase64: base64Final,
            atualizadoEm: serverTimestamp(),
          },
          { merge: true },
        ),
      ]);

      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (erro) {
      console.error('Erro ao salvar foto:', erro);
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    } finally {
      setCarregandoFoto(false);
    }
  }, []);

  return {
    dadosSalvos,
    nome,
    setNome,
    dataNascimento,
    setDataNascimento,
    alterarDataNascimento,
    email,
    setEmail,
    foto,
    carregando,
    carregandoFoto,
    salvando,
    mostrarSenha,
    setMostrarSenha,
    alternarCamposSenha,
    senhaAtual,
    setSenhaAtual,
    senhaNova,
    setSenhaNova,
    senhaConfirm,
    setSenhaConfirm,
    carregarPerfil,
    escolherFoto,
    salvarPerfil,
    cancelar,
  };
}