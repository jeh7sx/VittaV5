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

export type StatusConsulta = 'Ativo' | 'Concluído' | 'Atrasado';

export interface Consulta {
  id: string;
  consulta: string;
  dataConsulta: string;
  horario: string;
  turno: string;
  hospital: string;
  hospitalPlaceId?: string;
  hospitalLat?: number;
  hospitalLng?: number;
  nomeMedico: string;
  descricao?: string;
  status: StatusConsulta;
  filhoId: string;
  nomeFilho: string;
  fotos: string[];
}

export interface PlaceSuggestion {
  description: string;
  place_id: string;
}

export const STATUS_CONSULTA: StatusConsulta[] = [
  'Ativo',
  'Concluído',
  'Atrasado',
];

export const COR_STATUS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Ativo: { bg: '#EAF4FF', text: '#1A73E8', border: '#B3D4FF' },
  Concluído: { bg: '#E6F9EE', text: '#1E8C45', border: '#A3D9B8' },
  Atrasado: { bg: '#FFF0F0', text: '#D93025', border: '#FFBBBB' },
};

export const ICONE_STATUS: Record<string, any> = {
  Ativo: require('@/img/icons/ativo.svg'),
  Concluído: require('@/img/icons/check.svg'),
  Atrasado: require('@/img/icons/atrasado.svg'),
};


export const ICONE_TURNO: Record<string, any> = {
  Manhã: require('@/img/icons/SunDim.svg'),
  Tarde: require('@/img/icons/haze.svg'),
  Noite: require('@/img/icons/moon-02.svg'),
};

export const MAX_FOTOS = 3;
export const GOOGLE_MAPS_API_KEY = 'SUA_CHAVE_AQUI';
export const PREVIEW_LIMIT = 3;
export const BREAKPOINT = 768;

export function formatarHorarioConsulta(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 4);
  if (numeros.length <= 2) return numeros;
  return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
}

