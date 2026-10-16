import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UsuarioDashboard, FilhoDashboard, ExameDashboard, StatusDia } from '../types/visaoGeral';

export interface EventoDia {
  id: string;
  tipo: 'exame' | 'medicamento' | 'consulta';
  titulo: string;
  subtitulo?: string;
  dosagem?: string;
  frequencia?: string;
  nomeFilho?: string;
  filhoId?: string;
  data: string; // Formato DD/MM/AAAA
  horario?: string;
  status?: string;
  concluido?: boolean;
}

function normalizarDataParaPtBr(valorData: any): string {
  if (!valorData) return '';

  if (valorData?.toDate && typeof valorData.toDate === 'function') {
    const d = valorData.toDate();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  if (typeof valorData === 'string') {
    const limpo = valorData.trim();
    if (limpo.includes('/')) {
      const p = limpo.split('/');
      if (p.length === 3) {
        return `${String(p[0]).padStart(2, '0')}/${String(p[1]).padStart(2, '0')}/${p[2]}`;
      }
    }
    if (limpo.includes('-')) {
      const p = limpo.split('-');
      if (p.length === 3) {
        const ano = p[0];
        const mes = p[1];
        const dia = p[2].slice(0, 2);
        return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
      }
    }
    const d = new Date(limpo);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }

  if (valorData instanceof Date && !isNaN(valorData.getTime())) {
    return `${String(valorData.getDate()).padStart(2, '0')}/${String(valorData.getMonth() + 1).padStart(2, '0')}/${valorData.getFullYear()}`;
  }

  return '';
}

function gerarDosesDoMedicamento(medicamento: any, nomeFilhoPadrao?: string): EventoDia[] {
  const doses: EventoDia[] = [];
  const dtInicioStr = normalizarDataParaPtBr(medicamento.dataInicio || medicamento.data || medicamento.criadoEm);
  if (!dtInicioStr || !medicamento.horario) return doses;

  const [diaI, mesI, anoI] = dtInicioStr.split('/').map(Number);
  const [horaI, minI] = medicamento.horario.split(':').map(Number);

  let doseAtual = new Date(anoI, mesI - 1, diaI, horaI || 0, minI || 0);

  let fimTratamento = new Date(doseAtual);
  fimTratamento.setDate(fimTratamento.getDate() + 60);

  const dtTerminoStr = normalizarDataParaPtBr(medicamento.dataTermino);
  if (dtTerminoStr) {
    const [diaT, mesT, anoT] = dtTerminoStr.split('/').map(Number);
    const dataFim = new Date(anoT, mesT - 1, diaT, 23, 59, 59);
    if (dataFim < fimTratamento) fimTratamento = dataFim;
  }

  let addHoras = 0;
  let addDias = 0;
  const match = (medicamento.frequencia || '').match(/(\d+)\s*(.*)/);

  if (match) {
    const qtd = parseInt(match[1], 10);
    const und = match[2]?.trim();
    if (und === 'Horas') addHoras = qtd;
    else if (und === 'Dias') addDias = qtd;
    else if (und === 'Semanas') addDias = qtd * 7;
    else addDias = 1;
  } else {
    addDias = 1;
  }

  if (addHoras === 0 && addDias === 0) addDias = 1;

  const fId = medicamento.filhoId || medicamento.criancaId || '';
  const dosesTomadasArray: number[] = medicamento.dosesTomadas || [];

  while (doseAtual <= fimTratamento && doses.length < 500) {
    const timeDose = doseAtual.getTime();
    const jaTomou = dosesTomadasArray.includes(timeDose) || medicamento.status === 'Concluído';

    doses.push({
      id: `${medicamento.id}-${timeDose}`,
      tipo: 'medicamento',
      titulo: medicamento.nomeMedicamento || medicamento.nome || 'Medicamento',
      subtitulo: medicamento.dosagem || '',
      dosagem: medicamento.dosagem || '',
      frequencia: medicamento.frequencia || '',
      nomeFilho: medicamento.nomeFilho || nomeFilhoPadrao,
      filhoId: fId,
      data: `${String(doseAtual.getDate()).padStart(2, '0')}/${String(doseAtual.getMonth() + 1).padStart(2, '0')}/${doseAtual.getFullYear()}`,
      horario: `${String(doseAtual.getHours()).padStart(2, '0')}:${String(doseAtual.getMinutes()).padStart(2, '0')}`,
      status: jaTomou ? 'Concluído' : (medicamento.status || 'Ativo'),
      concluido: jaTomou,
    });

    if (addHoras > 0) {
      doseAtual.setHours(doseAtual.getHours() + addHoras);
    } else {
      doseAtual.setDate(doseAtual.getDate() + addDias);
    }
  }

  return doses;
}

export function useVisaoGeral() {
  const [usuario, setUsuario] = useState<UsuarioDashboard | null>(null);
  const [foto, setFoto] = useState('');

  const [totalFilhos, setTotalFilhos] = useState(0);
  const [totalExames, setTotalExames] = useState(0);
  const [examesConcluidos, setExamesConcluidos] = useState(0);

  const [totalMedicamentos, setTotalMedicamentos] = useState(0);
  const [medicamentosConcluidos, setMedicamentosConcluidos] = useState(0);

  const [totalConsultas, setTotalConsultas] = useState(0);
  const [consultasConcluidas, setConsultasConcluidas] = useState(0);

  const [todosExames, setTodosExames] = useState<ExameDashboard[]>([]);
  const [todosEventos, setTodosEventos] = useState<EventoDia[]>([]);
  const [listaFilhos, setListaFilhos] = useState<FilhoDashboard[]>([]);
  const [filhosFiltradosIds, setFilhosFiltradosIds] = useState<string[]>([]);

  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(new Date().getDate());

  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const hoje = useMemo(() => new Date(), []);

  const eventosFiltrados = useMemo(() => {
    return todosEventos.filter((ev) => {
      if (!ev.filhoId) return true;
      if (filhosFiltradosIds.length === 0) return true;
      return filhosFiltradosIds.includes(ev.filhoId);
    });
  }, [todosEventos, filhosFiltradosIds]);

  function eventoPertenceAoDia(dataStr: string, dia: number): boolean {
    if (!dataStr) return false;
    const partes = dataStr.split('/');
    if (partes.length !== 3) return false;

    const diaEv = Number(partes[0]);
    const mesEv = Number(partes[1]);
    const anoEv = Number(partes[2]);

    return (
      diaEv === dia &&
      mesEv === mesAtual.getMonth() + 1 &&
      anoEv === mesAtual.getFullYear()
    );
  }

  const eventosDoDia = useMemo(() => {
    if (diaSelecionado === null) return [];
    return eventosFiltrados.filter((ev) => eventoPertenceAoDia(ev.data, diaSelecionado));
  }, [diaSelecionado, eventosFiltrados, mesAtual]);

  const carregarDashboardCompleto = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setCarregando(false);
      return;
    }

    try {
      setCarregando(true);
      setErroCarregamento(null);

      // 1. Busca os filhos aos quais o usuário tem acesso (array ou legado)
      const [snapFilhosArray, snapFilhosLegado] = await Promise.all([
        getDocs(query(collection(db, 'filhos'), where('responsaveisIds', 'array-contains', user.uid))),
        getDocs(query(collection(db, 'filhos'), where('responsavelId', '==', user.uid))),
      ]);

      const mapaFilhos = new Map<string, FilhoDashboard>();
      [...snapFilhosArray.docs, ...snapFilhosLegado.docs].forEach((d) => {
        mapaFilhos.set(d.id, { id: d.id, ...d.data() } as FilhoDashboard);
      });

      const filhosMapeados = Array.from(mapaFilhos.values());
      const idsDosFilhos = filhosMapeados.map((f) => f.id);

      const nomesFilhosMap: Record<string, string> = {};
      filhosMapeados.forEach((f) => {
        nomesFilhosMap[f.id] = f.nome || 'Sem nome';
      });

      // 2. Busca exames, medicamentos, consultas, dados do usuário e foto
      const [snapExames, snapMedicamentos, snapConsultas, dadosUsuario, dadosFoto] = await Promise.all([
        getDocs(collection(db, 'exames')),
        getDocs(collection(db, 'medicamentos')),
        getDocs(collection(db, 'consultas')),
        getDoc(doc(db, 'usuarios', user.uid)),
        getDoc(doc(db, 'fotos', user.uid)),
      ]);

      // Filtra apenas eventos pertencentes às crianças daquele responsável
      const pertenceAoResponsavel = (item: any) => {
        const fId = item.filhoId || item.criancaId;
        return (
          item.responsavelId === user.uid ||
          (fId && idsDosFilhos.includes(fId))
        );
      };

      const listaEventos: EventoDia[] = [];

      // Exames
      let cExames = 0;
      const examesFiltrados: ExameDashboard[] = [];

      snapExames.docs.forEach((d) => {
        const data = d.data();
        if (!pertenceAoResponsavel(data)) return;

        const fId = data.filhoId || data.criancaId || '';
        const dtNorm = normalizarDataParaPtBr(data.dataExame || data.data || data.dataColeta || data.criadoEm);
        const ehConcluido = data.status === 'concluido' || !!data.concluido;
        if (ehConcluido) cExames++;

        examesFiltrados.push({ id: d.id, ...data } as ExameDashboard);

        listaEventos.push({
          id: d.id,
          tipo: 'exame',
          titulo: data.titulo || data.nomeExame || 'Exame',
          subtitulo: data.local || data.laboratorio || data.descricao,
          nomeFilho: data.nomeFilho || (fId ? nomesFilhosMap[fId] : undefined),
          filhoId: fId,
          data: dtNorm,
          horario: data.horario || data.hora,
          status: data.status || (ehConcluido ? 'concluido' : 'agendado'),
          concluido: ehConcluido,
        });
      });

      // Medicamentos
      let cMeds = 0;
      let totalMedsCount = 0;

      snapMedicamentos.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        if (!pertenceAoResponsavel(data)) return;

        totalMedsCount++;
        const fId = (data as any).filhoId || (data as any).criancaId || '';
        const ehConcluido = (data as any).tomado || (data as any).status === 'concluido' || (data as any).status === 'Concluído';
        if (ehConcluido) cMeds++;

        const dosesCalculadas = gerarDosesDoMedicamento(data, fId ? nomesFilhosMap[fId] : undefined);
        listaEventos.push(...dosesCalculadas);
      });

      // Consultas
      let cCons = 0;
      let totalConsultasCount = 0;

      snapConsultas.docs.forEach((d) => {
        const data = d.data();
        if (!pertenceAoResponsavel(data)) return;

        totalConsultasCount++;
        const fId = data.filhoId || data.criancaId || '';
        const dtNorm = normalizarDataParaPtBr(data.dataConsulta || data.data || data.criadoEm);
        const ehConcluido = data.status === 'concluido' || !!data.realizada;
        if (ehConcluido) cCons++;

        listaEventos.push({
          id: d.id,
          tipo: 'consulta',
          titulo: data.especialidade || data.medico || data.titulo || 'Consulta Médica',
          subtitulo: data.local || data.clinica || data.medico,
          nomeFilho: data.nomeFilho || (fId ? nomesFilhosMap[fId] : undefined),
          filhoId: fId,
          data: dtNorm,
          horario: data.horario || data.hora,
          status: data.status || (ehConcluido ? 'concluido' : 'agendado'),
          concluido: ehConcluido,
        });
      });

      setTotalFilhos(filhosMapeados.length);
      setTotalExames(examesFiltrados.length);
      setExamesConcluidos(cExames);

      setTotalMedicamentos(totalMedsCount);
      setMedicamentosConcluidos(cMeds);

      setTotalConsultas(totalConsultasCount);
      setConsultasConcluidas(cCons);

      setListaFilhos(filhosMapeados);
      setTodosExames(examesFiltrados);
      setTodosEventos(listaEventos);

      setFilhosFiltradosIds((idsAtuais) => {
        if (idsAtuais.length > 0) return idsAtuais;
        return filhosMapeados.map((filho) => filho.id);
      });

      if (dadosUsuario.exists()) {
        setUsuario(dadosUsuario.data() as UsuarioDashboard);
      }
      if (dadosFoto.exists() && dadosFoto.data().imagemBase64) {
        setFoto(dadosFoto.data().imagemBase64);
      }
    } catch (erro) {
      console.error('Erro ao carregar visão geral:', erro);
      setErroCarregamento('Não foi possível carregar os dados.');
    } finally {
      setCarregando(false);
    }
  }, []);

  function alternarFiltroFilho(id: string) {
    setFilhosFiltradosIds((idsAtuais) => {
      if (idsAtuais.includes(id)) {
        return idsAtuais.filter((filhoId) => filhoId !== id);
      }
      return [...idsAtuais, id];
    });
  }

  function obterNomeMes(data: Date): string {
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  function mesAnterior() {
    setMesAtual((ant) => {
      const n = new Date(ant);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
    setDiaSelecionado(null);
  }

  function proximoMes() {
    setMesAtual((ant) => {
      const n = new Date(ant);
      n.setMonth(n.getMonth() + 1);
      return n;
    });
    setDiaSelecionado(null);
  }

  function gerarDiasCalendario(data: Date): Array<number | null> {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const dias: Array<number | null> = [];
    for (let i = 0; i < primeiroDia.getDay(); i++) {
      dias.push(null);
    }
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(dia);
    }
    return dias;
  }

  function temEventoNoDia(dia: number): boolean {
    return eventosFiltrados.some((ev) => eventoPertenceAoDia(ev.data, dia));
  }

  function obterTiposNoDia(dia: number) {
    const evs = eventosFiltrados.filter((ev) => eventoPertenceAoDia(ev.data, dia));
    return {
      temMedicamento: evs.some((e) => e.tipo === 'medicamento'),
      temConsulta: evs.some((e) => e.tipo === 'consulta'),
      temExame: evs.some((e) => e.tipo === 'exame'),
      total: evs.length,
    };
  }

  useEffect(() => {
    carregarDashboardCompleto();
  }, [carregarDashboardCompleto]);

  return {
    usuario,
    foto,
    totalFilhos,
    totalExames,
    examesConcluidos,
    totalMedicamentos,
    medicamentosConcluidos,
    totalConsultas,
    consultasConcluidas,
    eventosFiltrados,
    eventosDoDia,
    listaFilhos,
    filhosFiltradosIds,
    mesAtual,
    diaSelecionado,
    hoje,
    modalFiltroVisivel,
    carregando,
    erroCarregamento,
    carregarDashboardCompleto,
    alternarFiltroFilho,
    setModalFiltroVisivel,
    obterNomeMes,
    mesAnterior,
    proximoMes,
    gerarDiasCalendario,
    temEventoNoDia,
    obterTiposNoDia,
    selecionarDia: (dia: number) => setDiaSelecionado(dia),
  };
}