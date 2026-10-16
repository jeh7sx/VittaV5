import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  User,
  signOut,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { registrarLog } from '../utils/logs';
import { limparCPF, formatarCPF } from '../utils/cadCpf';
import { CamposErro } from '../types/cadastro';
import { notificarAdmin } from '@/utils/notificacaoAdmin';

function exibirAlerta(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}: ${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
}

// Vincula automaticamente convites pendentes feitos para este email
async function processarConvitesPendentes(uid: string, email: string, nomeUsuario: string) {
  try {
    const emailLimpo = email.trim().toLowerCase();
    const qConvites = query(
      collection(db, 'convites_responsaveis'),
      where('emailDestino', '==', emailLimpo),
      where('status', '==', 'pendente')
    );

    const convitesSnap = await getDocs(qConvites);
    if (convitesSnap.empty) return;

    for (const conviteDoc of convitesSnap.docs) {
      const convite = conviteDoc.data();
      const filhoRef = doc(db, 'filhos', convite.filhoId);

      await updateDoc(filhoRef, {
        responsaveisIds: arrayUnion(uid),
        [`permissoesResponsaveis.${uid}`]: {
          parentesco: convite.parentescoSugerido || 'outro',
          papel: convite.papel || 'editor',
          nome: nomeUsuario,
          email: emailLimpo,
          adicionadoEm: new Date().toISOString(),
        },
      });

      await updateDoc(conviteDoc.ref, {
        status: 'aceito',
        aceitoEm: serverTimestamp(),
        aceitoPorUid: uid,
      });
    }
  } catch (e) {
    console.error('Erro ao processar convites vinculados:', e);
  }
}

