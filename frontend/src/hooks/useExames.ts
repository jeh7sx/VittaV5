import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useFilho } from '../context/FilhoContext';
import { auth, db } from '../services/firebase';
import { registrarLog } from '../utils/logs';
import { criarNotificacao } from '../utils/notificacao';
import { useHeaderSearch } from './useHeaderSearch';

export type StatusExame = 'Ativo' | 'Concluído' | 'Atrasado';

export interface Exame {
  id: string;
  titulo: string;
  descricao: string;
  nomeDoutor: string;
  nomeFilho: string;
  filhoId: string;
  dataExame: string;
  horario: string;
  turno: string;
  hospital: string;
  hospitalPlaceId?: string;
  hospitalLat?: number;
  hospitalLng?: number;
  status: StatusExame;
  fotos: string[];
}

export interface PlaceSuggestion {
  description: string;
  place_id: string;
}

export function formatarData(valor: string) {
  const n = valor.replace(/\D/g, '');
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
}

export function formatarHorario(valor: string) {
  const n = valor.replace(/\D/g, '');
  if (n.length <= 2) return n;
  return `${n.slice(0, 2)}:${n.slice(2, 4)}`;
}

export function calcularTurno(horario: string): string {
  const match = horario.match(/^(\d{1,2}):/);
  if (!match) return '';
  const hora = parseInt(match[1], 10);
  if (hora >= 5 && hora < 12) return 'Manhã';
  if (hora >= 12 && hora < 18) return 'Tarde';
  return 'Noite';
}

export const ICONE_TURNO: Record<string, any> = {
  Manhã: require('@/img/icons/SunDim.svg'),
  Tarde: require('@/img/icons/haze.svg'),
  Noite: require('@/img/icons/moon-02.svg'),
};

export const COR_STATUS: Record<StatusExame, { bg: string; text: string; border: string }> = {
  Ativo: { bg: '#EAF4FF', text: '#1A73E8', border: '#B3D4FF' },
  Concluído: { bg: '#E6F9EE', text: '#1E8C45', border: '#A3D9B8' },
  Atrasado: { bg: '#FFF0F0', text: '#D93025', border: '#FFBBBB' },
};

export const ICONE_STATUS: Record<StatusExame, any> = {
  Ativo: require('@/img/icons/ativo.svg'),
  Concluído: require('@/img/icons/check.svg'),
  Atrasado: require('@/img/icons/atrasado.svg'),
};

function normalizarStatus(valor: unknown): StatusExame {
  if (valor === 'Concluído' || valor === 'ConcluÃ­do') return 'Concluído';
  if (valor === 'Atrasado') return 'Atrasado';
  return 'Ativo';
}

export const MAX_FOTO_SIZE = 150 * 1024;
export const MAX_FOTOS = 3;
export const GOOGLE_MAPS_API_KEY = 'SUA_CHAVE_AQUI';
export const PREVIEW_LIMIT = 3;
export const BREAKPOINT = 768;

