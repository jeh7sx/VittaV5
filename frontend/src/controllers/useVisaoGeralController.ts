import { useState, useMemo } from 'react';
import { useVisaoGeral, EventoDia } from '../hooks/useVisaoGeral';
import { useFilhos } from '../hooks/useFilhos';
import { colors } from '@/styles/colors';

export type TipoPeriodo = 'hoje' | 'amanha' | 'semana' | 'mes' | 'personalizado';

export const OPCOES_PERIODO: { id: TipoPeriodo; rotulo: string }[] = [
  { id: 'hoje', rotulo: 'Hoje' },
  { id: 'amanha', rotulo: 'Amanhã' },
  { id: 'semana', rotulo: 'Esta semana' },
  { id: 'mes', rotulo: 'Este mês' },
  { id: 'personalizado', rotulo: 'Período personalizado' },
];

export function obterStatusDoBanco(ev: EventoDia): 'concluido' | 'atrasado' | 'hoje' | 'agendado' | 'cancelado' {
  const statusBanco = (ev.status || '').toLowerCase().trim();

  if (
    statusBanco === 'concluido' ||
    statusBanco === 'concluído' ||
    statusBanco === 'tomado' ||
    statusBanco === 'realizado' ||
    statusBanco === 'finalizado'
  ) {
    return 'concluido';
  }

  if (statusBanco === 'atrasado' || statusBanco === 'expirado') {
    return 'atrasado';
  }

  if (statusBanco === 'cancelado') {
    return 'cancelado';
  }

  if (statusBanco === 'hoje') {
    return 'hoje';
  }

  if (ev.data && typeof ev.data === 'string') {
    const partes = ev.data.split('/');
    if (partes.length === 3) {
      const dataEv = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
      dataEv.setHours(0, 0, 0, 0);

      const dataHoje = new Date();
      dataHoje.setHours(0, 0, 0, 0);

      if (dataEv < dataHoje) return 'atrasado';
      if (dataEv.getTime() === dataHoje.getTime()) return 'hoje';
    }
  }

  return 'agendado';
}

export function parseDataPtBr(dataStr: string): Date | null {
  if (!dataStr) return null;
  const p = dataStr.split('/');
  if (p.length !== 3) return null;
  return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]), 12, 0, 0);
}

