import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface LogItem {
  id: string;
  tipo: string;
  mensagem: string;
  criadoEm?: any;
  usuarioId?: string;
  nomeUsuario?: string;
  cpfUsuario?: string;
  dataHoraFormatada?: string;
}

export type FiltroCategoriaLog = 'todos' | 'erros' | 'cadastros' | 'edicoes' | 'acessos';

function formatarDataHoraFirestore(valor: any): string {
  if (!valor) return 'Data não registada';

  let dateObj: Date | null = null;

  if (valor?.toDate && typeof valor.toDate === 'function') {
    dateObj = valor.toDate();
  } else if (valor?.seconds) {
    dateObj = new Date(valor.seconds * 1000);
  } else if (typeof valor === 'string') {
    const d = new Date(valor);
    if (!isNaN(d.getTime())) dateObj = d;
  }

  if (!dateObj) return String(valor);

  const dia = String(dateObj.getDate()).padStart(2, '0');
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const ano = dateObj.getFullYear();
  const hora = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const seg = String(dateObj.getSeconds()).padStart(2, '0');

  return `${dia}/${mes}/${ano} às ${hora}:${min}:${seg}`;
}

function formatarCPF(cpfLimpo?: string): string {
  if (!cpfLimpo) return '—';
  const nums = String(cpfLimpo).replace(/\D/g, '');
  if (nums.length !== 11) return cpfLimpo;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9, 11)}`;
}

export function useLogsController() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoriaLog>('todos');

  const carregarLogs = useCallback(async () => {
    try {
      setCarregando(true);

      // 1. Procura os logs e a lista de utilizadores em paralelo
      const [snapLogs, snapUsuarios] = await Promise.all([
        getDocs(query(collection(db, 'logs'), limit(150))),
        getDocs(collection(db, 'usuarios')),
      ]);

      // Mapeia utilizadores por ID para pesquisa rápida de nome e CPF
      const mapaUsuarios: Record<string, { nome: string; cpf?: string }> = {};
      snapUsuarios.docs.forEach((d) => {
        const dados = d.data();
        mapaUsuarios[d.id] = {
          nome: dados.nome || dados.displayName || 'Utilizador',
          cpf: dados.cpf || dados.documento || '',
        };
      });

      // 2. Associa cada log ao respetivo utilizador
      const lista = snapLogs.docs.map((docSnap) => {
        const data = docSnap.data();
        const uId = data.usuarioId || data.userId || '';
        const dadosUsuario = mapaUsuarios[uId];

        return {
          id: docSnap.id,
          tipo: data.tipo || 'INFO',
          mensagem: data.mensagem || 'Sem detalhes',
          criadoEm: data.criadoEm || data.timestamp,
          usuarioId: uId,
          nomeUsuario: dadosUsuario?.nome || (uId ? 'Utilizador não identificado' : 'Sistema'),
          cpfUsuario: formatarCPF(dadosUsuario?.cpf),
          dataHoraFormatada: formatarDataHoraFirestore(data.criadoEm || data.timestamp),
        } as LogItem;
      });

      // Ordena pelos mais recentes
      lista.sort((a, b) => {
        const timeA = a.criadoEm?.seconds || 0;
        const timeB = b.criadoEm?.seconds || 0;
        return timeB - timeA;
      });

      setLogs(lista);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);

  // Filtro dinâmico por texto e categoria
  const logsFiltrados = useMemo(() => {
    return logs.filter((item) => {
      const termo = termoBusca.toLowerCase().trim();

      const matchTexto =
        !termo ||
        item.tipo.toLowerCase().includes(termo) ||
        item.mensagem.toLowerCase().includes(termo) ||
        (item.nomeUsuario && item.nomeUsuario.toLowerCase().includes(termo)) ||
        (item.cpfUsuario && item.cpfUsuario.includes(termo));

      if (!matchTexto) return false;

      const tipoMin = item.tipo.toLowerCase();
      const msgMin = item.mensagem.toLowerCase();

      if (filtroCategoria === 'erros') {
        return tipoMin.includes('erro') || msgMin.includes('erro') || msgMin.includes('falha');
      }
      if (filtroCategoria === 'cadastros') {
        return tipoMin.includes('cadastro') || tipoMin.includes('novo') || msgMin.includes('adicion');
      }
      if (filtroCategoria === 'edicoes') {
        return tipoMin.includes('edicao') || tipoMin.includes('update') || msgMin.includes('altera');
      }
      if (filtroCategoria === 'acessos') {
        return tipoMin.includes('login') || tipoMin.includes('auth') || tipoMin.includes('acesso');
      }

      return true;
    });
  }, [logs, termoBusca, filtroCategoria]);

  const contadores = useMemo(() => {
    return {
      todos: logs.length,
      erros: logs.filter(
        (l) => l.tipo.toLowerCase().includes('erro') || l.mensagem.toLowerCase().includes('erro')
      ).length,
      cadastros: logs.filter(
        (l) => l.tipo.toLowerCase().includes('cadastro') || l.tipo.toLowerCase().includes('novo')
      ).length,
    };
  }, [logs]);

  return {
    logsFiltrados,
    carregando,
    termoBusca,
    setTermoBusca,
    filtroCategoria,
    setFiltroCategoria,
    contadores,
    recarregar: carregarLogs,
  };
}