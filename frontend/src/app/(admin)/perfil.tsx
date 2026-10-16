import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Badge from '../../components/admin/Badge';
import Button from '../../components/admin/Button';
import Card from '../../components/admin/Card';
import Field from '../../components/admin/Field';
import { auth, db } from '../../services/firebase';

function formatarCPF(cpf?: string): string {
  if (!cpf) return '—';
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return `${limpo.substring(0, 3)}.${limpo.substring(3, 6)}.${limpo.substring(6, 9)}-${limpo.substring(9, 11)}`;
}

export default function PerfilAdmin() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('—');
  const [criadoEm, setCriadoEm] = useState('—');
  const [uid, setUid] = useState('—');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [redefinindo, setRedefinindo] = useState(false);

  useEffect(() => {
    async function carregarDadosAdmin() {
      const user = auth.currentUser;
      if (!user) return;

      setEmail(user.email || '');
      setNome(user.displayName || '');
      setUid(user.uid);

      try {
        // Busca o documento do admin na coleção 'admins'
        const snap = await getDoc(doc(db, 'admins', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.nome) setNome(d.nome);
          if (d.email) setEmail(d.email);
          if (d.cpf) setCpf(d.cpf);
          if (d.nascimento) setNascimento(d.nascimento);
          if (d.criadoEm) {
            const data = d.criadoEm.toDate ? d.criadoEm.toDate() : new Date(d.criadoEm);
            if (!isNaN(data.getTime())) {
              setCriadoEm(
                `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()} às ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
              );
            }
          }
        }
      } catch (e) {
        console.error('Erro ao carregar dados do admin:', e);
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosAdmin();
  }, []);

  async function salvarPerfil() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSalvando(true);
      await updateProfile(user, { displayName: nome });
      // Atualiza o documento na coleção admins
      await updateDoc(doc(db, 'admins', user.uid), { nome });
      Alert.alert('Sucesso', 'Seu nome foi atualizado com sucesso!');
    } catch (e) {
      console.error('Erro ao atualizar perfil do admin:', e);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSalvando(false);
    }
  }

  async function solicitarRedefinicaoSenha() {
    if (!email) return;
    try {
      setRedefinindo(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('E-mail enviado', `Enviamos as instruções para redefinir a sua senha para: ${email}`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível solicitar o e-mail de redefinição.');
    } finally {
      setRedefinindo(false);
    }
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5', minHeight: '100%' }}>
      <AdminSidebar />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 28, paddingTop: isMobile ? 70 : 28 }}>
        <View style={{ marginBottom: 22 }}>
          <AdminHeader />
        </View>

        {carregando ? (
          <Card>
            <View style={{ paddingVertical: 50, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#F7B500" />
            </View>
          </Card>
        ) : (
          <View style={{ maxWidth: 680, gap: 20 }}>
            {/* Card Principal de Perfil */}
            <Card padding={24}>
              {/* Header do Perfil com Avatar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: '#FFF4D6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#F7B500',
                  }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#8A5B00' }}>
                    {nome ? nome.charAt(0).toUpperCase() : 'A'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>{nome}</Text>
                    <Badge status="ativo" />
                  </View>
                  <Text style={{ fontSize: 13, color: '#777' }}>{email}</Text>
                </View>
              </View>

              {/* Campos do Admin */}
              <View style={{ gap: 14 }}>
                <Field label="Nome Completo" valor={nome} onChangeText={setNome} editavel={true} />
                <Field label="E-mail" valor={email} onChangeText={() => {}} editavel={false} />
                <Field label="CPF" valor={formatarCPF(cpf)} onChangeText={() => {}} editavel={false} />
                <Field label="Data de Nascimento" valor={nascimento} onChangeText={() => {}} editavel={false} />
                <Field label="Conta criada em" valor={criadoEm} onChangeText={() => {}} editavel={false} />
                <Field label="UID do Administrador" valor={uid} onChangeText={() => {}} editavel={false} />
              </View>

              {/* Botões de Ação */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
                <Button
                  label="Redefinir Senha"
                  variante="secundaria"
                  tamanho="sm"
                  carregando={redefinindo}
                  onPress={solicitarRedefinicaoSenha}
                />
                <Button
                  label="Salvar Nome"
                  tamanho="sm"
                  carregando={salvando}
                  onPress={salvarPerfil}
                />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}