export function useExames() {
  const { filhoSelecionado } = useFilho();
  const { width } = useWindowDimensions();
  const isNarrow = width < BREAKPOINT;
  const usuario = auth.currentUser;

  const [exames, setExames] = useState<Exame[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Hook reutilizável de busca e ordenação
  const { headerProps, listaFiltrada: examesFiltrados, termoBusca } = useHeaderSearch(exames, {
    obterCamposTexto: (e) => [
      e.titulo,
      e.nomeDoutor,
      e.dataExame,
      e.horario,
      e.hospital,
      e.descricao,
      e.turno,
    ],
    obterTituloParaOrdem: (e) => e.titulo,
    obterData: (e) => e.dataExame,
  });

  // Expansão das seções
  const [todosAberto, setTodosAberto] = useState(true);
  const [todosExpandido, setTodosExpandido] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState<Record<StatusExame, boolean>>({
    Ativo: true,
    Concluído: true,
    Atrasado: true,
  });
  const [secaoExpandida, setSecaoExpandida] = useState<Record<StatusExame, boolean>>({
    Ativo: false,
    Concluído: false,
    Atrasado: false,
  });

  const [popoverStatus, setPopoverStatus] = useState<string | null>(null);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVerMais, setModalVerMais] = useState<Exame | null>(null);
  const [menuOpcoes, setMenuOpcoes] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState(false);

  // Form cadastro
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [hospital, setHospital] = useState('');
  const [hospitalPlaceId, setHospitalPlaceId] = useState('');
  const [hospitalLat, setHospitalLat] = useState<number | null>(null);
  const [hospitalLng, setHospitalLng] = useState<number | null>(null);
  const [dataExame, setDataExame] = useState('');
  const [horario, setHorario] = useState('');
  const [nomeDoutor, setNomeDoutor] = useState('');
  const [statusForm, setStatusForm] = useState<StatusExame>('Ativo');
  const [fotosForm, setFotosForm] = useState<string[]>([]);
  const [sugestoes, setSugestoes] = useState<PlaceSuggestion[]>([]);
  const [buscandoPlaces, setBuscandoPlaces] = useState(false);

  // Form edição
  const [exameEditando, setExameEditando] = useState<Exame | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editHospitalPlaceId, setEditHospitalPlaceId] = useState('');
  const [editHospitalLat, setEditHospitalLat] = useState<number | null>(null);
  const [editHospitalLng, setEditHospitalLng] = useState<number | null>(null);
  const [editData, setEditData] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editNomeDoutor, setEditNomeDoutor] = useState('');
  const [editStatus, setEditStatus] = useState<StatusExame>('Ativo');
  const [editFotos, setEditFotos] = useState<string[]>([]);
  const [editSugestoes, setEditSugestoes] = useState<PlaceSuggestion[]>([]);
  const [editBuscandoPlaces, setEditBuscandoPlaces] = useState(false);

  useEffect(() => {
    if (!usuario || !filhoSelecionado) {
      setExames([]);
      setCarregando(false);
      return;
    }

    const q = query(
      collection(db, 'exames'),
      // where('responsavelId', '==', usuario.uid),
      where('filhoId', '==', filhoSelecionado.id)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista: Exame[] = snap.docs
          .map((d) => ({
            id: d.id,
            titulo: d.data().titulo ?? '',
            descricao: d.data().descricao ?? '',
            nomeDoutor: d.data().nomeDoutor ?? '',
            nomeFilho: d.data().nomeFilho ?? '',
            filhoId: d.data().filhoId ?? '',
            dataExame: d.data().dataExame ?? '',
            horario: d.data().horario ?? '',
            turno: d.data().turno ?? '',
            hospital: d.data().hospital ?? '',
            hospitalPlaceId: d.data().hospitalPlaceId ?? '',
            hospitalLat: d.data().hospitalLat ?? null,
            hospitalLng: d.data().hospitalLng ?? null,
            status: normalizarStatus(d.data().status),
            fotos: d.data().fotos ?? [],
          }))
          .sort((a, b) => {
            const toMs = (s: string) => {
              const [dd, mm, yyyy] = s.split('/');
              return new Date(`${yyyy}-${mm}-${dd}`).getTime();
            };
            return toMs(b.dataExame) - toMs(a.dataExame);
          });
        setExames(lista);
        setCarregando(false);
      },
      (err) => {
        console.error(err);
        setCarregando(false);
      }
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [filhoSelecionado, usuario]);

  const contadores = useMemo(() => ({
    Todos: examesFiltrados.length,
    Ativo: examesFiltrados.filter((e) => e.status === 'Ativo').length,
    Concluído: examesFiltrados.filter((e) => e.status === 'Concluído').length,
    Atrasado: examesFiltrados.filter((e) => e.status === 'Atrasado').length,
  }), [examesFiltrados]);

  const examesPorStatus: Record<StatusExame, Exame[]> = useMemo(() => ({
    Ativo: examesFiltrados.filter((e) => e.status === 'Ativo'),
    Concluído: examesFiltrados.filter((e) => e.status === 'Concluído'),
    Atrasado: examesFiltrados.filter((e) => e.status === 'Atrasado'),
  }), [examesFiltrados]);

  const alterarStatus = useCallback(async (id: string, novoStatus: StatusExame) => {
    try {
      await updateDoc(doc(db, 'exames', id), { status: novoStatus });
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setPopoverStatus(null);
    }
  }, []);

  const buscarPlaces = useCallback(async (texto: string, isEdit = false) => {
    if (texto.length < 3) {
      isEdit ? setEditSugestoes([]) : setSugestoes([]);
      return;
    }
    isEdit ? setEditBuscandoPlaces(true) : setBuscandoPlaces(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        texto
      )}&types=hospital|health&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
      const json = await (await fetch(url)).json();
      const sugs: PlaceSuggestion[] = (json.predictions ?? []).map((p: any) => ({
        description: p.description,
        place_id: p.place_id,
      }));
      isEdit ? setEditSugestoes(sugs) : setSugestoes(sugs);
    } catch {
      isEdit ? setEditSugestoes([]) : setSugestoes([]);
    } finally {
      isEdit ? setEditBuscandoPlaces(false) : setBuscandoPlaces(false);
    }
  }, []);

  const selecionarPlace = useCallback(async (place: PlaceSuggestion, isEdit = false) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`;
      const json = await (await fetch(url)).json();
      const loc = json.result?.geometry?.location;
      if (isEdit) {
        setEditHospital(place.description);
        setEditHospitalPlaceId(place.place_id);
        setEditHospitalLat(loc?.lat ?? null);
        setEditHospitalLng(loc?.lng ?? null);
        setEditSugestoes([]);
      } else {
        setHospital(place.description);
        setHospitalPlaceId(place.place_id);
        setHospitalLat(loc?.lat ?? null);
        setHospitalLng(loc?.lng ?? null);
        setSugestoes([]);
      }
    } catch { }
  }, []);

  const comprimirImagem = useCallback(async (uri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'web') {
        const img = new window.Image();
        img.onload = () => {
          const MAX = 800;
          let { width, height } = img;
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.8;
          let base64 = canvas.toDataURL('image/jpeg', quality);
          while (base64.length > 200 * 1024 * 1.37 && quality > 0.2) {
            quality -= 0.1;
            base64 = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(base64);
        };
        img.onerror = reject;
        img.src = uri;
      } else {
        import('expo-image-manipulator').then(({ manipulateAsync, SaveFormat }) => {
          manipulateAsync(uri, [{ resize: { width: 800 } }], {
            compress: 0.7,
            format: SaveFormat.JPEG,
            base64: true,
          })
            .then((result) => {
              resolve(`data:image/jpeg;base64,${result.base64}`);
            })
            .catch(reject);
        });
      }
    });
  }, []);

  const escolherFoto = useCallback(async (fotos: string[], setFotos: (f: string[]) => void) => {
    if (fotos.length >= MAX_FOTOS) {
      Alert.alert('Limite', `Máximo de ${MAX_FOTOS} fotos.`);
      return;
    }

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file: File = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const uri = ev.target!.result as string;
            const compressed = await comprimirImagem(uri);
            setFotos([...fotos, compressed]);
          } catch {
            Alert.alert('Erro', 'Não foi possível processar a imagem.');
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: false,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets[0]) return;

      try {
        const compressed = await comprimirImagem(result.assets[0].uri);
        setFotos([...fotos, compressed]);
      } catch {
        Alert.alert('Erro', 'Não foi possível comprimir a imagem.');
      }
    }
  }, [comprimirImagem]);

  const removerFoto = useCallback((index: number, fotos: string[], setFotos: (f: string[]) => void) => {
    setFotos(fotos.filter((_, i) => i !== index));
  }, []);

  const substituirFoto = useCallback(async (
    index: number,
    fotos: string[],
    setFotos: (f: string[]) => void
  ) => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file: File = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const uri = ev.target!.result as string;
            const compressed = await comprimirImagem(uri);
            const novas = [...fotos];
            novas[index] = compressed;
            setFotos(novas);
          } catch {
            Alert.alert('Erro', 'Não foi possível processar a imagem.');
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: false,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets[0]) return;
      try {
        const compressed = await comprimirImagem(result.assets[0].uri);
        const novas = [...fotos];
        novas[index] = compressed;
        setFotos(novas);
      } catch {
        Alert.alert('Erro', 'Não foi possível comprimir a imagem.');
      }
    }
  }, [comprimirImagem]);

  const limparFormCadastro = useCallback(() => {
    setTitulo('');
    setDescricao('');
    setHospital('');
    setHospitalPlaceId('');
    setHospitalLat(null);
    setHospitalLng(null);
    setDataExame('');
    setHorario('');
    setNomeDoutor('');
    setStatusForm('Ativo');
    setFotosForm([]);
    setSugestoes([]);
  }, []);

  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);

  const cadastrarExame = useCallback(async () => {
    if (!usuario || !filhoSelecionado) return;
    if (!titulo || !dataExame) {
      Alert.alert('Erro', 'Preencha título e data.');
      return;
    }
    try {
      await addDoc(collection(db, 'exames'), {
        titulo,
        descricao,
        dataExame,
        horario,
        turno: calcularTurno(horario),
        hospital,
        hospitalPlaceId,
        hospitalLat,
        hospitalLng,
        nomeDoutor,
        fotos: fotosForm,
        filhoId: filhoSelecionado.id,
        nomeFilho: filhoSelecionado.nome,
        responsavelId: usuario.uid,
        status: statusForm,
        criadoEm: serverTimestamp(),
      });
      await criarNotificacao(
        usuario.uid,
        filhoSelecionado.id,
        'Novo Exame',
        `${titulo} adicionado para ${filhoSelecionado.nome}.`
      );
      limparFormCadastro();
      setModalCadastro(false);
      // Aguarda a animação de saída do modal de cadastro antes de abrir o de sucesso
      setTimeout(() => {
        setModalSucessoVisivel(true);
      }, 300);
    } catch (erro: any) {
      await registrarLog(usuario?.uid || '', 'CADASTRO_EXAME', erro.message);
      Alert.alert('Erro', erro.message);
    }
  }, [usuario, filhoSelecionado, titulo, dataExame, descricao, horario, hospital, hospitalPlaceId, hospitalLat, hospitalLng, nomeDoutor, fotosForm, statusForm, limparFormCadastro]);

  const abrirEditar = useCallback((exame: Exame) => {
    setExameEditando(exame);
    setEditTitulo(exame.titulo);
    setEditDescricao(exame.descricao);
    setEditHospital(exame.hospital);
    setEditHospitalPlaceId(exame.hospitalPlaceId ?? '');
    setEditHospitalLat(exame.hospitalLat ?? null);
    setEditHospitalLng(exame.hospitalLng ?? null);
    setEditData(exame.dataExame);
    setEditHorario(exame.horario);
    setEditNomeDoutor(exame.nomeDoutor);
    setEditStatus(exame.status);
    setEditFotos(exame.fotos ?? []);
    setEditSugestoes([]);
    setMenuOpcoes(null);
    setModalEditar(true);
  }, []);

  const salvarEdicao = useCallback(async () => {
    if (!exameEditando) return;
    try {
      await updateDoc(doc(db, 'exames', exameEditando.id), {
        titulo: editTitulo,
        descricao: editDescricao,
        dataExame: editData,
        horario: editHorario,
        turno: calcularTurno(editHorario),
        hospital: editHospital,
        hospitalPlaceId: editHospitalPlaceId,
        hospitalLat: editHospitalLat,
        hospitalLng: editHospitalLng,
        nomeDoutor: editNomeDoutor,
        status: editStatus,
        fotos: editFotos,
      });
      setModalEditar(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  }, [exameEditando, editTitulo, editDescricao, editData, editHorario, editHospital, editHospitalPlaceId, editHospitalLat, editHospitalLng, editNomeDoutor, editStatus, editFotos]);

  const confirmarExclusao = useCallback((id: string) => {
    setMenuOpcoes(null);

    if (Platform.OS === 'web') {
      const aceitou = window.confirm('Tem certeza que deseja excluir este exame?');
      if (aceitou) {
        deleteDoc(doc(db, 'exames', id)).catch((e: any) =>
          alert('Erro ao excluir: ' + e.message)
        );
      }
      return;
    }

    Alert.alert('Excluir exame', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'exames', id));
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  }, []);

  return {
    filhoSelecionado,
    width,
    isNarrow,
    usuario,
    exames: examesFiltrados,
    carregando,
    contadores,
    examesPorStatus,
    termoBusca,
    headerProps,

    todosAberto, setTodosAberto,
    todosExpandido, setTodosExpandido,
    secaoAberta, setSecaoAberta,
    secaoExpandida, setSecaoExpandida,

    popoverStatus, setPopoverStatus,
    modalCadastro, setModalCadastro,
    modalEditar, setModalEditar,
    modalVerMais, setModalVerMais,
    menuOpcoes, setMenuOpcoes,
    tooltipInfo, setTooltipInfo,

    titulo, setTitulo,
    descricao, setDescricao,
    hospital, setHospital,
    hospitalPlaceId, setHospitalPlaceId,
    hospitalLat, setHospitalLat,
    hospitalLng, setHospitalLng,
    dataExame, setDataExame,
    horario, setHorario,
    nomeDoutor, setNomeDoutor,
    statusForm, setStatusForm,
    fotosForm, setFotosForm,
    sugestoes, setSugestoes,
    buscandoPlaces, setBuscandoPlaces,

    exameEditando, setExameEditando,
    editTitulo, setEditTitulo,
    editDescricao, setEditDescricao,
    editHospital, setEditHospital,
    editHospitalPlaceId, setEditHospitalPlaceId,
    editHospitalLat, setEditHospitalLat,
    editHospitalLng, setEditHospitalLng,
    editData, setEditData,
    editHorario, setEditHorario,
    editNomeDoutor, setEditNomeDoutor,
    editStatus, setEditStatus,
    editFotos, setEditFotos,
    editSugestoes, setEditSugestoes,
    editBuscandoPlaces, setEditBuscandoPlaces,

    alterarStatus,
    buscarPlaces,
    selecionarPlace,
    comprimirImagem,
    escolherFoto,
    removerFoto,
    substituirFoto,
    modalSucessoVisivel, setModalSucessoVisivel,
    cadastrarExame,
    limparFormCadastro,
    abrirEditar,
    salvarEdicao,
    confirmarExclusao,
  };
}