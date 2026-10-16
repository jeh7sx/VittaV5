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
import * as Notifications from 'expo-notifications';

export type StatusMedicamento = 'Ativo' | 'Concluído' | 'Atrasado';

export interface Medicamento {
  id: string;
  nome: string;
  tipo: string;
  dosagem: string;
  horario: string;
  turno: string;
  frequencia: string;
  dataInicio: string;
  dataTermino?: string;
  hospital: string;
  hospitalPlaceId?: string;
  hospitalLat?: number;
  hospitalLng?: number;
  status: StatusMedicamento;
  filhoId: string;
  nomeFilho: string;
  fotos: string[];
  dosesTomadas?: number[];
}

export interface PlaceSuggestion {
  description: string;
  place_id: string;
}

export const STATUS: StatusMedicamento[] = [
  'Ativo',
  'Concluído',
  'Atrasado',
];

export const COR_STATUS: Record<string, { bg: string; text: string; border: string }> = {
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

export function formatarHorario(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 4);
  if (numeros.length <= 2) return numeros;
  return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
}

export function formatarData(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function calcularTurno(horario: string) {
  const match = horario.match(/^(\d{1,2}):/);
  if (!match) return '';
  const hora = Number(match[1]);
  if (hora >= 5 && hora < 12) return 'Manhã';
  if (hora >= 12 && hora < 18) return 'Tarde';
  return 'Noite';
}

// Gera todas as doses programadas para contagem
export function calcularTodasAsDosesHook(item: {
  dataInicio?: string;
  horario?: string;
  dataTermino?: string;
  frequencia?: string;
}): Date[] {
  if (!item.dataInicio || !item.horario) return [];

  const [dI, mI, aI] = item.dataInicio.split('/').map(Number);
  const [hI, minI] = item.horario.split(':').map(Number);

  let atual = new Date(aI, mI - 1, dI, hI, minI, 0);

  let fim: Date;
  if (item.dataTermino) {
    const [dT, mT, aT] = item.dataTermino.split('/').map(Number);
    fim = new Date(aT, mT - 1, dT, 23, 59, 59);
  } else {
    fim = new Date(atual);
    fim.setDate(fim.getDate() + 30);
  }

  let addHoras = 0;
  let addDias = 0;
  const match = (item.frequencia || '').match(/(\d+)\s*(.*)/);

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

  const doses: Date[] = [];
  while (atual <= fim && doses.length < 500) {
    doses.push(new Date(atual));
    if (addHoras > 0) {
      atual.setHours(atual.getHours() + addHoras);
    } else {
      atual.setDate(atual.getDate() + addDias);
    }
  }

  return doses;
}

// Calcula se o status é Ativo, Concluído ou Atrasado
export function calcularStatusDinamico(med: {
  dataInicio?: string;
  dataTermino?: string;
  horario?: string;
  frequencia?: string;
  dosesTomadas?: number[];
  status?: string;
}): StatusMedicamento {
  const doses = calcularTodasAsDosesHook(med);
  const totalDoses = doses.length;
  const dosesTomadasCount = (med.dosesTomadas || []).length;

  // 1. Todas as doses tomadas: Concluído (independente do prazo)
  if (totalDoses > 0 && dosesTomadasCount >= totalDoses) {
    return 'Concluído';
  }

  const agora = new Date();

  // 2. Verifica se passou do prazo final (se houver dataTermino ou última dose programada)
  if (med.dataTermino) {
    const [dT, mT, aT] = med.dataTermino.split('/').map(Number);
    const prazoFinal = new Date(aT, mT - 1, dT, 23, 59, 59, 999);
    if (agora > prazoFinal && dosesTomadasCount < totalDoses) {
      return 'Atrasado';
    }
  } else if (doses.length > 0) {
    const ultimaDose = doses[doses.length - 1];
    if (agora > ultimaDose && dosesTomadasCount < totalDoses) {
      return 'Atrasado';
    }
  }

  return 'Ativo';
}

function normalizarStatus(valor: unknown): StatusMedicamento {
  if (valor === 'Concluído' || valor === 'ConcluÃ­do') return 'Concluído';
  if (valor === 'Atrasado') return 'Atrasado';
  return 'Ativo';
}

export function useMedicamentos() {
  const { filhoSelecionado } = useFilho();
  const { width } = useWindowDimensions();
  const isNarrow = width < BREAKPOINT;
  const usuario = auth.currentUser;

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dataTermino, setDataTermino] = useState('');
  const [editDataTermino, setEditDataTermino] = useState('');

  // Hook de busca e ordenação
  const { headerProps, listaFiltrada: medicamentosFiltrados, termoBusca } = useHeaderSearch(medicamentos, {
    obterCamposTexto: (m) => [
      m.nome,
      m.tipo,
      m.dosagem,
      m.frequencia,
      m.horario,
      m.dataInicio,
      m.hospital,
      m.turno,
    ],
    obterTituloParaOrdem: (m) => m.nome,
    obterData: (m) => m.dataInicio,
  });

  // Seções expansíveis
  const [todosAberto, setTodosAberto] = useState(true);
  const [todosExpandido, setTodosExpandido] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState<Record<StatusMedicamento, boolean>>({
    Ativo: true,
    Concluído: true,
    Atrasado: true,
  });
  const [secaoExpandida, setSecaoExpandida] = useState<Record<StatusMedicamento, boolean>>({
    Ativo: false,
    Concluído: false,
    Atrasado: false,
  });

  // Modais e menus
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVerMais, setModalVerMais] = useState<Medicamento | null>(null);
  const [popoverStatus, setPopoverStatus] = useState<string | null>(null);
  const [menuOpcoes, setMenuOpcoes] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState(false);

  // Form Cadastro
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [horario, setHorario] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [hospital, setHospital] = useState('');
  const [hospitalPlaceId, setHospitalPlaceId] = useState('');
  const [hospitalLat, setHospitalLat] = useState<number | null>(null);
  const [hospitalLng, setHospitalLng] = useState<number | null>(null);
  const [statusForm, setStatusForm] = useState<StatusMedicamento>('Ativo');
  const [fotosForm, setFotosForm] = useState<string[]>([]);
  const [sugestoes, setSugestoes] = useState<PlaceSuggestion[]>([]);
  const [buscandoPlaces, setBuscandoPlaces] = useState(false);

  // Form Edição
  const [medicamentoEditando, setMedicamentoEditando] = useState<Medicamento | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editDosagem, setEditDosagem] = useState('');
  const [editHorario, setEditHorario] = useState('');
  const [editFrequencia, setEditFrequencia] = useState('');
  const [editDataInicio, setEditDataInicio] = useState('');
  const [editHospital, setEditHospital] = useState('');
  const [editHospitalPlaceId, setEditHospitalPlaceId] = useState('');
  const [editHospitalLat, setEditHospitalLat] = useState<number | null>(null);
  const [editHospitalLng, setEditHospitalLng] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<StatusMedicamento>('Ativo');
  const [editFotos, setEditFotos] = useState<string[]>([]);
  const [editSugestoes, setEditSugestoes] = useState<PlaceSuggestion[]>([]);
  const [editBuscandoPlaces, setEditBuscandoPlaces] = useState(false);

  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false);

  // Consulta Firebase em tempo real calculando status atualizado
  useEffect(() => {
    if (!usuario?.uid || !filhoSelecionado?.id) {
      setMedicamentos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    const consulta = query(
      collection(db, 'medicamentos'),
      where('filhoId', '==', filhoSelecionado.id)
    );

    const cancelarInscricao = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((documento) => {
          const data = documento.data();
          const baseMed = {
            id: documento.id,
            nome: data.nome ?? '',
            tipo: data.tipo ?? '',
            dosagem: data.dosagem ?? '',
            horario: data.horario ?? '',
            turno: data.turno ?? calcularTurno(data.horario ?? ''),
            frequencia: data.frequencia ?? '',
            dataInicio: data.dataInicio ?? '',
            dataTermino: data.dataTermino ?? '',
            hospital: data.hospital ?? '',
            hospitalPlaceId: data.hospitalPlaceId ?? '',
            hospitalLat: data.hospitalLat ?? null,
            hospitalLng: data.hospitalLng ?? null,
            filhoId: data.filhoId ?? '',
            nomeFilho: data.nomeFilho ?? '',
            fotos: data.fotos ?? [],
            dosesTomadas: data.dosesTomadas ?? [],
          };

          // Avalia as doses tomadas e prazos dinamicamente
          const statusCalculado = calcularStatusDinamico(baseMed);

          return {
            ...baseMed,
            status: statusCalculado,
          } as Medicamento;
        });

        lista.sort((a, b) => a.horario.localeCompare(b.horario));
        setMedicamentos(lista);
        setCarregando(false);
      },
      (erro) => {
        console.error('Erro ao consultar medicamentos:', erro);
        setCarregando(false);
        Alert.alert('Erro', 'Não foi possível carregar os medicamentos.');
      },
    );

    return () => {
      if (typeof cancelarInscricao === 'function') cancelarInscricao();
    };
  }, [usuario?.uid, filhoSelecionado?.id]);

  const contadores = useMemo(() => ({
    Todos: medicamentosFiltrados.length,
    Ativo: medicamentosFiltrados.filter((m) => m.status === 'Ativo').length,
    Concluído: medicamentosFiltrados.filter((m) => m.status === 'Concluído').length,
    Atrasado: medicamentosFiltrados.filter((m) => m.status === 'Atrasado').length,
  }), [medicamentosFiltrados]);

  const porStatus: Record<StatusMedicamento, Medicamento[]> = useMemo(() => ({
    Ativo: medicamentosFiltrados.filter((m) => m.status === 'Ativo'),
    Concluído: medicamentosFiltrados.filter((m) => m.status === 'Concluído'),
    Atrasado: medicamentosFiltrados.filter((m) => m.status === 'Atrasado'),
  }), [medicamentosFiltrados]);

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
      )}&types=hospital|health|pharmacy&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
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
    setNome('');
    setTipo('');
    setDosagem('');
    setHorario('');
    setFrequencia('');
    setDataInicio('');
    setDataTermino('');
    setHospital('');
    setHospitalPlaceId('');
    setHospitalLat(null);
    setHospitalLng(null);
    setStatusForm('Ativo');
    setFotosForm([]);
    setSugestoes([]);
  }, []);

  const cadastrarMedicamento = useCallback(async () => {
    if (!usuario?.uid) {
      Alert.alert('Atenção', 'É necessário estar autenticado para cadastrar.');
      return;
    }
    if (!filhoSelecionado) {
      Alert.alert('Atenção', 'Selecione um filho antes de cadastrar o medicamento.');
      return;
    }
    if (!nome.trim() || !dosagem.trim() || !horario.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do medicamento, dosagem e horário.');
      return;
    }

    try {
      setSalvando(true);
      const dadosMedicamento = {
        nome: nome.trim(),
        tipo: tipo.trim(),
        dosagem: dosagem.trim(),
        frequencia: frequencia.trim(),
        horario: horario.trim(),
        dataInicio: dataInicio.trim(),
        dataTermino: dataTermino.trim(),
        hospital: hospital.trim(),
        hospitalPlaceId,
        hospitalLat,
        hospitalLng,
        turno: calcularTurno(horario),
        status: statusForm,
        fotos: fotosForm,
        filhoId: filhoSelecionado.id,
        nomeFilho: filhoSelecionado.nome,
        responsavelId: usuario.uid,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      };

      await addDoc(collection(db, 'medicamentos'), dadosMedicamento);

      try {
        await criarNotificacao(
          usuario.uid,
          filhoSelecionado.id,
          'Novo medicamento',
          `${nome.trim()} adicionado para ${filhoSelecionado.nome}.`,
        );
      } catch (erroNotificacao) {
        console.error('Erro ao criar notificação:', erroNotificacao);
      }

      limparFormCadastro();
      setModalCadastro(false);
      setTimeout(() => {
        setModalSucessoVisivel(true);
      }, 300);
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível cadastrar o medicamento.';
      try {
        await registrarLog(usuario.uid, 'CADASTRO_MEDICAMENTO', mensagem);
      } catch (erroLog) {
        console.error('Erro ao registrar log:', erroLog);
      }
      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  }, [usuario?.uid, filhoSelecionado, nome, tipo, dosagem, frequencia, horario, dataInicio, dataTermino, hospital, hospitalPlaceId, hospitalLat, hospitalLng, statusForm, fotosForm, limparFormCadastro]);

  async function agendarNotificacoes(nomeMedicamento: string, dtInicio: string, dtTermino: string, hrInicio: string, freqQtd: number, freqUnidade: string) {
    let horasDeIntervalo = 0;
    if (freqUnidade === 'Horas') horasDeIntervalo = freqQtd;
    else if (freqUnidade === 'Dias') horasDeIntervalo = freqQtd * 24;
    else if (freqUnidade === 'Semanas') horasDeIntervalo = freqQtd * 168;

    if (horasDeIntervalo === 0) return;

    const [diaI, mesI, anoI] = dtInicio.split('/');
    const [horaI, minI] = hrInicio.split(':');
    let doseAtual = new Date(Number(anoI), Number(mesI) - 1, Number(diaI), Number(horaI), Number(minI));

    const [diaT, mesT, anoT] = dtTermino.split('/');
    const fimTratamento = new Date(Number(anoT), Number(mesT) - 1, Number(diaT), 23, 59);

    while (doseAtual <= fimTratamento) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora do Remédio! 💊',
          body: `Está na hora de dar ${nomeMedicamento}.`,
        },
        trigger: {
          type: 'date',
          date: doseAtual,
        } as Notifications.NotificationTriggerInput,
      });

      doseAtual.setHours(doseAtual.getHours() + horasDeIntervalo);
    }
  }

  const abrirEditar = useCallback((medicamento: Medicamento) => {
    setMedicamentoEditando(medicamento);
    setEditNome(medicamento.nome);
    setEditTipo(medicamento.tipo);
    setEditDosagem(medicamento.dosagem);
    setEditHorario(medicamento.horario);
    setEditFrequencia(medicamento.frequencia);
    setEditDataInicio(medicamento.dataInicio);
    setEditDataTermino(medicamento.dataTermino ?? '');
    setEditHospital(medicamento.hospital);
    setEditHospitalPlaceId(medicamento.hospitalPlaceId ?? '');
    setEditHospitalLat(medicamento.hospitalLat ?? null);
    setEditHospitalLng(medicamento.hospitalLng ?? null);
    setEditStatus(medicamento.status);
    setEditFotos(medicamento.fotos ?? []);
    setEditSugestoes([]);
    setMenuOpcoes(null);
    setModalEditar(true);
  }, []);

  const salvarEdicao = useCallback(async () => {
    if (!medicamentoEditando) return;
    try {
      setSalvando(true);
      await updateDoc(doc(db, 'medicamentos', medicamentoEditando.id), {
        nome: editNome.trim(),
        tipo: editTipo.trim(),
        dosagem: editDosagem.trim(),
        horario: editHorario.trim(),
        frequencia: editFrequencia.trim(),
        dataInicio: editDataInicio.trim(),
        dataTermino: (editDataTermino || '').trim(),
        hospital: editHospital.trim(),
        hospitalPlaceId: editHospitalPlaceId,
        hospitalLat: editHospitalLat,
        hospitalLng: editHospitalLng,
        turno: calcularTurno(editHorario),
        status: editStatus,
        fotos: editFotos,
        atualizadoEm: serverTimestamp(),
      });
      setModalEditar(false);
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível editar o medicamento.';
      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  }, [
    medicamentoEditando,
    editNome,
    editTipo,
    editDosagem,
    editHorario,
    editFrequencia,
    editDataInicio,
    editDataTermino,
    editHospital,
    editHospitalPlaceId,
    editHospitalLat,
    editHospitalLng,
    editStatus,
    editFotos
  ]);

  const alterarStatus = useCallback(async (id: string, status: StatusMedicamento) => {
    try {
      await updateDoc(doc(db, 'medicamentos', id), {
        status,
        atualizadoEm: serverTimestamp(),
      });
      return true;
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Não foi possível alterar o status.';
      Alert.alert('Erro', mensagem);
      return false;
    } finally {
      setPopoverStatus(null);
    }
  }, []);

  const confirmarExclusao = useCallback((id: string) => {
    setMenuOpcoes(null);
    const mensagem = 'Tem certeza que deseja excluir este medicamento?';
    if (Platform.OS === 'web') {
      const confirmou = typeof window !== 'undefined' && window.confirm(mensagem);
      if (confirmou) deleteDoc(doc(db, 'medicamentos', id));
      return;
    }

    Alert.alert('Excluir medicamento', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => deleteDoc(doc(db, 'medicamentos', id)),
      },
    ]);
  }, []);

  const marcarDoseTomada = useCallback(async (id: string, doseTimestamp: number) => {
    try {
      const med = medicamentos.find((m) => m.id === id);
      if (!med) return false;

      const dosesAtuais = med.dosesTomadas ?? [];
      const novasDoses = dosesAtuais.includes(doseTimestamp)
        ? dosesAtuais.filter((t) => t !== doseTimestamp)
        : [...dosesAtuais, doseTimestamp];

      const novoStatus = calcularStatusDinamico({
        ...med,
        dosesTomadas: novasDoses,
      });

      await updateDoc(doc(db, 'medicamentos', id), {
        dosesTomadas: novasDoses,
        status: novoStatus,
        atualizadoEm: serverTimestamp(),
      });
      return true;
    } catch (erro) {
      console.error('Erro ao registrar dose tomada:', erro);
      return false;
    }
  }, [medicamentos]);

  return {
    filhoSelecionado,
    width,
    isNarrow,
    usuario,
    medicamentos: medicamentosFiltrados,
    carregando,
    salvando,
    contadores,
    porStatus,
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

    nome, setNome,
    tipo, setTipo,
    dosagem, setDosagem,
    horario, setHorario,
    frequencia, setFrequencia,
    dataInicio, setDataInicio,
    dataTermino, setDataTermino,
    hospital, setHospital,
    hospitalPlaceId, setHospitalPlaceId,
    hospitalLat, setHospitalLat,
    hospitalLng, setHospitalLng,
    statusForm, setStatusForm,
    fotosForm, setFotosForm,
    sugestoes, setSugestoes,
    buscandoPlaces,

    medicamentoEditando,
    editNome, setEditNome,
    editTipo, setEditTipo,
    editDosagem, setEditDosagem,
    editHorario, setEditHorario,
    editFrequencia, setEditFrequencia,
    editDataInicio, setEditDataInicio,
    editDataTermino, setEditDataTermino,
    editHospital, setEditHospital,
    editHospitalPlaceId, setEditHospitalPlaceId,
    editHospitalLat, setEditHospitalLat,
    editHospitalLng, setEditHospitalLng,
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
    cadastrarMedicamento,
    limparFormCadastro,
    abrirEditar,
    salvarEdicao,
    alterarStatus,
    confirmarExclusao,
    marcarDoseTomada,
    agendarNotificacoes,
  };
}