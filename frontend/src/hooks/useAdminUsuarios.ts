import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiltroStatusUsuario, IndicadoresUsuarios, UsuarioAdmin } from '../types/admin';
import { auth, db } from '../services/firebase';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';

export interface UsuarioAdminExtendido extends UsuarioAdmin {
  totalFilhos?: number;
}

export function useAdminUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdminExtendido[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresUsuarios | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatusUsuario>('todos');
  const [modalFiltroVisivel, setModalFiltroVisivel] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [idsProcessando, setIdsProcessando] = useState<string[]>([]);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioAdminExtendido | null>(null);
  const [modoModal, setModoModal] = useState<'visualizar' | 'editar' | null>(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [usuariosSnap, filhosSnap] = await Promise.all([
        getDocs(collection(db, 'usuarios')),
        getDocs(collection(db, 'filhos')),
      ]);

      // Mapeia a contagem de filhos por responsável
      const contagemFilhosMap: Record<string, number> = {};
      filhosSnap.docs.forEach((d) => {
        const responsavelId = d.data().responsavelId;
        if (responsavelId) {
          contagemFilhosMap[responsavelId] = (contagemFilhosMap[responsavelId] || 0) + 1;
        }
      });

      const lista: UsuarioAdminExtendido[] = usuariosSnap.docs.map((docu) => {
        const d = docu.data();

        let criadoStr: string | null = null;
        try {
          const criado = (d.criadoEm as any)?.toDate ? (d.criadoEm as any).toDate() : d.criadoEm ? new Date(d.criadoEm) : null;
          if (criado instanceof Date && !isNaN(criado.getTime())) {
            criadoStr = `${String(criado.getDate()).padStart(2, '0')}/${String(criado.getMonth() + 1).padStart(2, '0')}/${criado.getFullYear()}`;
          }
        } catch (e) {
          criadoStr = null;
        }

        return {
          id: docu.id,
          nome: typeof d.nome === 'string' ? d.nome : '',
          email: typeof d.email === 'string' ? d.email : '',
          dataNascimento: typeof d.dataNascimento === 'string' ? d.dataNascimento : '',
          cpf: typeof d.cpf === 'string' ? d.cpf : '',
          cargo: d.cargo ?? 'admin', // 👈 Adicione um valor padrão aqui
          status: typeof d.status === 'string' ? (d.status === 'ativo' ? 'ativo' : 'bloqueado') : 'ativo',
          fotoUri: d.fotoUri || d.foto || d.avatarUrl || null,
          criadoEm: criadoStr,
          totalFilhos: contagemFilhosMap[docu.id] || 0,
        };
      });

      setUsuarios(lista);

      setIndicadores({
        totalUsuarios: lista.length,
        usuariosAtivos: lista.filter((u) => u.status === 'ativo').length,
        novosEsteMes: lista.slice(-30).length,
        bloqueados: lista.filter((u) => u.status === 'bloqueado').length,
      });
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      setErro('Não foi possível carregar a lista de usuários.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const combinaBusca =
        !termo || usuario.nome.toLowerCase().includes(termo) || usuario.email.toLowerCase().includes(termo);
      const combinaStatus =
        filtroStatus === 'todos' ||
        (filtroStatus === 'ativos' && usuario.status === 'ativo') ||
        (filtroStatus === 'bloqueados' && usuario.status === 'bloqueado');
      return combinaBusca && combinaStatus;
    });
  }, [usuarios, busca, filtroStatus]);

  function exportarUsuariosCSV() {
    if (usuariosFiltrados.length === 0) {
      Alert.alert('Aviso', 'Não há usuários para exportar.');
      return;
    }

    const cabecalho = ['ID', 'Nome', 'Email', 'CPF', 'Data de Nascimento', 'Status', 'Criado Em', 'Qtd Filhos'];
    const linhas = usuariosFiltrados.map((u) => [
      u.id,
      `"${u.nome}"`,
      u.email,
      u.cpf || '—',
      u.dataNascimento || '—',
      u.status,
      u.criadoEm || '—',
      u.totalFilhos || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [cabecalho.join(';'), ...linhas.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `usuarios-vitta-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function alternarBloqueio(usuario: UsuarioAdminExtendido) {
    setIdsProcessando((ids) => [...ids, usuario.id]);
    try {
      const novoStatus = usuario.status === 'ativo' ? 'bloqueado' : 'ativo';
      await updateDoc(doc(db, 'usuarios', usuario.id), { status: novoStatus });
      setUsuarios((lista) => lista.map((u) => (u.id === usuario.id ? { ...u, status: novoStatus } : u)));
      try {
        Alert.alert('Sucesso', `Usuário ${usuario.nome} ${novoStatus === 'ativo' ? 'ativado' : 'bloqueado'} com sucesso.`);
      } catch (e) {}
    } catch (e) {
      console.error('Erro ao alterar status do usuário:', e);
    } finally {
      setIdsProcessando((ids) => ids.filter((id) => id !== usuario.id));
    }
  }

  function fecharModalUsuario() {
    setModoModal(null);
    setUsuarioSelecionado(null);
  }

  async function salvarEdicao(dados: Pick<UsuarioAdmin, 'id' | 'nome' | 'email'>) {
    setIdsProcessando((ids) => [...ids, dados.id]);
    try {
      await updateDoc(doc(db, 'usuarios', dados.id), { nome: dados.nome, email: dados.email });
      setUsuarios((lista) => lista.map((u) => (u.id === dados.id ? { ...u, nome: dados.nome, email: dados.email } : u)));
      fecharModalUsuario();
      try {
        Alert.alert('Sucesso', 'Dados do usuário atualizados.');
      } catch (e) {}
    } catch (e) {
      console.error('Erro ao salvar edição do usuário:', e);
    } finally {
      setIdsProcessando((ids) => ids.filter((id) => id !== dados.id));
    }
  }

  async function enviarRedefinicaoSenha(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email enviado', 'Um email de redefinição de senha foi enviado.');
    } catch (e) {
      console.error('Erro ao enviar email de redefinição:', e);
      Alert.alert('Erro', 'Não foi possível enviar o email de redefinição.');
    }
  }

  async function excluirUsuario(id: string) {
    try {
      const colecoes = ['filhos', 'exames', 'medicamentos', 'consultas', 'notificacoes', 'logs'];
      for (const col of colecoes) {
        const q = query(collection(db, col), where('responsavelId', '==', id));
        const snap = await getDocs(q);
        const batchPromises = snap.docs.map((docu) => deleteDoc(docu.ref));
        await Promise.all(batchPromises);
      }

      await deleteDoc(doc(db, 'usuarios', id));
      setUsuarios((lista) => lista.filter((u) => u.id !== id));
      try {
        Alert.alert('Sucesso', 'Usuário e todos os dados associados foram excluídos com sucesso.');
      } catch (e) {}
    } catch (e) {
      console.error('Erro ao excluir usuário:', e);
      Alert.alert('Erro', 'Não foi possível excluir o usuário.');
    }
  }

  return {
    usuarios: usuariosFiltrados,
    totalCarregado: usuarios.length,
    indicadores,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    modalFiltroVisivel,
    setModalFiltroVisivel,
    carregando,
    erro,
    recarregar: carregar,
    idsProcessando,
    alternarBloqueio,
    usuarioSelecionado,
    modoModal,
    fecharModalUsuario,
    salvarEdicao,
    enviarRedefinicaoSenha,
    excluirUsuario,
    exportarUsuariosCSV,
  };
}