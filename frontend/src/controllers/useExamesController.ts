import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useExames, StatusExame } from '../hooks/useExames';

export function useExamesController() {
  const router = useRouter();
  const examesData = useExames();

  // Estados locais da interface
  const [fotoVisualizando, setFotoVisualizando] = useState<string | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<'Todos' | StatusExame>('Todos');
  const [listaExpandida, setListaExpandida] = useState(false);

  const [modalCalendario, setModalCalendario] = useState<{
    visivel: boolean;
    isEdit: boolean;
  }>({
    visivel: false,
    isEdit: false,
  });

  // Filtros de exibição
  const examesFiltrados =
    abaSelecionada === 'Todos'
      ? examesData.exames
      : examesData.examesPorStatus[abaSelecionada];

  const examesVisiveis = listaExpandida
    ? examesFiltrados
    : examesFiltrados.slice(0, 3); // PREVIEW_LIMIT

  function fecharMenus() {
    examesData.setPopoverStatus(null);
    examesData.setMenuOpcoes(null);
  }

  function aplicarDataSelecionada(dataStr: string) {
    if (modalCalendario.isEdit) {
      examesData.setEditData(dataStr);
    } else {
      examesData.setDataExame(dataStr);
    }
    setModalCalendario({ visivel: false, isEdit: false });
  }

  function navegarParaExames() {
    examesData.setModalSucessoVisivel(false);
    router.push('/(user)/exames');
  }

  return {
    ...examesData,
    abaSelecionada,
    setAbaSelecionada,
    listaExpandida,
    setListaExpandida,
    fotoVisualizando,
    setFotoVisualizando,
    modalCalendario,
    setModalCalendario,
    examesFiltrados,
    examesVisiveis,
    fecharMenus,
    aplicarDataSelecionada,
    navegarParaExames,
  };
}