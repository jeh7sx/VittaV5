import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const FOLDER_COLORS = ['#FFB020', '#D142FF', '#00D084', '#FF4560', '#008FFB'];
export const LIMITE_MB = 0.7;

export interface Pasta {
  id: string;
  nome: string;
  cor: string;
  usuarioId?: string;
}

export interface Documento {
  id: string;
  nome: string;
  descricao: string;
  tamanhoMB: number;
  dataModificacao: string;
  extensao: string;
  pastasIds: string[];
  conteudoBase64?: string;
  usuarioId?: string;
}

function obterDataHoraAtual(): string {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

async function carregarJSZipWeb(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).JSZip) return (window as any).JSZip;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve((window as any).JSZip);
    script.onerror = () => reject(new Error('Falha ao carregar biblioteca JSZip'));
    document.head.appendChild(script);
  });
}

export function useDocumentosController() {
  const usuario = auth.currentUser;

  const [searchText, setSearchText] = useState('');
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [baixandoZip, setBaixandoZip] = useState(false);

  // Modais
  const [modalPastaVisible, setModalPastaVisible] = useState(false);
  const [modalEditPastaVisible, setModalEditPastaVisible] = useState(false);
  const [modalDocVisible, setModalDocVisible] = useState(false);

  const [docVisualizando, setDocVisualizando] = useState<Documento | null>(null);
  const [docEditando, setDocEditando] = useState<Documento | null>(null);
  const [pastaVisualizando, setPastaVisualizando] = useState<Pasta | null>(null);
  const [pastaEditando, setPastaEditando] = useState<Pasta | null>(null);

  const [origemPastaId, setOrigemPastaId] = useState<string | null>(null);

  // Formulários de Pasta
  const [novaPastaNome, setNovaPastaNome] = useState('');
  const [novaPastaCor, setNovaPastaCor] = useState(FOLDER_COLORS[0]);
  const [editPastaNome, setEditPastaNome] = useState('');
  const [editPastaCor, setEditPastaCor] = useState('');

  // Formulário de Documento
  const [novoDocBase64, setNovoDocBase64] = useState('');
  const [novoDocNome, setNovoDocNome] = useState('');
  const [novoDocDescricao, setNovoDocDescricao] = useState('');
  const [novoDocExtensao, setNovoDocExtensao] = useState('');
  const [novoDocTamanho, setNovoDocTamanho] = useState(0);
  const [novoDocPastasSelecionadas, setNovoDocPastasSelecionadas] = useState<string[]>([]);

  // Formulário Edição Documento
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editDocPastasSelecionadas, setEditDocPastasSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!usuario?.uid) {
        setPastas([]);
        setDocumentos([]);
        setIsFetching(false);
        return;
      }

      try {
        const qPastas = query(collection(db, 'pastas'), where('usuarioId', '==', usuario.uid));
        const pastasSnapshot = await getDocs(qPastas);
        const pastasData = pastasSnapshot.docs.map(
          docSnap => ({ id: docSnap.id, ...docSnap.data() } as Pasta)
        );
        setPastas(pastasData);

        const qDocs = query(collection(db, 'documentos'), where('usuarioId', '==', usuario.uid));
        const docsSnapshot = await getDocs(qDocs);
        const docsData = docsSnapshot.docs.map(
          docSnap => ({ id: docSnap.id, ...docSnap.data() } as Documento)
        );
        setDocumentos(docsData);
      } catch (error) {
        console.error('Erro ao buscar dados do Firebase:', error);
      } finally {
        setIsFetching(false);
      }
    };
    carregarDados();
  }, [usuario?.uid]);

  const fecharModalPasta = () => {
    setModalPastaVisible(false);
    setNovaPastaNome('');
    setNovaPastaCor(FOLDER_COLORS[0]);
  };

  const fecharModalDoc = () => {
    setModalDocVisible(false);
    setNovoDocBase64('');
    setNovoDocNome('');
    setNovoDocDescricao('');
    setNovoDocExtensao('');
    setNovoDocTamanho(0);
    setNovoDocPastasSelecionadas([]);
  };

  const baixarArquivo = (docItem: Documento) => {
    if (!docItem.conteudoBase64) {
      if (Platform.OS === 'web') {
        window.alert('Este arquivo não possui conteúdo para download.');
      } else {
        Alert.alert('Erro', 'Este arquivo não possui conteúdo para download.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = docItem.conteudoBase64;
      const nomeCompleto = docItem.nome.includes('.')
        ? docItem.nome
        : `${docItem.nome}.${docItem.extensao.toLowerCase()}`;
      link.download = nomeCompleto;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('Download', `Download do arquivo ${docItem.nome} iniciado.`);
    }
  };

  const baixarPastaZipada = async (pasta: Pasta) => {
    const docsDaPasta = documentos.filter(
      d => d.pastasIds.includes(pasta.id) && d.conteudoBase64
    );

    if (docsDaPasta.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Não há documentos com conteúdo disponível para download nesta pasta.');
      } else {
        Alert.alert('Aviso', 'Não há documentos com conteúdo disponível para download nesta pasta.');
      }
      return;
    }

    setBaixandoZip(true);
    try {
      if (Platform.OS === 'web') {
        const JSZipLib = await carregarJSZipWeb();
        const zip = new JSZipLib();

        docsDaPasta.forEach(docItem => {
          if (!docItem.conteudoBase64) return;
          const partes = docItem.conteudoBase64.split(',');
          const base64Data = partes.length > 1 ? partes[1] : partes[0];
          const nomeArquivo = docItem.nome.includes('.')
            ? docItem.nome
            : `${docItem.nome}.${docItem.extensao.toLowerCase()}`;

          zip.file(nomeArquivo, base64Data, { base64: true });
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pasta.nome}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        docsDaPasta.forEach((d, i) => {
          setTimeout(() => baixarArquivo(d), i * 350);
        });
      }
    } catch (error) {
      console.error('Erro ao gerar ZIP:', error);
      if (Platform.OS === 'web') {
        window.alert('Houve um erro ao compactar os arquivos da pasta.');
      } else {
        Alert.alert('Erro', 'Houve um erro ao compactar os arquivos da pasta.');
      }
    } finally {
      setBaixandoZip(false);
    }
  };

  const handleCriarPasta = async () => {
    if (!usuario?.uid) {
      Platform.OS === 'web'
        ? window.alert('Você precisa estar conectado.')
        : Alert.alert('Erro', 'Você precisa estar conectado.');
      return;
    }
    if (!novaPastaNome.trim()) {
      Platform.OS === 'web'
        ? window.alert('Dê um nome para a pasta.')
        : Alert.alert('Atenção', 'Dê um nome para a pasta.');
      return;
    }
    setIsLoading(true);
    try {
      const novaPastaData = {
        nome: novaPastaNome,
        cor: novaPastaCor,
        usuarioId: usuario.uid,
      };
      const docRef = await addDoc(collection(db, 'pastas'), novaPastaData);
      setPastas([...pastas, { id: docRef.id, ...novaPastaData }]);
      fecharModalPasta();
    } catch {
      Platform.OS === 'web'
        ? window.alert('Não foi possível criar a pasta no servidor.')
        : Alert.alert('Erro', 'Não foi possível criar a pasta no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const abrirEdicaoPasta = (pasta: Pasta, vindoDePastaAberta: boolean = false) => {
    if (vindoDePastaAberta) {
      setOrigemPastaId(pasta.id);
      setPastaVisualizando(null);
    } else {
      setOrigemPastaId(null);
    }
    setPastaEditando(pasta);
    setEditPastaNome(pasta.nome);
    setEditPastaCor(pasta.cor);
    setModalEditPastaVisible(true);
  };

  const salvarEdicaoPasta = async () => {
    if (!pastaEditando || !editPastaNome.trim()) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'pastas', pastaEditando.id), {
        nome: editPastaNome,
        cor: editPastaCor,
      });

      const pastasAtualizadas = pastas.map(p =>
        p.id === pastaEditando.id ? { ...p, nome: editPastaNome, cor: editPastaCor } : p
      );
      setPastas(pastasAtualizadas);
      setModalEditPastaVisible(false);

      if (origemPastaId) {
        const atualizada = pastasAtualizadas.find(p => p.id === origemPastaId);
        if (atualizada) setPastaVisualizando(atualizada);
        setOrigemPastaId(null);
      }

      setPastaEditando(null);
    } catch {
      Platform.OS === 'web'
        ? window.alert('Não foi possível atualizar a pasta.')
        : Alert.alert('Erro', 'Não foi possível atualizar a pasta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluirPasta = (id: string) => {
    const confirmarExclusao = async () => {
      try {
        await deleteDoc(doc(db, 'pastas', id));
        setPastas(pastas.filter(p => p.id !== id));
        setPastaVisualizando(null);

        const docsParaAtualizar = documentos.filter(d => d.pastasIds.includes(id));
        docsParaAtualizar.forEach(async d => {
          const novasPastasIds = d.pastasIds.filter(pId => pId !== id);
          await updateDoc(doc(db, 'documentos', d.id), { pastasIds: novasPastasIds });
        });
        setDocumentos(
          documentos.map(d => ({
            ...d,
            pastasIds: d.pastasIds.filter(pId => pId !== id),
          }))
        );
      } catch {
        Platform.OS === 'web'
          ? window.alert('Não foi possível excluir a pasta.')
          : Alert.alert('Erro', 'Não foi possível excluir a pasta.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(
        'Os documentos nela não serão excluídos, apenas desvinculados. Deseja excluir a pasta?'
      );
      if (confirmou) confirmarExclusao();
    } else {
      Alert.alert(
        'Excluir Pasta',
        'Os documentos nela não serão excluídos, apenas desvinculados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: confirmarExclusao },
        ]
      );
    }
  };

  const selecionarArquivo = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';

      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const tamanhoMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));

          if (tamanhoMB > LIMITE_MB) {
            window.alert(
              `Arquivo muito grande!\n\nO arquivo selecionado possui ${tamanhoMB} MB.\nO limite seguro do sistema é de ${LIMITE_MB} MB. Por favor, escolha um arquivo mais leve.`
            );
            setNovoDocNome('');
            setNovoDocExtensao('');
            setNovoDocTamanho(0);
            setNovoDocBase64('');
            return;
          }

          setNovoDocNome(file.name);
          setNovoDocExtensao(file.name.split('.').pop()?.toUpperCase() || 'FILE');
          setNovoDocTamanho(tamanhoMB);

          const reader = new FileReader();
          reader.onloadend = () => setNovoDocBase64(reader.result as string);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleSalvarDocumento = async () => {
    if (!usuario?.uid) {
      Platform.OS === 'web'
        ? window.alert('Você precisa estar conectado.')
        : Alert.alert('Erro', 'Você precisa estar conectado.');
      return;
    }
    if (!novoDocBase64 || !novoDocNome.trim()) {
      Platform.OS === 'web'
        ? window.alert('Selecione um arquivo válido e verifique se o tamanho é menor que 0.7MB.')
        : Alert.alert('Atenção', 'Selecione um arquivo válido e verifique se o tamanho é menor que 0.7MB.');
      return;
    }

    setIsLoading(true);
    try {
      const dataAtualFormatada = obterDataHoraAtual();

      const documentoData = {
        nome: novoDocNome,
        descricao: novoDocDescricao,
        tamanhoMB: novoDocTamanho,
        dataModificacao: dataAtualFormatada,
        extensao: novoDocExtensao,
        pastasIds: novoDocPastasSelecionadas,
        conteudoBase64: novoDocBase64,
        usuarioId: usuario.uid,
      };

      const docRef = await addDoc(collection(db, 'documentos'), documentoData);
      setDocumentos([{ id: docRef.id, ...documentoData }, ...documentos]);
      fecharModalDoc();
    } catch {
      Platform.OS === 'web'
        ? window.alert('O arquivo pode ser muito grande para o Firestore.')
        : Alert.alert('Erro', 'O arquivo pode ser muito grande para o Firestore.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluirDocumento = (id: string) => {
    const confirmarExclusao = async () => {
      try {
        await deleteDoc(doc(db, 'documentos', id));
        setDocumentos(documentos.filter(d => d.id !== id));
      } catch {
        Platform.OS === 'web'
          ? window.alert('Não foi possível excluir o documento.')
          : Alert.alert('Erro', 'Não foi possível excluir o documento.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm('Deseja excluir este documento permanentemente?');
      if (confirmou) confirmarExclusao();
    } else {
      Alert.alert('Excluir Documento', 'Deseja excluir este documento permanentemente?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmarExclusao },
      ]);
    }
  };

  const abrirVisualizacaoDocumento = (docItem: Documento, dentroDaPasta: boolean = false) => {
    if (dentroDaPasta && pastaVisualizando) {
      setOrigemPastaId(pastaVisualizando.id);
      setPastaVisualizando(null);
    }
    setDocVisualizando(docItem);
  };

  const abrirEdicaoDocumento = (docItem: Documento, dentroDaPasta: boolean = false) => {
    if (dentroDaPasta && pastaVisualizando) {
      setOrigemPastaId(pastaVisualizando.id);
      setPastaVisualizando(null);
    }
    setDocEditando(docItem);
    setEditNome(docItem.nome);
    setEditDescricao(docItem.descricao);
    setEditDocPastasSelecionadas(docItem.pastasIds);
  };

  const fecharVisualizacaoDocumento = () => {
    setDocVisualizando(null);
    if (origemPastaId) {
      const p = pastas.find(item => item.id === origemPastaId);
      if (p) setPastaVisualizando(p);
      setOrigemPastaId(null);
    }
  };

  const fecharEdicaoDocumento = () => {
    setDocEditando(null);
    if (origemPastaId) {
      const p = pastas.find(item => item.id === origemPastaId);
      if (p) setPastaVisualizando(p);
      setOrigemPastaId(null);
    }
  };

  const salvarEdicaoDocumento = async () => {
    if (!docEditando || !editNome.trim()) return;
    setIsLoading(true);
    try {
      const dataModificacaoNova = obterDataHoraAtual();

      await updateDoc(doc(db, 'documentos', docEditando.id), {
        nome: editNome,
        descricao: editDescricao,
        pastasIds: editDocPastasSelecionadas,
        dataModificacao: dataModificacaoNova,
      });

      setDocumentos(
        documentos.map(d =>
          d.id === docEditando.id
            ? {
                ...d,
                nome: editNome,
                descricao: editDescricao,
                pastasIds: editDocPastasSelecionadas,
                dataModificacao: dataModificacaoNova,
              }
            : d
        )
      );
      fecharEdicaoDocumento();
    } catch {
      Platform.OS === 'web'
        ? window.alert('Não foi possível atualizar o documento.')
        : Alert.alert('Erro', 'Não foi possível atualizar o documento.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNovaPastaSelection = (pastaId: string) => {
    if (novoDocPastasSelecionadas.includes(pastaId)) {
      setNovoDocPastasSelecionadas(novoDocPastasSelecionadas.filter(id => id !== pastaId));
    } else {
      setNovoDocPastasSelecionadas([...novoDocPastasSelecionadas, pastaId]);
    }
  };

  const toggleEditPastaSelection = (pastaId: string) => {
    if (editDocPastasSelecionadas.includes(pastaId)) {
      setEditDocPastasSelecionadas(editDocPastasSelecionadas.filter(id => id !== pastaId));
    } else {
      setEditDocPastasSelecionadas([...editDocPastasSelecionadas, pastaId]);
    }
  };

  const getEstatisticasPasta = (pastaId: string) => {
    const docsDaPasta = documentos.filter(d => d.pastasIds.includes(pastaId));
    const totalTamanho = docsDaPasta.reduce((acc, d) => acc + d.tamanhoMB, 0);
    return { qtd: docsDaPasta.length, tamanhoMB: totalTamanho.toFixed(2) };
  };

  const documentosFiltrados = documentos.filter(d =>
    d.nome.toLowerCase().includes(searchText.toLowerCase())
  );

  return {
    searchText,
    setSearchText,
    pastas,
    documentos,
    documentosFiltrados,
    isLoading,
    isFetching,
    baixandoZip,
    modalPastaVisible,
    setModalPastaVisible,
    modalEditPastaVisible,
    setModalEditPastaVisible,
    modalDocVisible,
    setModalDocVisible,
    docVisualizando,
    docEditando,
    pastaVisualizando,
    setPastaVisualizando,
    origemPastaId,
    setOrigemPastaId,
    novaPastaNome,
    setNovaPastaNome,
    novaPastaCor,
    setNovaPastaCor,
    editPastaNome,
    setEditPastaNome,
    editPastaCor,
    setEditPastaCor,
    novoDocNome,
    novoDocDescricao,
    setNovoDocDescricao,
    novoDocPastasSelecionadas,
    editNome,
    setEditNome,
    editDescricao,
    setEditDescricao,
    editDocPastasSelecionadas,
    fecharModalPasta,
    fecharModalDoc,
    baixarArquivo,
    baixarPastaZipada,
    handleCriarPasta,
    abrirEdicaoPasta,
    salvarEdicaoPasta,
    handleExcluirPasta,
    selecionarArquivo,
    handleSalvarDocumento,
    handleExcluirDocumento,
    abrirVisualizacaoDocumento,
    abrirEdicaoDocumento,
    fecharVisualizacaoDocumento,
    fecharEdicaoDocumento,
    salvarEdicaoDocumento,
    toggleNovaPastaSelection,
    toggleEditPastaSelection,
    getEstatisticasPasta,
  };
}