export function useAuth() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<CamposErro>({});

  function alternarVisibilidadeSenha() {
    setMostrarSenha((s) => !s);
  }

  function limparErro(campo: keyof CamposErro) {
    setErros((errosAtuais) => {
      const copia = { ...errosAtuais };
      if (campo in copia) delete copia[campo];
      return copia;
    });
  }

  function validarCamposCadastro(): boolean {
    const novosErros: CamposErro = {};
    const nomeFormatado = nome.trim();
    const emailFormatado = email.trim().toLowerCase();
    const cpfLimpo = limparCPF(cpf);

    if (!nomeFormatado) novosErros.nome = 'Informe seu nome completo.';
    if (!cpfLimpo) {
      novosErros.cpf = 'Informe seu CPF.';
    } else if (cpfLimpo.length !== 11) {
      novosErros.cpf = 'CPF inválido. Digite os 11 números.';
    }

    if (!emailFormatado) {
      novosErros.email = 'Informe seu email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado)) {
      novosErros.email = 'Digite um email válido.';
    }

    if (!senha) {
      novosErros.senha = 'Crie uma senha.';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = 'Confirme sua senha.';
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = 'As senhas não coincidem.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function signIn() {
    if (carregando) return;

    const loginFormatado = login.trim();

    if (!loginFormatado || !senha) {
      exibirAlerta('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      setCarregando(true);

      let emailLocal = loginFormatado.toLowerCase();

      if (!emailLocal.includes('@')) {
        const cpfLimpo = limparCPF(loginFormatado);

        if (cpfLimpo.length !== 11) {
          exibirAlerta('Erro', 'Digite um CPF válido com 11 números.');
          return;
        }

        const consultaCPF = query(
          collection(db, 'usuarios'),
          where('cpf', '==', cpfLimpo),
        );

        const resultado = await getDocs(consultaCPF);

        if (resultado.empty) {
          exibirAlerta('Erro', 'CPF não encontrado.');
          return;
        }

        const dadosUsuario = resultado.docs[0].data();
        const emailEncontrado = dadosUsuario.email;

        if (typeof emailEncontrado !== 'string' || !emailEncontrado.trim()) {
          exibirAlerta('Erro', 'O usuário não possui um email válido cadastrado.');
          return;
        }

        emailLocal = emailEncontrado.trim().toLowerCase();
      }

      const credencial = await signInWithEmailAndPassword(
        auth,
        emailLocal,
        senha,
      );

      const uid = credencial.user.uid;

      // 1. Checa status no painel Admin
      try {
        const adminRef = doc(db, 'admins', uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          const dadosAdmin = adminSnap.data();

          if (dadosAdmin.status === 'bloqueado') {
            await signOut(auth);
            exibirAlerta('Acesso Bloqueado', 'Seu acesso administrativo foi suspenso.');
            await registrarLog(uid, 'ADMIN_LOGIN_BLOQUEADO', 'Tentativa de login de admin bloqueado');
            return;
          }

          try {
            await registrarLog(uid, 'Login Admin', 'Administrador logado.');
          } catch (e) { }

          router.replace('/dashboard');
          return;
        }
      } catch (e) {
        console.error('Erro ao verificar permissão do admin:', e);
      }

      // 2. Checa status de Usuário Comum
      try {
        const usuarioRef = doc(db, 'usuarios', uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
          const dados = usuarioSnap.data();
          if (dados.status && dados.status !== 'ativo') {
            await signOut(auth);
            exibirAlerta('Acesso negado', 'Seu usuário está inativo ou bloqueado.');
            await registrarLog(uid, 'LOGIN_BLOQUEADO', 'Tentativa de login por usuário inativo');
            return;
          }

          // Processa convites recebidos por esse e-mail
          await processarConvitesPendentes(uid, emailLocal, dados.nome || 'Usuário');
        }
      } catch (e) {
        console.error('Erro ao verificar status do usuário:', e);
      }

      try {
        await registrarLog(uid, 'Login', 'Usuário realizou login.');
      } catch (erroLog) { }

      router.replace('/visaoGeral');
    } catch (erro: unknown) {
      console.error('Erro ao realizar login:', erro);
      exibirAlerta('Erro', 'Email/CPF ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  async function signUp() {
    if (carregando) return;
    if (!validarCamposCadastro()) return;

    let usuarioCriadoNoAuth: User | null = null;

    try {
      setCarregando(true);
      const nomeFormatado = nome.trim();
      const emailFormatado = email.trim().toLowerCase();
      const cpfLimpo = limparCPF(cpf);

      const cpfRef = doc(db, 'cpfs', cpfLimpo);
      const cpfSnap = await getDoc(cpfRef);

      if (cpfSnap.exists()) {
        setErros((errosAtuais) => ({
          ...errosAtuais,
          cpf: 'Este CPF já está cadastrado.',
        }));
        return;
      }

      const credencial = await createUserWithEmailAndPassword(auth, emailFormatado, senha);
      usuarioCriadoNoAuth = credencial.user;

      await notificarAdmin({
        titulo: 'Novo Usuário Cadastrado',
        descricao: `${nome} criou uma nova conta na plataforma.`,
        tipo: 'usuario',
      });

      const uid = credencial.user.uid;
      const batch = writeBatch(db);

      batch.set(doc(db, 'usuarios', uid), {
        uid,
        nome: nomeFormatado,
        cpf: cpfLimpo,
        email: emailFormatado,
        status: 'ativo',
        criadoEm: serverTimestamp(),
      });

      batch.set(doc(db, 'cpfs', cpfLimpo), {
        uid,
        criadoEm: serverTimestamp(),
      });

      await batch.commit();

      // Processa convites pendentes recebidos previamente para este email
      await processarConvitesPendentes(uid, emailFormatado, nomeFormatado);

      try {
        await registrarLog(uid, 'Cadastro', 'Usuário realizou cadastro.');
      } catch (e) { }

      if (Platform.OS === 'web') {
        window.alert('Conta criada com sucesso!');
        router.replace('/login');
      } else {
        Alert.alert('Sucesso', 'Conta criada com sucesso!', [
          { text: 'Entrar', onPress: () => router.replace('/login') },
        ]);
      }
    } catch (erro: any) {
      console.error('Erro no cadastro:', erro);
      if (erro?.code === 'auth/email-already-in-use') {
        setErros((prev) => ({ ...prev, email: 'Este email já está cadastrado.' }));
        return;
      }
      if (usuarioCriadoNoAuth) {
        await deleteUser(usuarioCriadoNoAuth).catch(() => { });
      }
      exibirAlerta('Erro', 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return {
    login,
    setLogin,
    senha,
    setSenha,
    mostrarSenha,
    setMostrarSenha,
    alternarVisibilidadeSenha,
    signIn,

    nome,
    setNome,
    cpf,
    setCpf: (v: string) => setCpf(formatarCPF(v)),
    email,
    setEmail,
    confirmarSenha,
    setConfirmarSenha,
    mostrarConfirmarSenha,
    setMostrarConfirmarSenha,
    carregando,
    erros,
    limparErro,
    signUp,
  };
}