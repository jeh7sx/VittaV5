import { useState } from 'react';
import { useRouter } from 'expo-router';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  useMedicamentos,
  calcularTurno,
  calcularStatusDinamico,
  type Medicamento,
  type StatusMedicamento,
} from '../hooks/useMedicamentos';

const OPCOES_UNIDADE_FREQ = ['Horas', 'Dias', 'Semanas', 'Personalizado'];

export function useMedicamentosController() {
  const router = useRouter();
  const medData = useMedicamentos() as any;

  // Controlos Locais de Frequência e Dosagem
  const [freqQtd, setFreqQtd] = useState(1);
  const [freqUnidade, setFreqUnidade] = useState('Horas');
  const [freqCustom, setFreqCustom] = useState('');

  const [editFreqQtd, setEditFreqQtd] = useState(1);
  const [editFreqUnidade, setEditFreqUnidade] = useState('Horas');
  const [editFreqCustom, setEditFreqCustom] = useState('');

  const [dosTipo, setDosTipo] = useState('Comprimido(s)');
  const [editDosTipo, setEditDosTipo] = useState('Comprimido(s)');

  const [dropdownAberto, setDropdownAberto] = useState<'freq' | 'dos' | null>(null);

  const [modalCalendario, setModalCalendario] = useState<{
    visivel: boolean;
    campo: 'inicio' | 'termino' | null;
    isEdit: boolean;
  }>({ visivel: false, campo: null, isEdit: false });

  const [fotoVisualizando, setFotoVisualizando] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | StatusMedicamento>('Todos');

  const [doseSelecionada, setDoseSelecionada] = useState<{
    dose: Date;
    medicamento: Medicamento;
    jaTomou: boolean;
  } | null>(null);

  const [salvandoDose, setSalvandoDose] = useState(false);

  const medicamentosFiltrados =
    filtroStatus === 'Todos'
      ? medData.medicamentos
      : medData.medicamentos.filter((item: Medicamento) => item.status === filtroStatus);

  function fecharMenus() {
    medData.setPopoverStatus(null);
    medData.setMenuOpcoes(null);
    setDropdownAberto(null);
  }

  function handleAbrirEditarCustom(item: Medicamento) {
    medData.abrirEditar(item);
    medData.setEditDataTermino(item.dataTermino || '');

    if (item.frequencia) {
      const match = item.frequencia.match(/(\d+)\s*(.*)/);
      if (match) {
        setEditFreqQtd(parseInt(match[1], 10) || 1);
        const und = match[2]?.trim();
        if (OPCOES_UNIDADE_FREQ.includes(und)) {
          setEditFreqUnidade(und);
        } else {
          setEditFreqUnidade('Personalizado');
          setEditFreqCustom(item.frequencia);
        }
      } else {
        setEditFreqUnidade('Personalizado');
        setEditFreqCustom(item.frequencia);
      }
    }
  }

  async function handleConfirmarAlteracaoDose() {
    if (!doseSelecionada) return;
    setSalvandoDose(true);

    const timestamp = doseSelecionada.dose.getTime();
    const medAtual = doseSelecionada.medicamento;
    const jaTomou = doseSelecionada.jaTomou;

    try {
      const tomadasAtuais = medAtual.dosesTomadas || [];
      const novasDoses = jaTomou
        ? tomadasAtuais.filter((t: number) => t !== timestamp)
        : [...tomadasAtuais, timestamp];

      const novoStatus = calcularStatusDinamico({
        ...medAtual,
        dosesTomadas: novasDoses,
      });

      const medRef = doc(db, 'medicamentos', medAtual.id);
      await updateDoc(medRef, {
        dosesTomadas: novasDoses,
        status: novoStatus,
        atualizadoEm: serverTimestamp(),
      });

      medData.setModalVerMais((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          dosesTomadas: novasDoses,
          status: novoStatus,
        };
      });
    } catch (err) {
      console.error('Erro ao alternar status da dose:', err);
    } finally {
      setSalvandoDose(false);
      setDoseSelecionada(null);
    }
  }

  function aplicarDataSelecionada(dataStr: string) {
    if (!modalCalendario.campo) return;
    if (modalCalendario.isEdit) {
      if (modalCalendario.campo === 'inicio') medData.setEditDataInicio(dataStr);
      else medData.setEditDataTermino(dataStr);
    } else {
      if (modalCalendario.campo === 'inicio') medData.setDataInicio(dataStr);
      else medData.setDataTermino(dataStr);
    }
    setModalCalendario({ visivel: false, campo: null, isEdit: false });
  }

  function navegarParaMedicamentos() {
    medData.setModalSucessoVisivel(false);
    router.push('/(user)/medicamentos');
  }

  return {
    ...medData,
    freqQtd,
    setFreqQtd,
    freqUnidade,
    setFreqUnidade,
    freqCustom,
    setFreqCustom,
    editFreqQtd,
    setEditFreqQtd,
    editFreqUnidade,
    setEditFreqUnidade,
    editFreqCustom,
    setEditFreqCustom,
    dosTipo,
    setDosTipo,
    editDosTipo,
    setEditDosTipo,
    dropdownAberto,
    setDropdownAberto,
    modalCalendario,
    setModalCalendario,
    fotoVisualizando,
    setFotoVisualizando,
    filtroStatus,
    setFiltroStatus,
    doseSelecionada,
    setDoseSelecionada,
    salvandoDose,
    medicamentosFiltrados,
    fecharMenus,
    handleAbrirEditarCustom,
    handleConfirmarAlteracaoDose,
    aplicarDataSelecionada,
    navegarParaMedicamentos,
  };
}