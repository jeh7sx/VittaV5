import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';

import { auth, db } from '@/services/firebase';
import { useTheme } from '@/context/ThemeContext';
import { useFilho } from '@/context/FilhoContext';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonDelete from '@/components/Buttons/ButtonDelete';
import { sair } from '@/utils/sair';

import { useMedicamentos } from '@/hooks/useMedicamentos';
import { useConsultas } from '@/hooks/useConsultas';
import { useExames } from '@/hooks/useExames';
import { usePerfil } from '@/hooks/usePerfil';
import { useSenha } from '@/hooks/useSenha';
import { useConvites } from '@/hooks/useConvites';

const STORAGE_LEMBRETES_KEY = '@vitta_preferencias_lembretes';
const STORAGE_DEVICE_ID_KEY = '@vitta_device_session_id';

interface SessaoItem {
  id: string;
  deviceId: string;
  nomeAparelho: string;
  plataforma: string;
  ultimoAcesso?: any;
}

export default function Configuracoes() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    theme,
    isDark,
    modoAtivo,
    paletaAtiva,
    paletasDisponiveis,
    definirModo,
    definirPaleta,
  } = useTheme();

  const { filhoSelecionado } = useFilho();

  const { medicamentos } = useMedicamentos();
  const { consultas } = useConsultas();
  const { exames } = useExames();
  const { convitesPendentesDoFilho } = useConvites(filhoSelecionado?.id);
  const { enviarRedefinicaoSenha, enviandoEmail } = useSenha();
  const {
    senhaAtual,
    setSenhaAtual,
    senhaNova,
    setSenhaNova,
    senhaConfirm,
    setSenhaConfirm,
    salvarPerfil,
    salvando: salvandoSenha,
    mostrarSenha,
    alternarCamposSenha,
  } = usePerfil();

  // Lembretes
  const [lembreteMedicamentos, setLembreteMedicamentos] = useState(true);
  const [lembreteConsultas, setLembreteConsultas] = useState(true);
  const [lembreteExames, setLembreteExames] = useState(true);

  // Modal e Gestão de Sessões
  const [modalSessoesVisivel, setModalSessoesVisivel] = useState(false);
  const [sessoes, setSessoes] = useState<SessaoItem[]>([]);
  const [meuDeviceId, setMeuDeviceId] = useState<string>('');
  const [carregandoSessoes, setCarregandoSessoes] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  // Modal de Confirmação de Exclusão de Conta
  const [modalExclusaoVisivel, setModalExclusaoVisivel] = useState(false);
  const [eliminandoConta, setEliminandoConta] = useState(false);

  useEffect(() => {
    async function carregarConfigs() {
      try {
        let rawLembretes: string | null = null;
        let devId: string | null = null;

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          rawLembretes = window.localStorage.getItem(STORAGE_LEMBRETES_KEY);
          devId = window.localStorage.getItem(STORAGE_DEVICE_ID_KEY);
        }
        if (!rawLembretes) rawLembretes = await AsyncStorage.getItem(STORAGE_LEMBRETES_KEY);
        if (!devId) devId = await AsyncStorage.getItem(STORAGE_DEVICE_ID_KEY);

        if (rawLembretes) {
          const parsed = JSON.parse(rawLembretes);
          if (parsed.medicamentos !== undefined) setLembreteMedicamentos(parsed.medicamentos);
          if (parsed.consultas !== undefined) setLembreteConsultas(parsed.consultas);
          if (parsed.exames !== undefined) setLembreteExames(parsed.exames);
        }

        if (devId) setMeuDeviceId(devId);
      } catch (e) {
        console.error('Erro ao ler configurações locais:', e);
      }
    }
    carregarConfigs();
  }, []);

  const salvarPreferenciaLembrete = async (
    chave: 'medicamentos' | 'consultas' | 'exames',
    valor: boolean
  ) => {
    if (chave === 'medicamentos') setLembreteMedicamentos(valor);
    if (chave === 'consultas') setLembreteConsultas(valor);
    if (chave === 'exames') setLembreteExames(valor);

    const atual = {
      medicamentos: chave === 'medicamentos' ? valor : lembreteMedicamentos,
      consultas: chave === 'consultas' ? valor : lembreteConsultas,
      exames: chave === 'exames' ? valor : lembreteExames,
    };

    const valorStr = JSON.stringify(atual);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_LEMBRETES_KEY, valorStr);
      window.dispatchEvent(new Event('vitta_lembretes_alterados'));
    }
    await AsyncStorage.setItem(STORAGE_LEMBRETES_KEY, valorStr);
  };

  const carregarSessoes = useCallback(async () => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    try {
      setCarregandoSessoes(true);
      const sessoesRef = collection(db, 'usuarios', usuario.uid, 'sessoes');
      const q = query(sessoesRef, orderBy('ultimoAcesso', 'desc'));
      const snap = await getDocs(q);

      const lista: SessaoItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as SessaoItem));

      setSessoes(lista);
    } catch {
      try {
        const snap = await getDocs(collection(db, 'usuarios', usuario.uid, 'sessoes'));
        setSessoes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SessaoItem)));
      } catch { }
    } finally {
      setCarregandoSessoes(false);
    }
  }, []);

  function abrirModalSessoes() {
    setModalSessoesVisivel(true);
    carregarSessoes();
  }

  const encerrarSessaoIndividual = async (sessao: SessaoItem) => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    try {
      setProcessandoId(sessao.id);
      await deleteDoc(doc(db, 'usuarios', usuario.uid, 'sessoes', sessao.id));
      setSessoes((prev) => prev.filter((s) => s.id !== sessao.id));
      Alert.alert('Sucesso', `Sessão em "${sessao.nomeAparelho}" foi encerrada.`);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível encerrar a sessão.');
    } finally {
      setProcessandoId(null);
    }
  };

  const encerrarTodasAsOutrasSessoes = async () => {
    const usuario = auth.currentUser;
    if (!usuario) return;

    try {
      setProcessandoId('todas_outras');
      const outras = sessoes.filter((s) => s.deviceId !== meuDeviceId);

      await Promise.all(
        outras.map((s) => deleteDoc(doc(db, 'usuarios', usuario.uid, 'sessoes', s.id)))
      );

      setSessoes((prev) => prev.filter((s) => s.deviceId === meuDeviceId));
      Alert.alert('Sucesso', 'Todas as outras sessões foram desconectadas.');
    } catch (e: any) {
      Alert.alert('Erro', 'Não foi possível encerrar as outras sessões.');
    } finally {
      setProcessandoId(null);
    }
  };

  function exportarRelatorio() {
    if (!filhoSelecionado) {
      Alert.alert('Atenção', 'Selecione um dependente para exportar os seus dados.');
      return;
    }

    const agora = new Date().toLocaleDateString('pt-BR');
    let relatorio = `=== RELATÓRIO DE SAÚDE VITTA ===\n`;
    relatorio += `Dependente: ${filhoSelecionado.nome} (${filhoSelecionado.idade} anos)\n`;
    relatorio += `Data de Emissão: ${agora}\n\n`;

    relatorio += `--- MEDICAMENTOS (${medicamentos.length}) ---\n`;
    if (medicamentos.length === 0) relatorio += `Nenhum medicamento registado.\n`;
    medicamentos.forEach((m) => {
      relatorio += `• ${m.nome} | Dose: ${m.dosagem} | Freq: ${m.frequencia} | Horário: ${m.horario} | Estado: ${m.status}\n`;
    });

    relatorio += `\n--- CONSULTAS AGENDADAS/REALIZADAS (${consultas.length}) ---\n`;
    if (consultas.length === 0) relatorio += `Nenhuma consulta registada.\n`;
    consultas.forEach((c) => {
      relatorio += `• ${c.consulta} | Médico: ${c.nomeMedico} | Local: ${c.hospital} | Data: ${c.dataConsulta} às ${c.horario} | Estado: ${c.status}\n`;
    });

    relatorio += `\n--- EXAMES LABORATORIAIS/CLÍNICOS (${exames.length}) ---\n`;
    if (exames.length === 0) relatorio += `Nenhum exame registado.\n`;
    exames.forEach((e) => {
      relatorio += `• ${e.titulo} | Médico: ${e.nomeDoutor} | Local: ${e.hospital} | Data: ${e.dataExame} às ${e.horario} | Estado: ${e.status}\n`;
    });

    if (Platform.OS === 'web') {
      const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_saude_${filhoSelecionado.nome.toLowerCase().replace(/\s+/g, '_')}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Relatório Gerado com Sucesso', relatorio);
    }
  }

  async function limparCacheLocal() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysLimpeza = keys.filter(
        (k) => k.startsWith('foto_') || k.includes('cache')
      );
      if (keysLimpeza.length > 0) {
        await AsyncStorage.multiRemove(keysLimpeza);
      }
      Alert.alert('Sucesso', 'Cache de fotografias e ficheiros temporários limpo!');
    } catch {
      Alert.alert('Erro', 'Não foi possível limpar o cache.');
    }
  }

  // ---- EXECUÇÃO DEFINITIVA DA EXCLUSÃO DA CONTA ----
  async function executarExclusaoConta() {
    const usuario = auth.currentUser;
    if (!usuario) {
      setModalExclusaoVisivel(false);
      return;
    }

    try {
      setEliminandoConta(true);

      // 1. Busca CPF para apagar o registo correspondente na coleção 'cpfs'
      const usuarioRef = doc(db, 'usuarios', usuario.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {
        const cpfDoUsuario = usuarioSnap.data()?.cpf;
        if (cpfDoUsuario) {
          const cpfLimpo = cpfDoUsuario.replace(/\D/g, '');
          await deleteDoc(doc(db, 'cpfs', cpfLimpo)).catch(() => { });
        }
      }

      // 2. Apaga documentos do Firestore
      await deleteDoc(usuarioRef).catch(() => { });
      await deleteDoc(doc(db, 'fotos', usuario.uid)).catch(() => { });

      // 3. Exclui o utilizador no Firebase Auth
      await deleteUser(usuario);

      // 4. Limpa credenciais locais e redireciona
      setModalExclusaoVisivel(false);
      await sair();
    } catch (err: any) {
      console.warn('Erro ao eliminar conta:', err);

      setModalExclusaoVisivel(false);

      if (err?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Reautenticação necessária',
          'Por segurança, encerre a sessão e volte a entrar com a sua senha antes de apagar a conta.'
        );
      } else {
        Alert.alert('Erro', 'Não foi possível eliminar a conta. Tente novamente.');
      }
    } finally {
      setEliminandoConta(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: isMobile ? 16 : 32,
          gap: 24,
          maxWidth: 900,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Cabeçalho */}
        <View style={{ gap: 4 }}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Configurações</Text>
          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            Personalize temas, lembretes, sessões ativas e a segurança da sua conta.
          </Text>
        </View>

        {/* 1. APARÊNCIA E TEMA */}
        <View style={cardEstilo(theme)}>
          <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Aparência e Temas</Text>

          <View style={{ gap: 10 }}>
            <Text style={[tipografia.caption, { color: theme.textSecondary, textTransform: 'uppercase' }]}>
              Modo de Exibição
            </Text>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.inputBg,
                borderRadius: 14,
                padding: 4,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <TouchableOpacity
                onPress={() => definirModo('claro')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: modoAtivo === 'claro' ? theme.cardBg : 'transparent',
                }}
              >
                <Text>☀️</Text>
                <Text
                  style={{
                    fontWeight: modoAtivo === 'claro' ? '700' : '500',
                    color: modoAtivo === 'claro' ? theme.textPrimary : theme.textSecondary,
                  }}
                >
                  Claro
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => definirModo('escuro')}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: modoAtivo === 'escuro' ? theme.cardBg : 'transparent',
                }}
              >
                <Text>🌙</Text>
                <Text
                  style={{
                    fontWeight: modoAtivo === 'escuro' ? '700' : '500',
                    color: modoAtivo === 'escuro' ? theme.textPrimary : theme.textSecondary,
                  }}
                >
                  Escuro
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {paletasDisponiveis.map((item) => {
                const ativa = paletaAtiva === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => definirPaleta(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: ativa ? theme.yellow1 : theme.inputBg,
                      borderWidth: 1,
                      borderColor: ativa ? theme.yellow5 : theme.border,
                    }}
                  >
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: item.cor }} />
                    <Text
                      style={{
                        fontWeight: ativa ? '700' : '500',
                        color: ativa ? (isDark ? '#FFF' : theme.yellow9) : theme.textPrimary,
                        fontSize: 14,
                      }}
                    >
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 2. LEMBRETES */}
        <View style={cardEstilo(theme)}>
          <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Lembretes e Avisos</Text>

          <View style={linhaSwitch}>
            <View style={{ flex: 1, paddingRight: 16, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Lembretes de Medicamentos
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Avisos pontuais com dosagem e horário exato das tomas
              </Text>
            </View>
            <Switch
              value={lembreteMedicamentos}
              onValueChange={(val) => salvarPreferenciaLembrete('medicamentos', val)}
              thumbColor={lembreteMedicamentos ? theme.yellow5 : '#f4f3f4'}
              trackColor={{ false: '#767577', true: theme.yellow2 }}
            />
          </View>

          <View style={divisor(theme)} />

          <View style={linhaSwitch}>
            <View style={{ flex: 1, paddingRight: 16, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Lembretes de Consultas
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Alertas antecipados sobre consultas médicas marcadas
              </Text>
            </View>
            <Switch
              value={lembreteConsultas}
              onValueChange={(val) => salvarPreferenciaLembrete('consultas', val)}
              thumbColor={lembreteConsultas ? theme.yellow5 : '#f4f3f4'}
              trackColor={{ false: '#767577', true: theme.yellow2 }}
            />
          </View>

          <View style={divisor(theme)} />

          <View style={linhaSwitch}>
            <View style={{ flex: 1, paddingRight: 16, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Lembretes de Exames
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Alertas de agendamentos laboratoriais, instruções e preparo
              </Text>
            </View>
            <Switch
              value={lembreteExames}
              onValueChange={(val) => salvarPreferenciaLembrete('exames', val)}
              thumbColor={lembreteExames ? theme.yellow5 : '#f4f3f4'}
              trackColor={{ false: '#767577', true: theme.yellow2 }}
            />
          </View>
        </View>

        {/* 3. DEPENDENTES E PARTILHA FAMILIAR */}
        <View style={cardEstilo(theme)}>
          <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Dependentes e Partilha Familiar</Text>

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Criança/Adolescente em Foco: {filhoSelecionado?.nome ?? 'Nenhum selecionado'}
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                {convitesPendentesDoFilho.length > 0
                  ? `Existem ${convitesPendentesDoFilho.length} convite(s) de co-responsabilidade pendente(s).`
                  : 'Faça a gestão de registos, fotografias e permissões de outros responsáveis.'}
              </Text>
            </View>
            <ButtonSecondary
              texto="Gerir Dependentes"
              onPress={() => router.push('/(user)/filhos' as any)}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>
        </View>

        {/* 4. HISTÓRICO MÉDICO E RELATÓRIO */}
        <View style={cardEstilo(theme)}>
          <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Relatórios e Histórico de Saúde</Text>

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Exportar Histórico Clínico ({filhoSelecionado?.nome ?? 'Geral'})
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Baixe o resumo completo de medicamentos, consultas e exames para partilhar com o médico.
              </Text>
            </View>
            <ButtonPrimary
              texto="Exportar Relatório"
              onPress={exportarRelatorio}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>
        </View>

        {/* 5. SEGURANÇA E SESSÕES ATIVAS */}
        <View style={cardEstilo(theme)}>
          <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Segurança e Acesso</Text>

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Dispositivos e Sessões Ativas
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Veja onde a sua conta está aberta e desconecte computadores ou telemóveis suspeitos.
              </Text>
            </View>
            <ButtonSecondary
              texto="Gerir Sessões"
              onPress={abrirModalSessoes}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>

          <View style={divisor(theme)} />

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Redefinir Senha por E-mail
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Enviaremos um link de recuperação para {auth.currentUser?.email ?? 'o seu e-mail'}.
              </Text>
            </View>
            <ButtonSecondary
              texto={enviandoEmail ? 'A enviar...' : 'Enviar E-mail'}
              onPress={() => {
                if (auth.currentUser?.email) {
                  enviarRedefinicaoSenha(auth.currentUser.email);
                }
              }}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>

          <View style={divisor(theme)} />

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={alternarCamposSenha}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                  Alterar Senha Diretamente
                </Text>
                <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                  Altere a sua senha de acesso sem sair da aplicação
                </Text>
              </View>
              <Text style={{ color: theme.yellow6, fontWeight: '700', fontSize: 13, flexShrink: 0 }}>
                {mostrarSenha ? 'Ocultar' : 'Alterar'}
              </Text>
            </TouchableOpacity>

            {mostrarSenha && (
              <View style={{ gap: 10, marginTop: 8, width: '100%' }}>
                <TextInput
                  placeholder="Senha atual"
                  placeholderTextColor={theme.gray4}
                  secureTextEntry
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  style={inputEstilo(theme)}
                />
                <TextInput
                  placeholder="Nova senha (mín. 6 caracteres)"
                  placeholderTextColor={theme.gray4}
                  secureTextEntry
                  value={senhaNova}
                  onChangeText={setSenhaNova}
                  style={inputEstilo(theme)}
                />
                <TextInput
                  placeholder="Confirmar nova senha"
                  placeholderTextColor={theme.gray4}
                  secureTextEntry
                  value={senhaConfirm}
                  onChangeText={setSenhaConfirm}
                  style={inputEstilo(theme)}
                />

                <View style={{ alignSelf: isMobile ? 'stretch' : 'flex-end', marginTop: 4 }}>
                  <ButtonPrimary
                    texto={salvandoSenha ? 'A guardar...' : 'Confirmar Nova Senha'}
                    onPress={salvarPerfil}
                    style={isMobile ? { width: '100%' } : undefined}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={divisor(theme)} />

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Limpar Cache Local do Dispositivo
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Liberta memória temporária e imagens guardadas sem apagar dados da nuvem.
              </Text>
            </View>
            <ButtonSecondary
              texto="Limpar Cache"
              onPress={limparCacheLocal}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>
        </View>

        {/* 6. SUPORTE, POLÍTICAS E VERSÃO */}
        <View style={cardEstilo(theme)}>
          <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Ajuda e Termos</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <ButtonSecondary
              texto="Recursos da Plataforma"
              onPress={() => router.push('/(user)/recursos' as any)}
            />
            <ButtonSecondary texto="Perguntas Frequentes (FAQ)" onPress={() => router.push('/(user)/faq' as any)} />
            <ButtonSecondary texto="Termos de Uso" onPress={() => router.push('/(user)/termos' as any)} />
            <ButtonSecondary texto="Privacidade" onPress={() => router.push('/(user)/privacidade' as any)} />
            <ButtonSecondary texto="Suporte Vitta" onPress={() => router.push('/(user)/suporte' as any)} />
          </View>

          <Text style={[tipografia.caption, { color: theme.textSecondary, marginTop: 4 }]}>
            Vitta Saúde • Versão 1.0.4 (Build 2026)
          </Text>
        </View>

        {/* 7. ZONA DE PERIGO */}
        <View style={[cardEstilo(theme), { borderColor: isDark ? '#7F1D1D' : '#FCA5A5' }]}>
          <Text style={[tipografia.h3, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>Zona de Perigo</Text>

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Terminar Sessão
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Desconectar a sua conta neste dispositivo
              </Text>
            </View>
            <ButtonSecondary
              texto="Terminar Sessão"
              onPress={() => sair()}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>

          <View style={divisor(theme)} />

          {/* Eliminar Conta */}
          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                Eliminar Conta
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Apagar permanentemente a sua conta e todos os dados associados
              </Text>
            </View>
            <ButtonDelete
              texto="Eliminar Conta"
              onPress={() => setModalExclusaoVisivel(true)}
              style={isMobile ? { width: '100%' } : undefined}
            />
          </View>
        </View>
      </ScrollView>

      {/* MODAL DE SESSÕES ATIVAS */}
      <Modal
        animationType="fade"
        transparent
        visible={modalSessoesVisivel}
        onRequestClose={() => setModalSessoesVisivel(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setModalSessoesVisivel(false)}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: theme.cardBg,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 18,
            }}
            onStartShouldSetResponder={() => true}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Dispositivos Conectados</Text>
                <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                  Sessões abertas com a sua conta Vitta
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalSessoesVisivel(false)} style={{ padding: 4, flexShrink: 0 }}>
                <Text style={{ fontSize: 18, color: theme.textPrimary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {carregandoSessoes ? (
              <ActivityIndicator size="large" color={theme.yellow5} style={{ paddingVertical: 30 }} />
            ) : sessoes.length === 0 ? (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', paddingVertical: 20 }}>
                Nenhuma outra sessão ativa encontrada.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 10 }}>
                  {sessoes.map((item) => {
                    const ehEsteAparelho = item.deviceId === meuDeviceId;
                    const estaProcessando = processandoId === item.id;

                    return (
                      <View
                        key={item.id}
                        style={{
                          flexDirection: isMobile ? 'column' : 'row',
                          alignItems: isMobile ? 'flex-start' : 'center',
                          justifyContent: 'space-between',
                          padding: 14,
                          borderRadius: 14,
                          backgroundColor: ehEsteAparelho ? theme.yellow1 : theme.inputBg,
                          borderWidth: 1,
                          borderColor: ehEsteAparelho ? theme.yellow5 : theme.border,
                          gap: 10,
                        }}
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 16 }}>
                              {item.plataforma === 'web' ? '💻' : '📱'}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={[
                                tipografia.body,
                                {
                                  fontWeight: '600',
                                  fontSize: 14,
                                  color: ehEsteAparelho && isDark ? '#FFF' : theme.textPrimary,
                                },
                              ]}
                            >
                              {item.nomeAparelho}
                            </Text>
                          </View>

                          <Text style={[tipografia.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                            {ehEsteAparelho
                              ? '🟢 Este dispositivo (Sessão atual)'
                              : 'Conectado remotamente'}
                          </Text>
                        </View>

                        {!ehEsteAparelho && (
                          <TouchableOpacity
                            onPress={() => encerrarSessaoIndividual(item)}
                            disabled={estaProcessando}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 12,
                              borderRadius: 8,
                              backgroundColor: isDark ? '#3D1014' : '#FEE2E2',
                              borderWidth: 1,
                              borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
                              alignSelf: isMobile ? 'stretch' : 'auto',
                              alignItems: 'center',
                            }}
                          >
                            {estaProcessando ? (
                              <ActivityIndicator size="small" color="#DC2626" />
                            ) : (
                              <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
                                Desconectar
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {sessoes.length > 1 && (
              <View style={{ marginTop: 6, width: '100%' }}>
                <ButtonDelete
                  texto={
                    processandoId === 'todas_outras'
                      ? 'A desconectar...'
                      : 'Desconectar Todas as Outras Sessões'
                  }
                  onPress={encerrarTodasAsOutrasSessoes}
                  style={{ width: '100%' }}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE CONFIRMAÇÃO PARA ELIMINAR CONTA */}
      <Modal
        animationType="fade"
        transparent
        visible={modalExclusaoVisivel}
        onRequestClose={() => {
          if (!eliminandoConta) setModalExclusaoVisivel(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 420,
              backgroundColor: theme.cardBg,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Text style={[tipografia.h3, { color: theme.textPrimary, textAlign: 'center' }]}>
              Confirmação
            </Text>

            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, textAlign: 'center' }]}>
              Tem a certeza de que deseja eliminar permanentemente a sua conta? Esta ação é irreversível.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 8,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <ButtonSecondary
                texto="Cancelar"
                onPress={() => setModalExclusaoVisivel(false)}
                disabled={eliminandoConta}
                style={{ flex: 1 }}
              />

              <ButtonDelete
                texto={eliminandoConta ? 'A eliminar...' : 'Confirmar'}
                onPress={() => void executarExclusaoConta()}
                // disabled={eliminandoConta}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cardEstilo = (theme: any) => ({
  backgroundColor: theme.cardBg,
  borderRadius: 24,
  padding: 20,
  borderWidth: 1,
  borderColor: theme.border,
  gap: 18,
  width: '100%' as const,
});

const linhaSwitch = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
};

const divisor = (theme: any) => ({
  height: 1,
  backgroundColor: theme.border,
});

const inputEstilo = (theme: any) => ({
  backgroundColor: theme.inputBg,
  borderColor: theme.border,
  borderWidth: 1,
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  color: theme.textPrimary,
  fontSize: 14,
  width: '100%' as const,
});