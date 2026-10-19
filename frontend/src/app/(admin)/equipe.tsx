import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Badge from '../../components/admin/Badge';
import Button from '../../components/admin/Button';
import Card from '../../components/admin/Card';
import Field from '../../components/admin/Field';
import { IconCalendar, IconDots, IconIdCard } from '../../components/Icons';
import { auth, db } from '../../services/firebase';

interface ItemAdmin {
  id: string;
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  nascimento: string;
  cargo: 'superadmin' | 'admin';
  status: 'ativo' | 'bloqueado';
  criadoEm: string;
}

// ─── Funções de Alerta Seguro ───────────────────────────────────────────────

function exibirAlerta(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}: ${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
}

// ─── Funções de Máscara e Formatação ────────────────────────────────────────

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

export default function EquipeAdmin() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [admins, setAdmins] = useState<ItemAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [ehSuperadmin, setEhSuperadmin] = useState(false);

  // Modal Novo Admin
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [novoNascimento, setNovoNascimento] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoCargo, setNovoCargo] = useState<'admin' | 'superadmin'>('admin');
  const [criando, setCriando] = useState(false);

  // Modal de Ações e Gerenciamento
  const [adminSelecionado, setAdminSelecionado] = useState<ItemAdmin | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState(false);

  // Modal Editar Admin
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [editId, setEditId] = useState('');
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editNascimento, setEditNascimento] = useState('');
  const [editCargo, setEditCargo] = useState<'admin' | 'superadmin'>('admin');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  async function carregarAdmins() {
    setCarregando(true);
    try {
      const userAtual = auth.currentUser;
      if (userAtual) {
        const snapMe = await getDoc(doc(db, 'admins', userAtual.uid));
        if (snapMe.exists() && snapMe.data().cargo === 'superadmin') {
          setEhSuperadmin(true);
        }
      }

      const snap = await getDocs(collection(db, 'admins'));
      const lista: ItemAdmin[] = snap.docs.map((d) => {
        const data = d.data();
        let criadoStr = '—';
        if (data.criadoEm) {
          const dt = data.criadoEm.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
          if (!isNaN(dt.getTime())) {
            criadoStr = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
          }
        }
        return {
          id: d.id,
          uid: data.uid || d.id,
          nome: data.nome || 'Sem Nome',
          email: data.email || '—',
          cpf: data.cpf || '',
          nascimento: data.nascimento || '—',
          cargo: data.cargo === 'superadmin' ? 'superadmin' : 'admin',
          status: data.status === 'bloqueado' ? 'bloqueado' : 'ativo',
          criadoEm: criadoStr,
        };
      });
      setAdmins(lista);
    } catch (e) {
      console.error('Erro ao carregar equipe de admins:', e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAdmins();
  }, []);

  async function criarNovoAdmin() {
    const cpfLimpo = novoCpf.replace(/\D/g, '');

    if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) {
      exibirAlerta('Atenção', 'Preencha Nome, E-mail e Senha.');
      return;
    }

    if (cpfLimpo.length !== 11) {
      exibirAlerta('CPF Inválido', 'O CPF precisa conter 11 dígitos.');
      return;
    }

    if (novoNascimento.length !== 10) {
      exibirAlerta('Data Inválida', 'A data de nascimento precisa estar no formato DD/MM/AAAA.');
      return;
    }

    if (novaSenha.length < 6) {
      exibirAlerta('Senha Curta', 'A senha provisória precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setCriando(true);

      const appPrincipal = getApp();
      const nomeSecundario = 'SecondaryAuthApp';
      const appSecundario =
        getApps().find((a) => a.name === nomeSecundario) ||
        initializeApp(appPrincipal.options, nomeSecundario);
      const authSecundario = getAuth(appSecundario);

      const credenciais = await createUserWithEmailAndPassword(authSecundario, novoEmail.trim(), novaSenha);
      const novoUid = credenciais.user.uid;

      await setDoc(doc(db, 'admins', novoUid), {
        uid: novoUid,
        nome: novoNome.trim(),
        email: novoEmail.trim().toLowerCase(),
        cpf: cpfLimpo,
        nascimento: novoNascimento,
        cargo: novoCargo,
        status: 'ativo',
        criadoEm: new Date(),
      });

      exibirAlerta('Sucesso', `Administrador ${novoNome} cadastrado com sucesso!`);
      setModalNovoAberto(false);
      setNovoNome('');
      setNovoEmail('');
      setNovoCpf('');
      setNovoNascimento('');
      setNovaSenha('');
      setNovoCargo('admin');
      carregarAdmins();
    } catch (e: any) {
      console.error('Erro ao criar admin:', e);
      exibirAlerta('Erro', e.message || 'Não foi possível cadastrar o administrador.');
    } finally {
      setCriando(false);
    }
  }

  function abrirModalEdicao(admin: ItemAdmin) {
    setEditId(admin.id);
    setEditNome(admin.nome);
    setEditEmail(admin.email);
    setEditCpf(aplicarMascaraCPF(admin.cpf));
    setEditNascimento(aplicarMascaraData(admin.nascimento));
    setEditCargo(admin.cargo);
    setAdminSelecionado(null);
    setModalEditarAberto(true);
  }

  async function salvarEdicaoAdmin() {
    const cpfLimpo = editCpf.replace(/\D/g, '');

    if (!editNome.trim() || !editEmail.trim()) {
      exibirAlerta('Atenção', 'Nome e E-mail não podem ficar vazios.');
      return;
    }

    if (cpfLimpo.length !== 11) {
      exibirAlerta('CPF Inválido', 'O CPF precisa conter 11 dígitos.');
      return;
    }

    if (editNascimento.length !== 10) {
      exibirAlerta('Data Inválida', 'A data de nascimento precisa estar no formato DD/MM/AAAA.');
      return;
    }

    try {
      setSalvandoEdicao(true);
      await updateDoc(doc(db, 'admins', editId), {
        nome: editNome.trim(),
        email: editEmail.trim().toLowerCase(),
        cpf: cpfLimpo,
        nascimento: editNascimento,
        cargo: editCargo,
      });

      exibirAlerta('Sucesso', 'Dados do administrador atualizados com sucesso!');
      setModalEditarAberto(false);
      carregarAdmins();
    } catch (e: any) {
      console.error('Erro ao atualizar admin:', e);
      exibirAlerta('Erro', e.message || 'Não foi possível salvar as alterações.');
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function alternarCargo(admin: ItemAdmin) {
    const novoCargo = admin.cargo === 'superadmin' ? 'admin' : 'superadmin';
    try {
      setProcessandoAcao(true);
      await updateDoc(doc(db, 'admins', admin.id), { cargo: novoCargo });
      exibirAlerta('Sucesso', `Cargo de ${admin.nome} alterado para ${novoCargo.toUpperCase()}.`);
      setAdminSelecionado(null);
      carregarAdmins();
    } catch (e) {
      exibirAlerta('Erro', 'Não foi possível alterar o cargo.');
    } finally {
      setProcessandoAcao(false);
    }
  }

  async function alternarStatus(admin: ItemAdmin) {
    if (admin.uid === auth.currentUser?.uid) {
      exibirAlerta('Ação Negada', 'Você não pode bloquear o seu próprio usuário.');
      return;
    }

    const novoStatus = admin.status === 'ativo' ? 'bloqueado' : 'ativo';

    const executarAlteracao = async () => {
      try {
        setProcessandoAcao(true);
        await updateDoc(doc(db, 'admins', admin.id), { status: novoStatus });
        exibirAlerta('Sucesso', `Status de ${admin.nome} alterado para ${novoStatus.toUpperCase()}.`);
        setAdminSelecionado(null);
        await carregarAdmins();
      } catch (e) {
        console.error('Erro ao alterar status:', e);
        exibirAlerta('Erro', 'Não foi possível alterar o status do administrador.');
      } finally {
        setProcessandoAcao(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Deseja realmente ${novoStatus === 'bloqueado' ? 'bloquear' : 'desbloquear'} o acesso de ${admin.nome}?`);
      if (confirmou) {
        await executarAlteracao();
      }
    } else {
      Alert.alert(
        'Confirmar Ação',
        `Deseja realmente ${novoStatus === 'bloqueado' ? 'bloquear' : 'desbloquear'} o acesso de ${admin.nome}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: novoStatus === 'bloqueado' ? 'destructive' : 'default',
            onPress: executarAlteracao,
          },
        ]
      );
    }
  }

  async function excluirAdmin(admin: ItemAdmin) {
    if (admin.uid === auth.currentUser?.uid) {
      exibirAlerta('Ação negada', 'Você não pode excluir a sua própria conta de Superadmin.');
      return;
    }

    const executarExclusao = async () => {
      try {
        setProcessandoAcao(true);
        await deleteDoc(doc(db, 'admins', admin.id));
        exibirAlerta('Sucesso', `Administrador ${admin.nome} removido.`);
        setAdminSelecionado(null);
        carregarAdmins();
      } catch (e) {
        exibirAlerta('Erro', 'Não foi possível excluir o administrador.');
      } finally {
        setProcessandoAcao(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Deseja excluir definitivamente o administrador ${admin.nome}?`);
      if (confirmou) {
        await executarExclusao();
      }
    } else {
      Alert.alert(
        'Excluir Administrador',
        `Deseja excluir definitivamente o administrador ${admin.nome}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: executarExclusao },
        ]
      );
    }
  }

  if (!carregando && !ehSuperadmin) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5' }}>
        <AdminSidebar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#B00020', marginBottom: 6 }}>
            Acesso Restrito
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            Esta página é exclusiva para Superadministradores da plataforma.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5', minHeight: '100%' }}>
      <AdminSidebar />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 28, paddingTop: isMobile ? 70 : 28 }}>
        <View style={{ marginBottom: 22 }}>
          <AdminHeader />
        </View>

        {/* Topo com Ação de Adicionar */}
        <View style={{  justifyContent: 'space-between', marginBottom: 20, gap: 8 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>Equipe de Administradores</Text>
            <Text style={{ fontSize: 12, color: '#888' }}>Gerencie os níveis de acesso e novos administradores</Text>
          </View>

          <Button
            label="+ Novo Administrador"
            onPress={() => setModalNovoAberto(true)}
            tamanho="sm"
          />
        </View>

        {/* Lista de Administradores */}
        <Card padding={0}>
          {carregando ? (
            <View style={{ paddingVertical: 50, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#F7B500" />
            </View>
          ) : (
            admins.map((admin, idx) => (
              <View
                key={admin.id}
                style={{
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: 14,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: idx === admins.length - 1 ? 0 : 1,
                  borderBottomColor: '#F0F0F0',
                }}
              >
                {/* Avatar e Nome */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1.4 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: admin.cargo === 'superadmin' ? '#FFF4D6' : '#EFEFEF',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '800',
                        color: admin.cargo === 'superadmin' ? '#8A5B00' : '#666',
                      }}
                    >
                      {admin.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>{admin.nome}</Text>
                      <View
                        style={{
                          backgroundColor: admin.cargo === 'superadmin' ? '#FFF4D6' : '#EAEAEA',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '800',
                            color: admin.cargo === 'superadmin' ? '#8A5B00' : '#555',
                          }}
                        >
                          {admin.cargo === 'superadmin' ? 'SUPERADMIN' : 'ADMIN'}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: '#888' }}>{admin.email}</Text>
                  </View>
                </View>

                {/* CPF */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <IconIdCard />
                  <Text style={{ fontSize: 12.5, color: '#444', fontWeight: '600' }}>{aplicarMascaraCPF(admin.cpf)}</Text>
                </View>

                {/* Criado Em */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <IconCalendar />
                  <Text style={{ fontSize: 12.5, color: '#444', fontWeight: '600' }}>{admin.criadoEm}</Text>
                </View>

                {/* Status e Gerenciar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                  <Badge status={admin.status} />
                  <TouchableOpacity
                    onPress={() => setAdminSelecionado(admin)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: '#FAFAFA',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer' as any,
                    }}
                  >
                    <IconDots />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Modal Criar Novo Administrador */}
      <Modal visible={modalNovoAberto} transparent animationType="fade" onRequestClose={() => setModalNovoAberto(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 440, maxWidth: '92%', backgroundColor: '#FFF', borderRadius: 16, padding: 22 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A' }}>Cadastrar Administrador</Text>
              <TouchableOpacity onPress={() => setModalNovoAberto(false)} style={{ padding: 4, cursor: 'pointer' as any }}>
                <Text style={{ fontSize: 18, color: '#888', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <Field
                label="Nome Completo"
                valor={novoNome}
                onChangeText={setNovoNome}
                placeholder="Ex: Jerry Leonardo"
              />
              <Field
                label="E-mail de Acesso"
                valor={novoEmail}
                onChangeText={setNovoEmail}
                placeholder="admin@vitta.com"
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
                label="Senha Provisória"
                valor={novaSenha}
                onChangeText={setNovaSenha}
                placeholder="Mínimo 6 caracteres"
              />

              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 }}>Nível de Cargo</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setNovoCargo('admin')}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: novoCargo === 'admin' ? '#F7B500' : '#E0E0E0',
                      backgroundColor: novoCargo === 'admin' ? '#FFF8E1' : '#FFF',
                      alignItems: 'center',
                      cursor: 'pointer' as any,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: novoCargo === 'admin' ? '#8A5B00' : '#666' }}>
                      Admin Comum
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setNovoCargo('superadmin')}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: novoCargo === 'superadmin' ? '#F7B500' : '#E0E0E0',
                      backgroundColor: novoCargo === 'superadmin' ? '#FFF8E1' : '#FFF',
                      alignItems: 'center',
                      cursor: 'pointer' as any,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: novoCargo === 'superadmin' ? '#8A5B00' : '#666' }}>
                      Superadmin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <Button label="Cancelar" variante="secundaria" onPress={() => setModalNovoAberto(false)} tamanho="sm" />
              <Button label="Criar Administrador" onPress={criarNovoAdmin} carregando={criando} tamanho="sm" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Ações do Admin Selecionado */}
      <Modal visible={adminSelecionado !== null} transparent animationType="fade" onRequestClose={() => setAdminSelecionado(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 420, maxWidth: '92%', backgroundColor: '#FFF', borderRadius: 16, padding: 22 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{adminSelecionado?.nome}</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>{adminSelecionado?.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setAdminSelecionado(null)} style={{ padding: 4, cursor: 'pointer' as any }}>
                <Text style={{ fontSize: 18, color: '#888', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: 10 }}>
              {/* Botão de Edição de Dados */}
              <TouchableOpacity
                onPress={() => adminSelecionado && abrirModalEdicao(adminSelecionado)}
                disabled={processandoAcao}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: '#F8F9FA',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  cursor: 'pointer' as any,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>
                  ✏️ Editar Dados do Administrador
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  Altere nome, e-mail, CPF, data de nascimento e cargo.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => adminSelecionado && alternarCargo(adminSelecionado)}
                disabled={processandoAcao}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: '#FFF8E1',
                  borderWidth: 1,
                  borderColor: '#FCE7B8',
                  cursor: 'pointer' as any,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#8A5B00' }}>
                  {adminSelecionado?.cargo === 'superadmin' ? '⬇️ Rebaixar para Admin Comum' : '⬆️ Promover a Superadmin'}
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  {adminSelecionado?.cargo === 'superadmin'
                    ? 'O usuário perderá permissões de gerenciar outros administradores.'
                    : 'O usuário terá acesso completo para cadastrar e gerenciar outros admins.'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => adminSelecionado && alternarStatus(adminSelecionado)}
                disabled={processandoAcao}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: adminSelecionado?.status === 'ativo' ? '#FFF3F3' : '#F0FFF4',
                  borderWidth: 1,
                  borderColor: adminSelecionado?.status === 'ativo' ? '#FFCDD2' : '#C6F6D5',
                  cursor: 'pointer' as any,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: adminSelecionado?.status === 'ativo' ? '#B00020' : '#22543D' }}>
                  {processandoAcao ? (
                    'Atualizando...'
                  ) : adminSelecionado?.status === 'ativo' ? (
                    '🔒 Bloquear Acesso'
                  ) : (
                    '🔓 Desbloquear e Ativar Acesso'
                  )}
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  {adminSelecionado?.status === 'ativo'
                    ? 'Impede o login e derruba o acesso do administrador imediatamente.'
                    : 'Permite novamente o acesso ao painel administrativo.'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => adminSelecionado && excluirAdmin(adminSelecionado)}
                disabled={processandoAcao}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: '#FDECEC',
                  borderWidth: 1,
                  borderColor: '#FAD2D2',
                  cursor: 'pointer' as any,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#B00020' }}>
                  🗑️ Remover Administrador
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Administrador */}
      <Modal visible={modalEditarAberto} transparent animationType="fade" onRequestClose={() => setModalEditarAberto(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 440, maxWidth: '92%', backgroundColor: '#FFF', borderRadius: 16, padding: 22 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A' }}>Editar Administrador</Text>
              <TouchableOpacity onPress={() => setModalEditarAberto(false)} style={{ padding: 4, cursor: 'pointer' as any }}>
                <Text style={{ fontSize: 18, color: '#888', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <Field
                label="Nome Completo"
                valor={editNome}
                onChangeText={setEditNome}
                placeholder="Ex: Jerry Leonardo"
              />
              <Field
                label="E-mail de Acesso"
                valor={editEmail}
                onChangeText={setEditEmail}
                placeholder="admin@vitta.com"
              />
              <Field
                label="CPF"
                valor={editCpf}
                onChangeText={(v) => setEditCpf(aplicarMascaraCPF(v))}
                placeholder="000.000.000-00"
              />
              <Field
                label="Data de Nascimento"
                valor={editNascimento}
                onChangeText={(v) => setEditNascimento(aplicarMascaraData(v))}
                placeholder="DD/MM/AAAA"
              />

              {/* Nível de Cargo na Edição */}
              <View style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 }}>Nível de Cargo</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setEditCargo('admin')}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: editCargo === 'admin' ? '#F7B500' : '#E0E0E0',
                      backgroundColor: editCargo === 'admin' ? '#FFF8E1' : '#FFF',
                      alignItems: 'center',
                      cursor: 'pointer' as any,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: editCargo === 'admin' ? '#8A5B00' : '#666' }}>
                      Admin Comum
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setEditCargo('superadmin')}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: editCargo === 'superadmin' ? '#F7B500' : '#E0E0E0',
                      backgroundColor: editCargo === 'superadmin' ? '#FFF8E1' : '#FFF',
                      alignItems: 'center',
                      cursor: 'pointer' as any,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: editCargo === 'superadmin' ? '#8A5B00' : '#666' }}>
                      Superadmin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <Button label="Cancelar" variante="secundaria" onPress={() => setModalEditarAberto(false)} tamanho="sm" />
              <Button label="Salvar Alterações" onPress={salvarEdicaoAdmin} carregando={salvandoEdicao} tamanho="sm" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}