export function formatarDataExtenso(dataStr: string): string {
  const dt = parseDataPtBr(dataStr);
  if (!dt) return dataStr || '—';
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${String(dt.getDate()).padStart(2, '0')} ${meses[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatarDateParaPtBr(date: Date): string {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function useVisaoGeralController() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<TipoPeriodo>('hoje');
  const [modalDataPersonalizada, setModalDataPersonalizada] = useState(false);

  const [dataInicioPers, setDataInicioPers] = useState<Date>(new Date());
  const [dataFimPers, setDataFimPers] = useState<Date>(new Date());

  const [dataInicioStr, setDataInicioStr] = useState<string>(formatarDateParaPtBr(new Date()));
  const [dataFimStr, setDataFimStr] = useState<string>(formatarDateParaPtBr(new Date()));

  const [modalCalendario, setModalCalendario] = useState<{
    visivel: boolean;
    campo: 'inicio' | 'fim' | null;
  }>({ visivel: false, campo: null });

  const [abaAdesao, setAbaAdesao] = useState<'medicamentos' | 'consultas' | 'exames'>('medicamentos');

  const { eventosFiltrados, hoje, carregarDashboardCompleto } = useVisaoGeral();
  const { filhoAtual, carregando } = useFilhos();

  const eventosDoFilhoAtual = useMemo(() => {
    if (!filhoAtual) return [];
    return eventosFiltrados.filter((ev) => {
      const idDoFilhoNoEvento = (ev as any).filhoId || (ev as any).idFilho;
      return idDoFilhoNoEvento ? String(idDoFilhoNoEvento) === String(filhoAtual.id) : true;
    });
  }, [eventosFiltrados, filhoAtual]);

  const eventosPorPeriodo = useMemo(() => {
    const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);

    return eventosDoFilhoAtual.filter((ev) => {
      const dt = parseDataPtBr(ev.data);
      if (!dt) return false;

      if (periodoSelecionado === 'hoje') {
        return (
          dt.getDate() === hojeZero.getDate() &&
          dt.getMonth() === hojeZero.getMonth() &&
          dt.getFullYear() === hojeZero.getFullYear()
        );
      }

      if (periodoSelecionado === 'amanha') {
        const amanhaZero = new Date(hojeZero);
        amanhaZero.setDate(hojeZero.getDate() + 1);
        return (
          dt.getDate() === amanhaZero.getDate() &&
          dt.getMonth() === amanhaZero.getMonth() &&
          dt.getFullYear() === amanhaZero.getFullYear()
        );
      }

      if (periodoSelecionado === 'semana') {
        const primeiroDiaSemana = new Date(hojeZero);
        primeiroDiaSemana.setDate(hojeZero.getDate() - hojeZero.getDay());
        const ultimoDiaSemana = new Date(primeiroDiaSemana);
        ultimoDiaSemana.setDate(primeiroDiaSemana.getDate() + 6);
        ultimoDiaSemana.setHours(23, 59, 59);

        return dt >= primeiroDiaSemana && dt <= ultimoDiaSemana;
      }

      if (periodoSelecionado === 'mes') {
        return (
          dt.getMonth() === hojeZero.getMonth() &&
          dt.getFullYear() === hojeZero.getFullYear()
        );
      }

      if (periodoSelecionado === 'personalizado') {
        const dIni = new Date(dataInicioPers.getFullYear(), dataInicioPers.getMonth(), dataInicioPers.getDate(), 0, 0, 0);
        const dFim = new Date(dataFimPers.getFullYear(), dataFimPers.getMonth(), dataFimPers.getDate(), 23, 59, 59);
        return dt.getTime() >= dIni.getTime() && dt.getTime() <= dFim.getTime();
      }

      return true;
    });
  }, [eventosDoFilhoAtual, periodoSelecionado, hoje, dataInicioPers, dataFimPers]);

  const metricas = useMemo(() => {
    const meds = eventosPorPeriodo.filter((e) => e.tipo === 'medicamento');
    const cons = eventosPorPeriodo.filter((e) => e.tipo === 'consulta');
    const exams = eventosPorPeriodo.filter((e) => e.tipo === 'exame');

    const medsConc = meds.filter((e) => e.concluido || obterStatusDoBanco(e) === 'concluido').length;
    const consConc = cons.filter((e) => e.concluido || obterStatusDoBanco(e) === 'concluido').length;
    const examsConc = exams.filter((e) => e.concluido || obterStatusDoBanco(e) === 'concluido').length;

    return {
      totalMeds: meds.length,
      medsConc,
      percMeds: meds.length > 0 ? Math.round((medsConc / meds.length) * 100) : 0,

      totalCons: cons.length,
      consConc,
      percCons: cons.length > 0 ? Math.round((consConc / cons.length) * 100) : 0,

      totalExams: exams.length,
      examsConc,
      percExams: exams.length > 0 ? Math.round((examsConc / exams.length) * 100) : 0,
    };
  }, [eventosPorPeriodo]);

  const configAdesao = {
    medicamentos: {
      total: metricas.totalMeds,
      concluidos: metricas.medsConc,
      porcentagem: metricas.percMeds,
      corFatia: colors.Med,
    },
    consultas: {
      total: metricas.totalCons,
      concluidos: metricas.consConc,
      porcentagem: metricas.percCons,
      corFatia: colors.Consul,
    },
    exames: {
      total: metricas.totalExams,
      concluidos: metricas.examsConc,
      porcentagem: metricas.percExams,
      corFatia: colors.Exame,
    },
  }[abaAdesao];

  const proximosEventos = useMemo(() => {
    const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return eventosDoFilhoAtual
      .filter((ev) => {
        const dt = parseDataPtBr(ev.data);
        if (!dt) return false;
        return dt >= hojeZero;
      })
      .sort((a, b) => {
        const dtA = parseDataPtBr(a.data)?.getTime() || 0;
        const dtB = parseDataPtBr(b.data)?.getTime() || 0;
        return dtA - dtB;
      })
      .slice(0, 4);
  }, [eventosDoFilhoAtual, hoje]);

  function selecionarPeriodo(id: TipoPeriodo) {
    setPeriodoSelecionado(id);
    if (id === 'personalizado') {
      setDataInicioStr(formatarDateParaPtBr(dataInicioPers));
      setDataFimStr(formatarDateParaPtBr(dataFimPers));
      setModalDataPersonalizada(true);
    }
  }

  function aplicarDataSelecionada(dataStr: string) {
    if (!modalCalendario.campo) return;
    if (modalCalendario.campo === 'inicio') {
      setDataInicioStr(dataStr);
    } else {
      setDataFimStr(dataStr);
    }
    setModalCalendario({ visivel: false, campo: null });
  }

  function aplicarFiltroPersonalizado() {
    const dIni = parseDataPtBr(dataInicioStr) || new Date();
    const dFim = parseDataPtBr(dataFimStr) || new Date();

    setDataInicioPers(new Date(dIni.getFullYear(), dIni.getMonth(), dIni.getDate(), 0, 0, 0));
    setDataFimPers(new Date(dFim.getFullYear(), dFim.getMonth(), dFim.getDate(), 23, 59, 59));
    setModalDataPersonalizada(false);
  }

  return {
    filhoAtual,
    carregando,
    periodoSelecionado,
    selecionarPeriodo,
    abaAdesao,
    setAbaAdesao,
    configAdesao,
    metricas,
    proximosEventos,
    modalDataPersonalizada,
    setModalDataPersonalizada,
    dataInicioStr,
    dataFimStr,
    modalCalendario,
    setModalCalendario,
    aplicarDataSelecionada,
    aplicarFiltroPersonalizado,
    carregarDashboardCompleto,
  };
}