export function formatarDataConsulta(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function calcularTurnoConsulta(horario: string) {
  const resultado = horario.match(/^(\d{1,2}):/);
  if (!resultado) return '';
  const hora = Number(resultado[1]);
  if (hora >= 5 && hora < 12) return 'Manhã';
  if (hora >= 12 && hora < 18) return 'Tarde';
  return 'Noite';
}

function normalizarStatus(valor: unknown): StatusConsulta {
  if (valor === 'Concluído' || valor === 'ConcluÃ­do') return 'Concluído';
  if (valor === 'Atrasado') return 'Atrasado';
  return 'Ativo';
}

export function useConsultas() {
  const { filhoSelecionado } = useFilho();
  const { width } = useWindowDimensions();
  const isNarrow = width < BREAKPOINT;
  const usuario = auth.currentUser;

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Hook reutilizável de busca e ordenação
  const { headerProps, listaFiltrada: consultasFiltradas, termoBusca } = useHeaderSearch(consultas, {
    obterCamposTexto: (c) => [
      c.consulta,
      c.nomeMedico,
      c.hospital,
      c.dataConsulta,
      c.horario,
      c.descricao,
      c.turno,
    ],
    obterTituloParaOrdem: (c) => c.consulta,
    obterData: (c) => c.dataConsulta,
  });

  // Seções expansíveis
  const [todosAberto, setTodosAberto] = useState(true);
  const [todosExpandido, setTodosExpandido] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState<Record<StatusConsulta, boolean>>({
    Ativo: true,
    Concluído: true,
    Atrasado: true,
  });
  const [secaoExpandida, setSecaoExpandida] = useState<Record<StatusConsulta, boolean>>({
    Ativo: false,
    Concluído: false,
    Atrasado: false,
  });

  // Modais e menus
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVerMais, setModalVerMais] = useState<Consulta | null>(null);
  const [popoverStatus, setPopoverStatus] = useState<string | null>(null);
  const [menuOpcoes, setMenuOpcoes] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState(false);

  // Form Cadastro
  const [consulta, setConsulta] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataConsulta, setDataConsulta] = useState('');
  const [horario, setHorario] = useState('');
  const [hospital, setHospital] = useState('');
  const [hospitalPlaceId, setHospitalPlaceId] = useState('');
  const [hospitalLat, setHospitalLat] = useState<number | null>(null);
  const [hospitalLng, setHospitalLng] = useState<number | null>(null);
  const [nomeMedico, setNomeMedico] = useState('');
  const [statusForm, setStatusForm] = useState<StatusConsulta>('Ativo');
  const [fotosForm, setFotosForm] = useState<string[]>([]);
  const [sugestoes, setSugestoes] = useState<PlaceSuggestion[]>([]);
  const [buscandoPlaces, setBuscandoPlaces] = useState(false);

  // Form Edição
  const [consultaEditando, setConsultaEditando] = useState<Consulta | null>(null);
  const [editConsulta, setEditConsulta] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editDataConsulta, setEditDataConsulta] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editHospitalPlaceId, setEditHospitalPlaceId] = useState('');
  const [editHospitalLat, setEditHospitalLat] = useState<number | null>(null);
  const [editHospitalLng, setEditHospitalLng] = useState<number | null>(null);
  const [editNomeMedico, setEditNomeMedico] = useState('');
  const [editStatus, setEditStatus] = useState<StatusConsulta>('Ativo');
  const [editFotos, setEditFotos] = useState<string[]>([]);
  const [editSugestoes, setEditSugestoes] = useState<PlaceSuggestion[]>([]);
  const [editBuscandoPlaces, setEditBuscandoPlaces] = useState(false);

  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);

  // Firestore Snapshot
  useEffect(() => {
    if (!usuario?.uid || !filhoSelecionado?.id) {
      setConsultas([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    const consultaFirestore = query(
      collection(db, 'consultas'),
      // where('responsavelId', '==', usuario.uid),
      where('filhoId', '==', filhoSelecionado.id),
    );

    const cancelarInscricao = onSnapshot(
      consultaFirestore,
      (snapshot) => {
        const lista = snapshot.docs.map((documento) => {
          const dados = documento.data();
          return {
            id: documento.id,
            consulta: dados.consulta ?? '',
            descricao: dados.descricao ?? '',
            dataConsulta: dados.dataConsulta ?? '',
            horario: dados.horario ?? '',
            turno: dados.turno ?? calcularTurnoConsulta(dados.horario ?? ''),
            hospital: dados.hospital ?? '',
            hospitalPlaceId: dados.hospitalPlaceId ?? '',
            hospitalLat: dados.hospitalLat ?? null,
            hospitalLng: dados.hospitalLng ?? null,
            nomeMedico: dados.nomeMedico ?? '',
            status: normalizarStatus(dados.status),
            filhoId: dados.filhoId ?? '',
            nomeFilho: dados.nomeFilho ?? '',
            fotos: dados.fotos ?? [],
          } as Consulta;
        });

        lista.sort((a, b) => {
          const toMs = (s: string) => {
            const [dd, mm, yyyy] = s.split('/');
            return new Date(`${yyyy}-${mm}-${dd}`).getTime();
          };
          return toMs(b.dataConsulta) - toMs(a.dataConsulta);
        });

        setConsultas(lista);
        setCarregando(false);
      },
      (erro) => {
        console.error('Erro ao consultar consultas:', erro);
        setConsultas([]);
        setCarregando(false);
        Alert.alert('Erro', 'Não foi possível carregar as consultas.');
      },
    );

    return () => {
      if (typeof cancelarInscricao === 'function') cancelarInscricao();
    };
  }, [usuario?.uid, filhoSelecionado?.id]);

  const contadores = useMemo(() => ({
    Todos: consultasFiltradas.length,
    Ativo: consultasFiltradas.filter((c) => c.status === 'Ativo').length,
    Concluído: consultasFiltradas.filter((c) => c.status === 'Concluído').length,
    Atrasado: consultasFiltradas.filter((c) => c.status === 'Atrasado').length,
  }), [consultasFiltradas]);

  const porStatus: Record<StatusConsulta, Consulta[]> = useMemo(() => ({
    Ativo: consultasFiltradas.filter((c) => c.status === 'Ativo'),
    Concluído: consultasFiltradas.filter((c) => c.status === 'Concluído'),
    Atrasado: consultasFiltradas.filter((c) => c.status === 'Atrasado'),
  }), [consultasFiltradas]);

  // Google Places
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

  // Compressão e fotos
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
    setConsulta('');
    setDescricao('');
    setDataConsulta('');
    setHorario('');
    setHospital('');
    setHospitalPlaceId('');
    setHospitalLat(null);
    setHospitalLng(null);
    setNomeMedico('');
    setStatusForm('Ativo');
    setFotosForm([]);
    setSugestoes([]);
  }, []);

  const cadastrarConsulta = useCallback(async () => {
    if (!usuario?.uid) {
      Alert.alert('Atenção', 'É necessário estar autenticado para cadastrar.');
      return;
    }
    if (!filhoSelecionado) {
      Alert.alert('Atenção', 'Selecione um filho antes de cadastrar a consulta.');
      return;
    }
    if (!consulta.trim() || !dataConsulta.trim() || !hospital.trim() || !nomeMedico.trim()) {
      Alert.alert('Atenção', 'Preencha o título da consulta, data, hospital e médico.');
      return;
    }

    try {
      setSalvando(true);
      await addDoc(collection(db, 'consultas'), {
        consulta: consulta.trim(),
        descricao: descricao.trim(),
        dataConsulta: dataConsulta.trim(),
        horario: horario.trim(),
        hospital: hospital.trim(),
        hospitalPlaceId,
        hospitalLat,
        hospitalLng,
        nomeMedico: nomeMedico.trim(),
        status: statusForm,
        fotos: fotosForm,
        turno: calcularTurnoConsulta(horario),
        filhoId: filhoSelecionado.id,
        nomeFilho: filhoSelecionado.nome,
        responsavelId: usuario.uid,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      try {
        await criarNotificacao(
          usuario.uid,
          filhoSelecionado.id,
          'Nova consulta',
          `${consulta.trim()} adicionada para ${filhoSelecionado.nome}.`,
        );
      } catch (erroNotificacao) {
        console.error('Erro ao criar notificação:', erroNotificacao);
      }

      limparFormCadastro();
      setModalCadastro(false);
      // Aguarda a animação de saída do modal de cadastro antes de abrir o de sucesso
      setTimeout(() => {
        setModalSucessoVisivel(true);
      }, 300);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível cadastrar a consulta.';
      try {
        await registrarLog(usuario.uid, 'CADASTRO_CONSULTA', mensagem);
      } catch (erroLog) {
        console.error('Erro ao registrar log:', erroLog);
      }
      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  }, [usuario?.uid, filhoSelecionado, consulta, descricao, dataConsulta, horario, hospital, hospitalPlaceId, hospitalLat, hospitalLng, nomeMedico, statusForm, fotosForm, limparFormCadastro]);

  const abrirEditar = useCallback((item: Consulta) => {
    setConsultaEditando(item);
    setEditConsulta(item.consulta);
    setEditDescricao(item.descricao ?? '');
    setEditDataConsulta(item.dataConsulta);
    setEditHorario(item.horario);
    setEditHospital(item.hospital);
    setEditHospitalPlaceId(item.hospitalPlaceId ?? '');
    setEditHospitalLat(item.hospitalLat ?? null);
    setEditHospitalLng(item.hospitalLng ?? null);
    setEditNomeMedico(item.nomeMedico);
    setEditStatus(item.status);
    setEditFotos(item.fotos ?? []);
    setEditSugestoes([]);
    setMenuOpcoes(null);
    setModalEditar(true);
  }, []);

  const salvarEdicao = useCallback(async () => {
    if (!consultaEditando) return;
    try {
      setSalvando(true);
      await updateDoc(doc(db, 'consultas', consultaEditando.id), {
        consulta: editConsulta.trim(),
        descricao: editDescricao.trim(),
        dataConsulta: editDataConsulta.trim(),
        horario: editHorario.trim(),
        hospital: editHospital.trim(),
        hospitalPlaceId: editHospitalPlaceId,
        hospitalLat: editHospitalLat,
        hospitalLng: editHospitalLng,
        nomeMedico: editNomeMedico.trim(),
        status: editStatus,
        fotos: editFotos,
        turno: calcularTurnoConsulta(editHorario),
        atualizadoEm: serverTimestamp(),
      });
      setModalEditar(false);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível salvar alterações.';
      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  }, [consultaEditando, editConsulta, editDescricao, editDataConsulta, editHorario, editHospital, editHospitalPlaceId, editHospitalLat, editHospitalLng, editNomeMedico, editStatus, editFotos]);

  const alterarStatus = useCallback(async (id: string, status: StatusConsulta) => {
    try {
      await updateDoc(doc(db, 'consultas', id), {
        status,
        atualizadoEm: serverTimestamp(),
      });
      return true;
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível alterar o status.';
      Alert.alert('Erro', mensagem);
      return false;
    } finally {
      setPopoverStatus(null);
    }
  }, []);

  const confirmarExclusao = useCallback((id: string) => {
    setMenuOpcoes(null);
    const mensagem = 'Tem certeza que deseja excluir esta consulta?';

    if (Platform.OS === 'web') {
      const confirmou = typeof window !== 'undefined' && window.confirm(mensagem);
      if (confirmou) deleteDoc(doc(db, 'consultas', id));
      return;
    }

    Alert.alert('Excluir consulta', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteDoc(doc(db, 'consultas', id)),
      },
    ]);
  }, []);

  return {
    filhoSelecionado,
    width,
    isNarrow,
    usuario,
    consultas: consultasFiltradas,
    porStatus,
    contadores,
    carregando,
    salvando,
    headerProps,
    termoBusca,

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

    consulta, setConsulta,
    descricao, setDescricao,
    dataConsulta, setDataConsulta,
    horario, setHorario,
    hospital, setHospital,
    hospitalPlaceId, setHospitalPlaceId,
    hospitalLat, setHospitalLat,
    hospitalLng, setHospitalLng,
    nomeMedico, setNomeMedico,
    statusForm, setStatusForm,
    fotosForm, setFotosForm,
    sugestoes, setSugestoes,
    buscandoPlaces,

    consultaEditando,
    editConsulta, setEditConsulta,
    editDescricao, setEditDescricao,
    editDataConsulta, setEditDataConsulta,
    editHorario, setEditHorario,
    editHospital, setEditHospital,
    editHospitalPlaceId, setEditHospitalPlaceId,
    editHospitalLat, setEditHospitalLat,
    editHospitalLng, setEditHospitalLng,
    editNomeMedico, setEditNomeMedico,
    editStatus, setEditStatus,
    editFotos, setEditFotos,
    editSugestoes,
    editBuscandoPlaces,

    buscarPlaces,
    selecionarPlace,
    comprimirImagem,
    escolherFoto,
    removerFoto,
    substituirFoto,
    modalSucessoVisivel, setModalSucessoVisivel,
    cadastrarConsulta,
    limparFormCadastro,
    abrirEditar,
    salvarEdicao,
    alterarStatus,
    confirmarExclusao,
  };
}