import { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Pressable,  
} from 'react-native';
import { colors } from '@/styles/colors';
import { tipografia } from '@/styles/tipografia';
import ButtonDelete from '@/components/Buttons/ButtonDelete';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Badge from '../../components/admin/Badge';
import Card from '../../components/admin/Card';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import Field from '../../components/admin/Field';
import {
  IconDots,
  IconInbox,
} from '../../components/Icons';
import StatCard from '../../components/admin/StatCard';
import { db } from '../../services/firebase';
import { useAdminUsuarios, UsuarioAdminExtendido } from '../../hooks/useAdminUsuarios';
import { FiltroStatusUsuario } from '../../types/admin';
import { styles } from '../../styles/app/(admin)/usuarios';

const OPCOES_FILTRO: { valor: FiltroStatusUsuario; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos os usuários' },
  { valor: 'ativos', rotulo: 'Somente ativos' },
  { valor: 'bloqueados', rotulo: 'Somente bloqueados' },
];

function aplicarMascaraCPF(valor: string): string {
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
  if (apenasNumeros.length <= 3) return apenasNumeros;
  if (apenasNumeros.length <= 6) return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
  if (apenasNumeros.length <= 9) return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`;
  return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
}

function aplicarMascaraData(valor: string): string {
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 8);
  if (apenasNumeros.length <= 2) return apenasNumeros;
  if (apenasNumeros.length <= 4) return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
  return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
}

export default function UsuariosAdmin() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  const {
    usuarios,
    indicadores,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    modalFiltroVisivel,
    setModalFiltroVisivel,
    carregando,
    erro,
    recarregar,
    idsProcessando,
    alternarBloqueio,
    salvarEdicao,
    enviarRedefinicaoSenha,
    excluirUsuario,
    exportarUsuariosCSV,
  } = useAdminUsuarios();

  const filtroRef = useRef<HTMLDivElement | null>(null);
  const [filtroPos, setFiltroPos] = useState<{ top: number; left: number } | null>(null);
  const [usuarioGerenciando, setUsuarioGerenciando] = useState<UsuarioAdminExtendido | null>(null);

  // Modal Novo Usuário
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [novoNascimento, setNovoNascimento] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [criandoUsuario, setCriandoUsuario] = useState(false);

  useEffect(() => {
    if (!modalFiltroVisivel) return;
    try {
      const rect = filtroRef.current?.getBoundingClientRect();
      if (rect) {
        const menuWidth = 220;
        let left = Math.max(8, rect.right - menuWidth);
        if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
        const top = Math.min(window.innerHeight - 8, rect.bottom + 8);
        setFiltroPos({ top, left });
      }
    } catch (e) {
      setFiltroPos(null);
    }
  }, [modalFiltroVisivel]);

  async function criarNovoUsuario() {
    const cpfLimpo = novoCpf.replace(/\D/g, '');

    if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) {
      Alert.alert('Atenção', 'Preencha Nome, E-mail e Senha inicial.');
      return;
    }

    if (cpfLimpo.length !== 11) {
      Alert.alert('CPF Inválido', 'O CPF precisa conter 11 dígitos.');
      return;
    }

    if (novoNascimento.length !== 10) {
      Alert.alert('Data Inválida', 'A data de nascimento precisa estar no formato DD/MM/AAAA.');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert('Senha Curta', 'A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setCriandoUsuario(true);

      const appPrincipal = getApp();
      const nomeSecundario = 'SecondaryAuthAppUser';
      const appSecundario =
        getApps().find((a) => a.name === nomeSecundario) ||
        initializeApp(appPrincipal.options, nomeSecundario);
      const authSecundario = getAuth(appSecundario);

      const cred = await createUserWithEmailAndPassword(authSecundario, novoEmail.trim(), novaSenha);
      const novoUid = cred.user.uid;

      await setDoc(doc(db, 'usuarios', novoUid), {
        uid: novoUid,
        nome: novoNome.trim(),
        email: novoEmail.trim().toLowerCase(),
        cpf: cpfLimpo,
        dataNascimento: novoNascimento,
        status: 'ativo',
        criadoEm: new Date(),
        fotoUri: null,
      });

      Alert.alert('Sucesso', `Usuário ${novoNome} cadastrado com sucesso!`);
      setModalNovoAberto(false);
      setNovoNome('');
      setNovoEmail('');
      setNovoCpf('');
      setNovoNascimento('');
      setNovaSenha('');
      recarregar();
    } catch (e: any) {
      console.error('Erro ao cadastrar usuário:', e);
      Alert.alert('Erro', e.message || 'Não foi possível cadastrar o usuário.');
    } finally {
      setCriandoUsuario(false);
    }
  }

  return (
    <View style={styles.container}>
      <AdminSidebar />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{
          padding: isMobile ? 12 : 24,
          paddingTop: isMobile ? 60 : 24,
          gap: 16,
          width: '100%',
        }}
      >
        <View style={styles.headerContainer}>
          <AdminHeader />
        </View>

        {erro ? (
          <Card>
            <ErrorState mensagem={erro} aoTentarNovamente={recarregar} />
          </Card>
        ) : (
          <>
            {/* Indicadores */}
            <View style={[styles.cardsIndicadores, { flexDirection: isTablet ? 'column' : 'row' }]}>
              {carregando || !indicadores ? (
                [0, 1, 2, 3].map((i) => (
                  <Card key={i} style={styles.cardCarregando}>
                    <ActivityIndicator size="small" color="#F7B500" />
                  </Card>
                ))
              ) : (
                <>
                  <StatCard icone={<Image source={require('@/img/icons/userGroup.svg')} />} corIcone={colors.gray1} rotulo="Total de Usuários" valor={indicadores.totalUsuarios} />
                  <StatCard icone={<Image source={require('@/img/icons/user-check-02.svg')} />} corIcone="#DCF3E2" rotulo="Usuários ativos" valor={indicadores.usuariosAtivos} />
                  <StatCard icone={<Image source={require('@/img/icons/user-check-02.svg')} />} corIcone="#DCEBFF" rotulo="Novos este mês" valor={String(indicadores.novosEsteMes).padStart(2, '0')} />
                  <StatCard icone={<Image source={require('@/img/icons/user-block-02.svg')} style={{ tintColor: colors.delete, width: 24, height: 24 }} />} corIcone={colors.bgDelete} rotulo="Bloqueados" valor={String(indicadores.bloqueados).padStart(2, '0')} />
                </>
              )}
            </View>

            {/* Barra de Busca + Filtro + Exportar + Novo Usuário */}
            <View style={[styles.barraAcoes, { flexDirection: isTablet ? 'column' : 'row' }]}>
              <View style={{ flex: isTablet ? undefined : 1, width: '100%' }}>
                <Field
                  valor={busca}
                  onChangeText={setBusca}
                  placeholder="Pesquisar por nome ou e-mail"
                  icone={<Image source={require('@/img/icons/search-01.svg')} />}
                />
              </View>

              <View
                style={[
                  styles.botoesAcoesContainer,
                  {
                    flexDirection: isMobile ? 'column' : 'row',
                    width: isTablet ? '100%' : 'auto',
                  },
                ]}
              >
                <View style={{ width: isMobile ? '100%' : 'auto' }}>
                  <ButtonSecondary
                    texto={`Filtrar${filtroStatus !== 'todos' ? ' •' : ''}`}
                    onPress={() => setModalFiltroVisivel(!modalFiltroVisivel)}
                    icone={require('@/img/icons/filter-horizontal.svg')}
                    style={{ width: '100%' }}
                  />
                </View>

                <View style={{ width: isMobile ? '100%' : 'auto' }}>
                  <ButtonSecondary
                    texto="Exportar CSV"
                    onPress={exportarUsuariosCSV}
                    icone={require('@/img/icons/upload-01.svg')}
                    style={{ width: '100%' }}
                  />
                </View>

                <View style={{ width: isMobile ? '100%' : 'auto' }}>
                  <ButtonPrimary
                    texto="Novo Usuário"
                    onPress={() => setModalNovoAberto(true)}
                    icone={require('@/img/icons/add-01.svg')}
                  />
                </View>
              </View>

              {modalFiltroVisivel && (
                <Modal
                  transparent
                  animationType="none"
                  visible={modalFiltroVisivel}
                  onRequestClose={() => setModalFiltroVisivel(false)}
                >
                  <Pressable
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    onPress={() => setModalFiltroVisivel(false)}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        top: filtroPos?.top ?? 100,
                        left: filtroPos?.left ?? 20,
                        minWidth: 200,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#EAEAEA',
                        paddingVertical: 6,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 10,
                        elevation: 8,
                      }}
                    >
                      {OPCOES_FILTRO.map((opcao) => (
                        <TouchableOpacity
                          key={opcao.valor}
                          onPress={() => {
                            setFiltroStatus(opcao.valor);
                            setModalFiltroVisivel(false);
                          }}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            backgroundColor: filtroStatus === opcao.valor ? '#FFF8E1' : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: filtroStatus === opcao.valor ? '700' : '500',
                              color: filtroStatus === opcao.valor ? '#8A5B00' : '#444',
                            }}
                          >
                            {opcao.rotulo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Pressable>
                </Modal>
              )}
            </View>

            {/* Lista de usuários */}
            <Card padding={isMobile ? 10 : 16} style={{ width: '100%' }}>
              {carregando ? (
                <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#F7B500" />
                </View>
              ) : usuarios.length === 0 ? (
                <EmptyState
                  icone={<IconInbox />}
                  titulo="Nenhum usuário encontrado"
                  descricao="Tente ajustar sua busca ou o filtro selecionado."
                />
              ) : (
                usuarios.map((usuario, indice) => (
                  <LinhaUsuario
                    key={usuario.id}
                    usuario={usuario}
                    ultima={indice === usuarios.length - 1}
                    processando={idsProcessando.includes(usuario.id)}
                    isMobile={isMobile}
                    onAbrirGerenciamento={() => setUsuarioGerenciando(usuario)}
                  />
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>

      {/* Modal Cadastrar Usuário */}
      <Modal visible={modalNovoAberto} transparent animationType="fade" onRequestClose={() => setModalNovoAberto(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={tipografia.h2}>Cadastrar Usuário</Text>
              <TouchableOpacity onPress={() => setModalNovoAberto(false)} style={{ padding: 4 }}>
                <Image source={require('@/img/icons/x.svg')} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 14 }}>
                <Field
                  label="Nome Completo"
                  valor={novoNome}
                  onChangeText={setNovoNome}
                  placeholder="Ex: Lucas Gabriel"
                />
                <Field
                  label="E-mail"
                  valor={novoEmail}
                  onChangeText={setNovoEmail}
                  placeholder="lucas@gmail.com"
                />
                <Field
                  label="CPF"
                  valor={novoCpf}
                  onChangeText={(v) => setNovoCpf(aplicarMascaraCPF(v))}
                  placeholder="000.000.000-00"
                />
                <Field
                  label="Data de Nascimento"
                  valor={novoNascimento}
                  onChangeText={(v) => setNovoNascimento(aplicarMascaraData(v))}
                  placeholder="DD/MM/AAAA"
                />
                <Field
                  label="Senha Inicial"
                  valor={novaSenha}
                  onChangeText={setNovaSenha}
                  placeholder="Mínimo 6 caracteres"
                />
              </View>
            </ScrollView>

            <View style={{ flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <ButtonSecondary texto="Cancelar" onPress={() => setModalNovoAberto(false)} style={isMobile ? { width: '100%' } : undefined} />
              <ButtonPrimary texto={criandoUsuario ? 'Cadastrando...' : 'Cadastrar usuário'} onPress={criarNovoUsuario} style={isMobile ? { width: '100%' } : undefined} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Unificado de Ações do Usuário */}
      <ModalGerenciarUsuario
        visivel={usuarioGerenciando !== null}
        usuario={usuarioGerenciando}
        isMobile={isMobile}
        aoFechar={() => setUsuarioGerenciando(null)}
        aoSalvar={async (dados) => {
          await salvarEdicao(dados);
          setUsuarioGerenciando(null);
        }}
        aoAlternarBloqueio={async (u) => {
          await alternarBloqueio(u);
          setUsuarioGerenciando(null);
        }}
        aoRedefinirSenha={async (email) => {
          await enviarRedefinicaoSenha(email);
        }}
        aoExcluir={async (id) => {
          await excluirUsuario(id);
          setUsuarioGerenciando(null);
        }}
        processando={usuarioGerenciando ? idsProcessando.includes(usuarioGerenciando.id) : false}
      />
    </View>
  );
}

// ─── Linha de usuário ───────────────────────────────────────────────────────

function LinhaUsuario({
  usuario,
  ultima,
  processando,
  isMobile,
  onAbrirGerenciamento,
}: {
  usuario: UsuarioAdminExtendido;
  ultima: boolean;
  processando: boolean;
  isMobile: boolean;
  onAbrirGerenciamento: () => void;
}) {
  return (
    <View
      style={[
        styles.linhaUsuario,
        {
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? 12 : 16,
          opacity: processando ? 0.55 : 1,
        },
      ]}
    >
      {/* Avatar (Foto ou Inicial) + Nome/Email */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: isMobile ? undefined : 1.4, minWidth: 0 }}>
        <View style={styles.avatarContainer}>
          {usuario.fotoUri ? (
            <Image source={{ uri: usuario.fotoUri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={tipografia.body}>
              {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[tipografia.body, { fontWeight: '700' }]} numberOfLines={1}>
            {usuario.nome}
          </Text>
          <Text style={[tipografia.bodySecondary, { fontSize: 13 }]} numberOfLines={1}>
            {usuario.email}
          </Text>
        </View>
      </View>

      {/* Criação da Conta */}
      <View style={[styles.colunaDado, { flex: isMobile ? undefined : 1 }]}>
        <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20 }} />
        <View>
          <Text style={[tipografia.caption, { color: colors.gray4 }]}>Criado em</Text>
          <Text style={tipografia.bodySecondary}>{usuario.criadoEm || '—'}</Text>
        </View>
      </View>

      {/* Nascimento */}
      <View style={[styles.colunaDado, { flex: isMobile ? undefined : 1 }]}>
        <Image source={require('@/img/icons/cake.svg')} style={{ width: 20, height: 20 }} />
        <View>
          <Text style={[tipografia.caption, { color: colors.gray4 }]}>Nascimento</Text>
          <Text style={tipografia.bodySecondary}>{usuario.dataNascimento || '—'}</Text>
        </View>
      </View>

      {/* CPF */}
      <View style={[styles.colunaDado, { flex: isMobile ? undefined : 1 }]}>
        <Image source={require('@/img/icons/identity-card.svg')} style={{ width: 20, height: 20 }} />
        <View>
          <Text style={[tipografia.caption, { color: colors.gray4 }]}>CPF</Text>
          <Text style={tipografia.bodySecondary}>{aplicarMascaraCPF(usuario.cpf)}</Text>
        </View>
      </View>

      {/* Quantidade de Filhos */}
      <View style={[styles.colunaDado, { flex: isMobile ? undefined : 0.8 }]}>
        <View style={styles.badgeFilhos}>
          <Text style={[tipografia.caption, { color: colors.Filhos, fontWeight: '700' }]}>
            {usuario.totalFilhos ?? 0} {usuario.totalFilhos === 1 ? 'Filho' : 'Filhos'}
          </Text>
        </View>
      </View>

      {/* Status + Ações */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          borderTopWidth: isMobile ? 1 : 0,
          borderTopColor: '#F0F0F0',
          paddingTop: isMobile ? 10 : 0,
          marginLeft: isMobile ? 0 : 'auto',
        }}
      >
        {processando ? <ActivityIndicator size="small" color="#F7B500" /> : <Badge status={usuario.status} />}

        <TouchableOpacity
          onPress={onAbrirGerenciamento}
          disabled={processando}
          style={styles.botaoMenu}
          accessibilityLabel="Gerenciar usuário"
        >
          <IconDots />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Modal Unificado de Gerenciamento do Usuário ───────────────────────────

type AbaModal = 'visualizar' | 'editar' | 'bloquear' | 'redefinir' | 'excluir';

function ModalGerenciarUsuario({
  visivel,
  usuario,
  isMobile,
  aoFechar,
  aoSalvar,
  aoAlternarBloqueio,
  aoRedefinirSenha,
  aoExcluir,
  processando,
}: {
  visivel: boolean;
  usuario: UsuarioAdminExtendido | null;
  isMobile: boolean;
  aoFechar: () => void;
  aoSalvar: (dados: Pick<UsuarioAdminExtendido, 'id' | 'nome' | 'email'>) => Promise<void>;
  aoAlternarBloqueio: (usuario: UsuarioAdminExtendido) => Promise<void>;
  aoRedefinirSenha: (email: string) => Promise<void>;
  aoExcluir: (id: string) => Promise<void>;
  processando: boolean;
}) {
  const [abaAtiva, setAbaAtiva] = useState<AbaModal>('visualizar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome ?? '');
      setEmail(usuario.email ?? '');
      setAbaAtiva('visualizar');
      setEmailEnviado(false);
    }
  }, [usuario, visivel]);

  if (!usuario) return null;

  const ehAtivo = usuario.status === 'ativo';

  const abas: { id: AbaModal; rotulo: string; destrutivo?: boolean }[] = [
    { id: 'visualizar', rotulo: 'Visualizar' },
    { id: 'editar', rotulo: 'Editar' },
    { id: 'bloquear', rotulo: ehAtivo ? 'Bloquear' : 'Desbloquear', destrutivo: ehAtivo },
    { id: 'redefinir', rotulo: 'Redefinir Senha' },
    { id: 'excluir', rotulo: 'Excluir', destrutivo: true },
  ];

  return (
    <Modal animationType="fade" transparent visible={visivel} onRequestClose={aoFechar}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          {/* Cabeçalho */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <View style={[styles.avatarContainer, { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF4D6' }]}>
                {usuario.fotoUri ? (
                  <Image source={{ uri: usuario.fotoUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#8A5B00' }}>
                    {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U'}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={tipografia.h3} numberOfLines={1}>{usuario.nome}</Text>
                <Text style={tipografia.bodySecondary} numberOfLines={1}>{usuario.email}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={aoFechar} style={{ padding: 6 }}>
              <Image source={require('@/img/icons/x.svg')} />
            </TouchableOpacity>
          </View>

          {/* Abas */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 8 }}>
              {abas.map((aba) => {
                const ativa = abaAtiva === aba.id;
                return (
                  <TouchableOpacity
                    key={aba.id}
                    onPress={() => setAbaAtiva(aba.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 999,
                      backgroundColor: ativa ? (aba.destrutivo ? '#FDECEC' : colors.yellow5) : 'transparent',
                    }}
                  >
                    <Text
                      style={[
                        tipografia.caption,
                        {
                          fontWeight: '700',
                          color: ativa ? (aba.destrutivo ? '#B00020' : colors.yellow9) : colors.gray4,
                        },
                      ]}
                    >
                      {aba.rotulo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Conteúdo Dinâmico */}
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {abaAtiva === 'visualizar' && (
              <View style={{ gap: 14 }}>
                <Field label="Nome" valor={usuario.nome} onChangeText={() => { }} editavel={false} />
                <Field label="E-mail" valor={usuario.email} onChangeText={() => { }} editavel={false} />
                <Field label="Data de criação da conta" valor={usuario.criadoEm ?? '—'} onChangeText={() => { }} editavel={false} />
                <Field label="Nascimento" valor={usuario.dataNascimento || '—'} onChangeText={() => { }} editavel={false} />
                <Field label="CPF" valor={aplicarMascaraCPF(usuario.cpf)} onChangeText={() => { }} editavel={false} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={tipografia.body}>Status atual:</Text>
                  <Badge status={usuario.status} />
                </View>
              </View>
            )}

            {abaAtiva === 'editar' && (
              <View style={{ gap: 14 }}>
                <Field label="Nome" valor={nome} onChangeText={setNome} editavel={true} />
                <Field label="E-mail" valor={email} onChangeText={setEmail} editavel={true} />
                <Field label="Data de criação da conta" valor={usuario.criadoEm ?? '—'} onChangeText={() => { }} editavel={false} />
                <Field label="Nascimento" valor={usuario.dataNascimento || '—'} onChangeText={() => { }} editavel={false} />
                <Field label="CPF" valor={aplicarMascaraCPF(usuario.cpf)} onChangeText={() => { }} editavel={false} />

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <ButtonPrimary
                    texto="Salvar Alterações"
                    onPress={() => aoSalvar({ id: usuario.id, nome, email })}
                    style={isMobile ? { width: '100%' } : undefined}
                  />
                </View>
              </View>
            )}

            {abaAtiva === 'bloquear' && (
              <View style={{ gap: 16, paddingVertical: 8 }}>
                <Text style={tipografia.body}>
                  {ehAtivo
                    ? `Deseja realmente bloquear o acesso de "${usuario.nome}"? O usuário não conseguirá mais entrar no aplicativo.`
                    : `Deseja desbloquear e restaurar o acesso de "${usuario.nome}"?`}
                </Text>
                <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <ButtonSecondary texto="Cancelar" onPress={aoFechar} style={isMobile ? { width: '100%' } : undefined} />
                  <ButtonDelete
                    texto={ehAtivo ? 'Sim, Bloquear' : 'Sim, Desbloquear'}
                    onPress={() => aoAlternarBloqueio(usuario)}
                    style={isMobile ? { width: '100%' } : undefined}
                  />
                </View>
              </View>
            )}

            {abaAtiva === 'redefinir' && (
              <View style={{ gap: 16, paddingVertical: 8 }}>
                <Text style={tipografia.body}>
                  Será enviado um e-mail com instruções para redefinição segura de senha para:
                </Text>
                <Text style={tipografia.h3}>{usuario.email}</Text>

                {emailEnviado && (
                  <View style={{ padding: 14, backgroundColor: '#f5fff6', borderRadius: 16 }}>
                    <Text style={[tipografia.caption, { color: '#1b4e1d', fontWeight: '700' }]}>
                      ✅ E-mail de redefinição enviado com sucesso!
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <ButtonSecondary texto="Cancelar" onPress={aoFechar} style={isMobile ? { width: '100%' } : undefined} />
                  <ButtonPrimary
                    texto="Enviar E-mail"
                    onPress={async () => {
                      await aoRedefinirSenha(usuario.email);
                      setEmailEnviado(true);
                    }}
                    style={isMobile ? { width: '100%' } : undefined}
                  />
                </View>
              </View>
            )}

            {abaAtiva === 'excluir' && (
              <View style={{ gap: 16, paddingVertical: 8 }}>
                <View style={{ backgroundColor: '#fff6f6', padding: 20, borderRadius: 20, gap: 8 }}>
                  <Text style={[tipografia.h3, { color: colors.delete }]}>
                    Atenção: Ação Irreversível!
                  </Text>
                  <Text style={tipografia.body}>
                    Ao excluir o usuário <Text style={{ fontWeight: '700' }}>{usuario.nome}</Text>, todos os dados associados a ele (filhos, exames, medicamentos e consultas) serão apagados do Firestore.
                  </Text>
                </View>

                <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <ButtonSecondary texto="Cancelar" onPress={aoFechar} style={isMobile ? { width: '100%' } : undefined} />
                  <ButtonDelete
                    texto="Excluir Permanentemente"
                    onPress={() => aoExcluir(usuario.id)}
                    style={isMobile ? { width: '100%' } : undefined}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}