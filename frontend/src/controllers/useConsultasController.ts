import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useConsultas, StatusConsulta } from '../hooks/useConsultas';

export function useConsultasController() {
  const router = useRouter();
  const consultasData = useConsultas();

  // Estados locais da interface
  const [fotoVisualizando, setFotoVisualizando] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | StatusConsulta>('Todos');

  const [modalCalendario, setModalCalendario] = useState<{
    visivel: boolean;
    isEdit: boolean;
  }>({
    visivel: false,
    isEdit: false,
  });

  // Filtros de exibição
  const consultasFiltradas =
    filtroStatus === 'Todos'
      ? consultasData.consultas
      : consultasData.consultas.filter((item) => item.status === filtroStatus);

  function fecharMenus() {
    consultasData.setPopoverStatus(null);
    consultasData.setMenuOpcoes(null);
  }

  function aplicarDataSelecionada(dataStr: string) {
    if (modalCalendario.isEdit) {
      consultasData.setEditDataConsulta(dataStr);
    } else {
      consultasData.setDataConsulta(dataStr);
    }
    setModalCalendario({ visivel: false, isEdit: false });
  }

  function navegarParaConsultas() {
    consultasData.setModalSucessoVisivel(false);
    router.push('/(user)/consultas');
  }

  return {
    ...consultasData,
    filtroStatus,
    setFiltroStatus,
    fotoVisualizando,
    setFotoVisualizando,
    modalCalendario,
    setModalCalendario,
    consultasFiltradas,
    fecharMenus,
    aplicarDataSelecionada,
    navegarParaConsultas,
  };
}