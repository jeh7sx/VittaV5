import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../services/firebase';
import { notificarAdmin } from '../utils/notificacaoAdmin';
import {
  ConviteResponsavel,
  ParentescoResponsavel,
} from '../types/convites';

function exibirAlerta(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}: ${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
}

export function useConvites(filhoId?: string) {
  const usuario = auth.currentUser;

  const [convitesRecebidos, setConvitesRecebidos] = useState<ConviteResponsavel[]>([]);
  const [convitesPendentesDoFilho, setConvitesPendentesDoFilho] = useState<ConviteResponsavel[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Escuta convites pendentes recebidos pelo e-mail do usuário autenticado
  useEffect(() => {
    if (!usuario?.email) {
      setConvitesRecebidos([]);
      return;
    }

    const emailFormatado = usuario.email.trim().toLowerCase();
    const q = query(
      collection(db, 'convites_responsaveis'),
      where('emailDestino', '==', emailFormatado),
      where('status', '==', 'pendente')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista: ConviteResponsavel[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as ConviteResponsavel));
        setConvitesRecebidos(lista);
      },
      (erro) => console.error('Erro ao buscar convites recebidos:', erro)
    );

    return () => unsub();
  }, [usuario?.email]);

  // Escuta convites pendentes enviados para este dependente
  useEffect(() => {
    if (!filhoId) {
      setConvitesPendentesDoFilho([]);
      return;
    }

    const q = query(
      collection(db, 'convites_responsaveis'),
      where('filhoId', '==', filhoId),
      where('status', '==', 'pendente')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista: ConviteResponsavel[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as ConviteResponsavel));
        setConvitesPendentesDoFilho(lista);
      },
      (erro) => console.error('Erro ao buscar convites do filho:', erro)
    );

    return () => unsub();
  }, [filhoId]);

  // Disparar convite
  const enviarConvite = useCallback(
    async ({
      filhoIdAlvo,
      nomeFilho,
      emailDestino,
      parentesco,
    }: {
      filhoIdAlvo: string;
      nomeFilho: string;
      emailDestino: string;
      parentesco: ParentescoResponsavel;
    }) => {
      if (!usuario) return;

      const emailTratado = emailDestino.trim().toLowerCase();
      if (!emailTratado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTratado)) {
        exibirAlerta('E-mail Inválido', 'Informe um endereço de e-mail válido.');
        return;
      }

      if (emailTratado === usuario.email?.toLowerCase()) {
        exibirAlerta('Atenção', 'Você não pode enviar um convite para você mesmo.');
        return;
      }

      try {
        setEnviando(true);

        const filhoRef = doc(db, 'filhos', filhoIdAlvo);
        const filhoSnap = await getDoc(filhoRef);

        if (!filhoSnap.exists()) {
          exibirAlerta('Erro', 'Dependente não encontrado.');
          return;
        }

        const dadosFilho = filhoSnap.data();
        const listaIds: string[] = dadosFilho.responsaveisIds || [dadosFilho.responsavelId];

        let nomeRemetente = usuario.displayName || 'Responsável Titular';
        const userDoc = await getDoc(doc(db, 'usuarios', usuario.uid));
        if (userDoc.exists() && userDoc.data().nome) {
          nomeRemetente = userDoc.data().nome;
        }

        // Verifica se já é responsável
        const usuariosComEmail = await getDocs(
          query(collection(db, 'usuarios'), where('email', '==', emailTratado))
        );

        if (!usuariosComEmail.empty) {
          const userConvidadoUid = usuariosComEmail.docs[0].id;
          if (listaIds.includes(userConvidadoUid)) {
            exibirAlerta('Atenção', 'Este usuário já é responsável por este dependente.');
            return;
          }
        }

        await addDoc(collection(db, 'convites_responsaveis'), {
          filhoId: filhoIdAlvo,
          nomeFilho,
          criadoPorUid: usuario.uid,
          nomeCriador: nomeRemetente,
          emailDestino: emailTratado,
          parentescoSugerido: parentesco,
          papel: 'editor',
          status: 'pendente',
          criadoEm: serverTimestamp(),
        });

        exibirAlerta(
          'Convite Enviado',
          `Convite enviado para ${emailTratado}. A pessoa receberá um aviso assim que entrar no Vitta.`
        );
      } catch (e: any) {
        console.error('Erro ao enviar convite:', e);
        exibirAlerta('Erro', e.message || 'Não foi possível enviar o convite.');
      } finally {
        setEnviando(false);
      }
    },
    [usuario]
  );

  // Cancelar convite pendente
  const cancelarConvite = useCallback(async (conviteId: string) => {
    try {
      setCarregando(true);
      await updateDoc(doc(db, 'convites_responsaveis', conviteId), {
        status: 'cancelado',
        canceladoEm: serverTimestamp(),
      });
      exibirAlerta('Sucesso', 'Convite cancelado.');
    } catch (e: any) {
      exibirAlerta('Erro', 'Não foi possível cancelar o convite.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Aceitar convite
  const aceitarConvite = useCallback(
    async (convite: ConviteResponsavel) => {
      if (!usuario) return;

      try {
        setCarregando(true);
        const filhoRef = doc(db, 'filhos', convite.filhoId);
        const conviteRef = doc(db, 'convites_responsaveis', convite.id);

        const filhoSnap = await getDoc(filhoRef);
        if (!filhoSnap.exists()) {
          exibirAlerta('Erro', 'Este dependente não está mais disponível.');
          await updateDoc(conviteRef, { status: 'recusado' });
          return;
        }

        let nomeUsuario = usuario.displayName || 'Responsável';
        const userDoc = await getDoc(doc(db, 'usuarios', usuario.uid));
        if (userDoc.exists() && userDoc.data().nome) {
          nomeUsuario = userDoc.data().nome;
        }

        await updateDoc(filhoRef, {
          responsaveisIds: arrayUnion(usuario.uid),
          [`permissoesResponsaveis.${usuario.uid}`]: {
            parentesco: convite.parentescoSugerido,
            papel: 'editor',
            nome: nomeUsuario,
            email: usuario.email || '',
            adicionadoEm: new Date().toISOString(),
          },
        });

        await updateDoc(conviteRef, {
          status: 'aceito',
          aceitoEm: serverTimestamp(),
          aceitoPorUid: usuario.uid,
        });

        await notificarAdmin({
          titulo: 'Novo Responsável Vinculado',
          descricao: `${usuario.email} agora é responsável por ${convite.nomeFilho}.`,
          tipo: 'filho',
        });

        exibirAlerta('Sucesso', `Você agora é um dos responsáveis por ${convite.nomeFilho}!`);
      } catch (e: any) {
        console.error('Erro ao aceitar convite:', e);
        exibirAlerta('Erro', 'Não foi possível aceitar o convite.');
      } finally {
        setCarregando(false);
      }
    },
    [usuario]
  );

  // Recusar convite
  const recusarConvite = useCallback(async (conviteId: string) => {
    try {
      setCarregando(true);
      await updateDoc(doc(db, 'convites_responsaveis', conviteId), {
        status: 'recusado',
        recusadoEm: serverTimestamp(),
      });
      exibirAlerta('Convite Recusado', 'O convite foi recusado.');
    } catch (e: any) {
      exibirAlerta('Erro', 'Não foi possível recusar o convite.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // 1. Passar titularidade garantindo que NENHUM dos dois saia da lista de responsáveis
  const transferirTitularidade = useCallback(
    async (filhoIdAlvo: string, novoTitularUid: string, meuUid: string) => {
      try {
        setCarregando(true);
        const filhoRef = doc(db, 'filhos', filhoIdAlvo);

        // Atualiza titular principal E garante que ambos permaneçam em responsaveisIds
        await updateDoc(filhoRef, {
          responsavelId: novoTitularUid,
          responsaveisIds: arrayUnion(meuUid, novoTitularUid),
          [`permissoesResponsaveis.${novoTitularUid}.papel`]: 'admin',
          [`permissoesResponsaveis.${meuUid}.papel`]: 'editor',
        });

        exibirAlerta('Sucesso', 'Titularidade transferida! Você continua acompanhando o dependente normalmente como co-responsável.');
      } catch (e) {
        console.error('Erro ao transferir titularidade:', e);
        exibirAlerta('Erro', 'Não foi possível transferir a titularidade.');
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  // 2. Remover co-responsável
  const removerResponsavel = useCallback(
    async (filhoIdAlvo: string, uidAlvo: string) => {
      try {
        setCarregando(true);
        const filhoRef = doc(db, 'filhos', filhoIdAlvo);

        await updateDoc(filhoRef, {
          responsaveisIds: arrayRemove(uidAlvo),
          [`permissoesResponsaveis.${uidAlvo}`]: deleteField(),
        });

        exibirAlerta('Sucesso', 'Responsável removido da gestão da criança.');
      } catch (e) {
        exibirAlerta('Erro', 'Não foi possível remover o responsável.');
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  return {
    convitesRecebidos,
    convitesPendentesDoFilho,
    carregando,
    enviando,
    enviarConvite,
    cancelarConvite,
    aceitarConvite,
    recusarConvite,
    transferirTitularidade,
    removerResponsavel,
  };
}