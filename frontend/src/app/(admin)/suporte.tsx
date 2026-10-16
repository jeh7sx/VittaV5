import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/admin/Button';
import Card from '../../components/admin/Card';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import Field from '../../components/admin/Field';
import {
  IconCalendar,
  IconDots,
  IconInbox,
  IconSearch,
  IconUsers,
} from '../../components/Icons';
import StatCard from '../../components/admin/StatCard';
import { db } from '../../services/firebase';
import { styles } from '../../styles/app/(admin)/suporte';

export type StatusChamado = 'aberto' | 'em_andamento' | 'resolvido';

export interface ItemChamado {
  id: string;
  usuarioNome: string;
  usuarioEmail: string;
  assunto: string;
  mensagem: string;
  respostaAdmin?: string;
  status: StatusChamado;
  criadoEm: string;
}

const FILTROS: { valor: 'todos' | StatusChamado; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'aberto', rotulo: 'Abertos' },
  { valor: 'em_andamento', rotulo: 'Em atendimento' },
  { valor: 'resolvido', rotulo: 'Resolvidos' },
];

export default function SuporteAdmin() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width < 980;

  const [chamados, setChamados] = useState<ItemChamado[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | StatusChamado>('todos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Modal de Detalhes / Resposta
  const [chamadoSelecionado, setChamadoSelecionado] = useState<ItemChamado | null>(null);
  const [resposta, setResposta] = useState('');
  const [novoStatus, setNovoStatus] = useState<StatusChamado>('aberto');
  const [salvando, setSalvando] = useState(false);

  async function carregarChamados() {
    try {
      setCarregando(true);
      setErro(null);

      const q = query(collection(db, 'suporte'), orderBy('criadoEm', 'desc'));
      const snap = await getDocs(q).catch(async () => {
        // Fallback caso não haja índice composto configurado
        return await getDocs(collection(db, 'suporte'));
      });

      const lista: ItemChamado[] = snap.docs.map((docu) => {
        const d = docu.data();
        let dt = '—';
        if (d.criadoEm) {
          const data = d.criadoEm.toDate ? d.criadoEm.toDate() : new Date(d.criadoEm);
          if (!isNaN(data.getTime())) {
            dt = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()} ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
          }
        }

        return {
          id: docu.id,
          usuarioNome: d.usuarioNome || d.nome || 'Usuário',
          usuarioEmail: d.usuarioEmail || d.email || '—',
          assunto: d.assunto || 'Dúvida geral',
          mensagem: d.mensagem || d.descricao || 'Sem descrição fornecida.',
          respostaAdmin: d.respostaAdmin || '',
          status: (d.status as StatusChamado) || 'aberto',
          criadoEm: dt,
        };
      });

      setChamados(lista);
    } catch (e) {
      console.error('Erro ao carregar chamados de suporte:', e);
      setErro('Não foi possível carregar os tickets de suporte.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarChamados();
  }, []);

  const chamadosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return chamados.filter((c) => {
      const matchBusca =
        !termo ||
        c.usuarioNome.toLowerCase().includes(termo) ||
        c.usuarioEmail.toLowerCase().includes(termo) ||
        c.assunto.toLowerCase().includes(termo);
      const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [chamados, busca, filtroStatus]);

  const indicadores = useMemo(() => {
    return {
      total: chamados.length,
      abertos: chamados.filter((c) => c.status === 'aberto').length,
      emAndamento: chamados.filter((c) => c.status === 'em_andamento').length,
      resolvidos: chamados.filter((c) => c.status === 'resolvido').length,
    };
  }, [chamados]);

  function abrirDetalhes(chamado: ItemChamado) {
    setChamadoSelecionado(chamado);
    setResposta(chamado.respostaAdmin || '');
    setNovoStatus(chamado.status);
  }

  async function salvarAtendimento() {
    if (!chamadoSelecionado) return;

    try {
      setSalvando(true);
      await updateDoc(doc(db, 'suporte', chamadoSelecionado.id), {
        respostaAdmin: resposta.trim(),
        status: novoStatus,
        atualizadoEm: new Date(),
      });

      Alert.alert('Sucesso', 'Chamado atualizado com sucesso!');
      setChamadoSelecionado(null);
      carregarChamados();
    } catch (e) {
      console.error('Erro ao atualizar chamado:', e);
      Alert.alert('Erro', 'Não foi possível salvar o atendimento.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluirChamado(id: string) {
    try {
      setSalvando(true);
      await deleteDoc(doc(db, 'suporte', id));
      Alert.alert('Sucesso', 'Ticket removido com sucesso.');
      setChamadoSelecionado(null);
      carregarChamados();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover o chamado.');
    } finally {
      setSalvando(false);
    }
  }

  function renderizarBadgeStatus(status: StatusChamado) {
    const configs = {
      aberto: { bg: '#FDECEC', cor: '#B00020', label: 'Aberto' },
      em_andamento: { bg: '#FFF8E1', cor: '#8A5B00', label: 'Em atendimento' },
      resolvido: { bg: '#DCF3E2', cor: '#1B7A3E', label: 'Resolvido' },
    };
    const c = configs[status] || configs.aberto;

    return (
      <View style={[styles.badgeStatus, { backgroundColor: c.bg }]}>
        <Text style={[styles.badgeStatusTexto, { color: c.cor }]}>{c.label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminSidebar />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{
          padding: isMobile ? 16 : 28,
          paddingTop: isMobile ? 70 : 28,
        }}
      >
        <View style={styles.headerContainer}>
          <AdminHeader />
        </View>

        {erro ? (
          <Card>
            <ErrorState mensagem={erro} aoTentarNovamente={carregarChamados} />
          </Card>
        ) : (
          <>
            {/* Indicadores de Suporte */}
            <View style={[styles.cardsIndicadores, { flexDirection: isTablet ? 'column' : 'row' }]}>
              {carregando ? (
                [0, 1, 2, 3].map((i) => (
                  <Card key={i} style={styles.cardCarregando}>
                    <ActivityIndicator size="small" color="#F7B500" />
                  </Card>
                ))
              ) : (
                <>
                  <StatCard icone={<IconUsers color="#8A5B00" />} corIcone="#FCE7B8" rotulo="Total de Chamados" valor={indicadores.total} />
                  <StatCard icone={<Text style={{ fontSize: 16 }}>🔴</Text>} corIcone="#FBDFE2" rotulo="Pendentes" valor={indicadores.abertos} />
                  <StatCard icone={<Text style={{ fontSize: 16 }}>🟡</Text>} corIcone="#FFF0D4" rotulo="Em Atendimento" valor={indicadores.emAndamento} />
                  <StatCard icone={<Text style={{ fontSize: 16 }}>🟢</Text>} corIcone="#DCF3E2" rotulo="Resolvidos" valor={indicadores.resolvidos} />
                </>
              )}
            </View>

            {/* Filtros e Busca */}
            <View style={[styles.barraAcoes, { flexDirection: isMobile ? 'column' : 'row' }]}>
              <View style={{ flex: 1, width: isMobile ? '100%' : undefined }}>
                <Field
                  valor={busca}
                  onChangeText={setBusca}
                  placeholder="Pesquisar por usuário, e-mail ou assunto"
                  icone={<IconSearch />}
                />
              </View>

              {/* Botões de Filtro Rápido */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {FILTROS.map((f) => {
                    const ativo = filtroStatus === f.valor;
                    return (
                      <TouchableOpacity
                        key={f.valor}
                        onPress={() => setFiltroStatus(f.valor)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: 10,
                          backgroundColor: ativo ? '#FFF8E1' : '#FFFFFF',
                          borderWidth: 1,
                          borderColor: ativo ? '#F7B500' : '#EAEAEA',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: ativo ? '700' : '500', color: ativo ? '#8A5B00' : '#666' }}>
                          {f.rotulo}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Lista de Chamados */}
            <Card padding={0}>
              {carregando ? (
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#F7B500" />
                </View>
              ) : chamadosFiltrados.length === 0 ? (
                <EmptyState
                  icone={<IconInbox />}
                  titulo="Nenhum chamado encontrado"
                  descricao="Não há tickets cadastrados ou correspondentes ao filtro."
                />
              ) : (
                chamadosFiltrados.map((chamado, idx) => (
                  <View
                    key={chamado.id}
                    style={[
                      styles.linhaChamado,
                      {
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: 14,
                        borderBottomWidth: idx === chamadosFiltrados.length - 1 ? 0 : 1,
                      },
                    ]}
                  >
                    {/* Usuário e Assunto */}
                    <View style={{ flex: 1.5, minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }} numberOfLines={1}>
                        {chamado.assunto}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#888' }} numberOfLines={1}>
                        Por {chamado.usuarioNome} ({chamado.usuarioEmail})
                      </Text>
                    </View>

                    {/* Data */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 0.9 }}>
                      <IconCalendar />
                      <Text style={{ fontSize: 12, color: '#666' }}>{chamado.criadoEm}</Text>
                    </View>

                    {/* Status + Ação */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: isMobile ? 0 : 'auto' }}>
                      {renderizarBadgeStatus(chamado.status)}

                      <TouchableOpacity
                        onPress={() => abrirDetalhes(chamado)}
                        style={styles.botaoMenu}
                        accessibilityLabel="Ver chamado"
                      >
                        <IconDots />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>

      {/* Modal de Detalhes e Atendimento */}
      <Modal visible={chamadoSelecionado !== null} transparent animationType="fade" onRequestClose={() => setChamadoSelecionado(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>Atendimento de Suporte</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>Ticket #{chamadoSelecionado?.id.slice(0, 8)}</Text>
              </View>

              <TouchableOpacity onPress={() => setChamadoSelecionado(null)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: '#888', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 14 }}>
                {/* Informações do Solicitante */}
                <View style={{ backgroundColor: '#FAFAFA', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }}>{chamadoSelecionado?.usuarioNome}</Text>
                  <Text style={{ fontSize: 12, color: '#777' }}>{chamadoSelecionado?.usuarioEmail}</Text>
                  <Text style={{ fontSize: 11, color: '#AAA', marginTop: 4 }}>Enviado em {chamadoSelecionado?.criadoEm}</Text>
                </View>

                {/* Mensagem do Usuário */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                    Assunto: {chamadoSelecionado?.assunto}
                  </Text>
                  <View style={{ backgroundColor: '#FFFDF5', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FCE7B8' }}>
                    <Text style={{ fontSize: 13, color: '#444', lineHeight: 18 }}>{chamadoSelecionado?.mensagem}</Text>
                  </View>
                </View>

                {/* Seletor de Status */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 }}>Alterar Status</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['aberto', 'em_andamento', 'resolvido'] as StatusChamado[]).map((st) => {
                      const ativo = novoStatus === st;
                      const rotulos = { aberto: 'Aberto', em_andamento: 'Em atendimento', resolvido: 'Resolvido' };
                      return (
                        <TouchableOpacity
                          key={st}
                          onPress={() => setNovoStatus(st)}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: ativo ? '#F7B500' : '#E0E0E0',
                            backgroundColor: ativo ? '#FFF8E1' : '#FFF',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: ativo ? '#8A5B00' : '#666' }}>
                            {rotulos[st]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Resposta do Administrador */}
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 }}>
                    Resposta da Equipe / Notas Internas
                  </Text>
                  <TextInput
                    value={resposta}
                    onChangeText={setResposta}
                    placeholder="Digite a resposta ou solução aplicada para este chamado..."
                    placeholderTextColor="#AAA"
                    multiline
                    numberOfLines={4}
                    style={{
                      backgroundColor: '#FAFAFA',
                      borderWidth: 1,
                      borderColor: '#EAEAEA',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 13,
                      color: '#222',
                      textAlignVertical: 'top',
                      minHeight: 80,
                    }}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Ações Inferiores */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => chamadoSelecionado && excluirChamado(chamadoSelecionado.id)}
                disabled={salvando}
                style={{ padding: 6 }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#B00020' }}>Excluir Ticket</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button label="Fechar" variante="secundaria" onPress={() => setChamadoSelecionado(null)} tamanho="sm" />
                <Button label="Salvar Atendimento" onPress={salvarAtendimento} carregando={salvando} tamanho="sm" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}