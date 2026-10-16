import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useFilho } from '../context/FilhoContext';
import { auth, db } from '../services/firebase';

export interface NotificacaoItem {
  id: string;
  titulo: string;
  mensagem: string;
  lida?: boolean;
  filhoId?: string;
  criadoEm?: any;
}

export type FiltroLido = 'todas' | 'nao_lidas' | 'lidas';

export function useNotificacoesController() {
  const [todasNotificacoes, setTodasNotificacoes] = useState<NotificacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroLido, setFiltroLido] = useState<FiltroLido>('todas');

  const { filhoSelecionado } = useFilho();

  async function carregarNotificacoes() {
    const usuario = auth.currentUser;
    if (!usuario) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'notificacoes'),
        where('responsavelId', '==', usuario.uid)
      );

      const resultado = await getDocs(q);
      const lista = resultado.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as NotificacaoItem[];

      setTodasNotificacoes(lista);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  // Filtra pelo filho selecionado
  const notificacoesDoFilho = useMemo(() => {
    if (!filhoSelecionado) return todasNotificacoes;
    return todasNotificacoes.filter(n => n.filhoId === filhoSelecionado.id);
  }, [todasNotificacoes, filhoSelecionado]);

  // Aplica o filtro de status de leitura
  const notificacoesExibidas = useMemo(() => {
    if (filtroLido === 'nao_lidas') {
      return notificacoesDoFilho.filter(n => !n.lida);
    }
    if (filtroLido === 'lidas') {
      return notificacoesDoFilho.filter(n => n.lida);
    }
    return notificacoesDoFilho;
  }, [notificacoesDoFilho, filtroLido]);

  const contadores = useMemo(() => {
    const naoLidas = notificacoesDoFilho.filter(n => !n.lida).length;
    return {
      todas: notificacoesDoFilho.length,
      naoLidas,
      lidas: notificacoesDoFilho.length - naoLidas,
    };
  }, [notificacoesDoFilho]);

  async function marcarComoLida(id: string) {
    try {
      const docRef = doc(db, 'notificacoes', id);
      await updateDoc(docRef, { lida: true });

      setTodasNotificacoes(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, lida: true } : notif))
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }

  async function marcarTodasComoLidas() {
    const pendentes = notificacoesDoFilho.filter(n => !n.lida);
    if (pendentes.length === 0) return;

    try {
      const batch = writeBatch(db);
      pendentes.forEach(notif => {
        const docRef = doc(db, 'notificacoes', notif.id);
        batch.update(docRef, { lida: true });
      });

      await batch.commit();

      const idsLidos = pendentes.map(n => n.id);
      setTodasNotificacoes(prev =>
        prev.map(notif => (idsLidos.includes(notif.id) ? { ...notif, lida: true } : notif))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }

  return {
    filhoSelecionado,
    loading,
    filtroLido,
    setFiltroLido,
    contadores,
    notificacoesExibidas,
    marcarComoLida,
    marcarTodasComoLidas,
    recarregar: carregarNotificacoes,
  };
}