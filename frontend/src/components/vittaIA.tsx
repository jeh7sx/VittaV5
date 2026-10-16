import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';
import { auth, db } from '@/services/firebase';
import useVittaIA from '../hooks/useVittaIA';
import { useFilho } from '../context/FilhoContext';
import styles from '../styles/vittaIA';

import SidebarIA from './vittaIA/sidebarIA';
import { ReviewExameCard } from './vittaIA/ReviewExameCard';
import { ReviewMedicamentoCard } from './vittaIA/ReviewMedicamentoCard';
import { ReviewConsultaCard } from './vittaIA/ReviewConsultaCard';
import { CardSuporteAnexo } from './vittaIA/CardSuporteAnexo';
import { MedicamentoData, ConsultaData, ExameData, ChatSession } from '@/types/vittaIa';

export default function VittaIA() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { theme } = useTheme();
  const { filhoSelecionado } = useFilho();
  const usuario = auth.currentUser;

  const [abaAtiva, setAbaAtiva] = useState<'chat' | 'biblioteca'>('chat');
  const [mensagemCopiada, setMensagemCopiada] = useState<number | null>(null);

  const [itensBiblioteca, setItensBiblioteca] = useState<{
    medicamentos: MedicamentoData[];
    consultas: ConsultaData[];
    exames: ExameData[];
  }>({ medicamentos: [], consultas: [], exames: [] });
  const [carregandoBiblio, setCarregandoBiblio] = useState(false);

  const {
    mensagens,
    inputTexto,
    setInputTexto,
    carregando,
    salvandoAcao,
    historicoChats,
    chatIdAtual,
    modoAtivo,
    setModoAtivo,
    examePendente,
    setExamePendente,
    medicamentoPendente,
    setMedicamentoPendente,
    consultaPendente,
    setConsultaPendente,
    suportePendente,
    fecharSuporteEResetar,
    enviarMensagem,
    iniciarNovoChat,
    selecionarChat,
    confirmarExame,
    confirmarMedicamento,
    confirmarConsulta,
    alternarFixarChat,
  } = useVittaIA();

  const podeEnviar = inputTexto.trim().length > 0 && !carregando;
  const temAcaoPendente = !!(examePendente || medicamentoPendente || consultaPendente || suportePendente);

  const [chatsLocais, setChatsLocais] = useState<ChatSession[]>([]);

  useEffect(() => {
    setChatsLocais(historicoChats);
  }, [historicoChats]);

  async function carregarBiblioteca() {
    if (!usuario?.uid || !filhoSelecionado?.id) return;
    setCarregandoBiblio(true);

    try {
      const qMed = query(
        collection(db, 'medicamentos'),
        where('responsavelId', '==', usuario.uid),
        where('filhoId', '==', filhoSelecionado.id),
        where('criadoPorIA', '==', true)
      );
      const qCons = query(
        collection(db, 'consultas'),
        where('responsavelId', '==', usuario.uid),
        where('filhoId', '==', filhoSelecionado.id),
        where('criadoPorIA', '==', true)
      );
      const qEx = query(
        collection(db, 'exames'),
        where('responsavelId', '==', usuario.uid),
        where('filhoId', '==', filhoSelecionado.id),
        where('criadoPorIA', '==', true)
      );

      const [snapMed, snapCons, snapEx] = await Promise.all([
        getDocs(qMed),
        getDocs(qCons),
        getDocs(qEx),
      ]);

      setItensBiblioteca({
        medicamentos: snapMed.docs.map((d) => ({ id: d.id, ...(d.data() as MedicamentoData) })),
        consultas: snapCons.docs.map((d) => ({ id: d.id, ...(d.data() as ConsultaData) })),
        exames: snapEx.docs.map((d) => ({ id: d.id, ...(d.data() as ExameData) })),
      });
    } catch (e) {
      console.error('Erro ao carregar biblioteca da IA:', e);
    } finally {
      setCarregandoBiblio(false);
    }
  }

  useEffect(() => {
    if (abaAtiva === 'biblioteca') {
      carregarBiblioteca();
    }
  }, [abaAtiva, filhoSelecionado?.id]);

  const copiarMensagem = async (texto: string, index: number) => {
    await Clipboard.setStringAsync(texto);
    setMensagemCopiada(index);
    setTimeout(() => {
      setMensagemCopiada(null);
    }, 1500);
  };

  const handleConfirmarMedicamento = async () => {
    await confirmarMedicamento();
    await carregarBiblioteca();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SidebarIA
        chats={chatsLocais}
        chatIdAtual={chatIdAtual}
        abaAtiva={abaAtiva}
        onNovoChat={() => {
          setAbaAtiva('chat');
          iniciarNovoChat();
        }}
        onSelecionarChat={(id) => {
          setAbaAtiva('chat');
          selecionarChat(id);
        }}
        onAbrirBiblioteca={() => setAbaAtiva('biblioteca')}
        onAlternarFixarChat={alternarFixarChat}
      />

      <View style={{ flex: 1, minWidth: 0, height: '100%' }}>
        {!filhoSelecionado && (
          <View style={[styles.alerta, { backgroundColor: theme.yellow1, borderColor: theme.yellow5 }]}>
            <Text style={[styles.alertaTexto, { color: theme.yellow9 }]}>
              Selecione um filho antes de criar exames, remédios ou consultas.
            </Text>
          </View>
        )}

        {abaAtiva === 'biblioteca' ? (
          <ScrollView
            style={{ flex: 1, padding: isMobile ? 16 : 36 }}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={{ marginBottom: 24 }}>
              <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Biblioteca VittaIA</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                Itens e agendamentos processados e criados exclusivamente com a IA.
              </Text>
            </View>

            {carregandoBiblio ? (
              <ActivityIndicator size="large" color="#F7B500" style={{ marginTop: 40 }} />
            ) : (
              <View style={{ gap: 24 }}>
                <View>
                  <Text style={[tipografia.h3, { fontSize: 18, marginBottom: 10, color: theme.Med }]}>
                    💊 Medicamentos Criados pela IA ({itensBiblioteca.medicamentos.length})
                  </Text>
                  {itensBiblioteca.medicamentos.length === 0 ? (
                    <Text style={{ color: theme.textSecondary }}>Nenhum medicamento criado pela IA ainda.</Text>
                  ) : (
                    itensBiblioteca.medicamentos.map((m, idx) => (
                      <View key={m.id || idx} style={[cardBibliotecaEstilo, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <Text style={{ fontWeight: '700', fontSize: 15, color: theme.textPrimary }}>{m.nome}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Dosagem: {m.dosagem} • Frequência: {m.frequencia}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                          Horário: {m.horario || '—'} • Início: {m.dataInicio || '—'}
                          {m.dataTermino ? ` até ${m.dataTermino}` : ''}
                        </Text>
                      </View>
                    ))
                  )}
                </View>

                <View>
                  <Text style={[tipografia.h3, { fontSize: 18, marginBottom: 10, color: theme.Consul }]}>
                    🩺 Consultas Agendadas pela IA ({itensBiblioteca.consultas.length})
                  </Text>
                  {itensBiblioteca.consultas.length === 0 ? (
                    <Text style={{ color: theme.textSecondary }}>Nenhuma consulta agendada pela IA ainda.</Text>
                  ) : (
                    itensBiblioteca.consultas.map((c, idx) => (
                      <View key={c.id || idx} style={[cardBibliotecaEstilo, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <Text style={{ fontWeight: '700', fontSize: 15, color: theme.textPrimary }}>
                          {c.consulta || c.especialidade || 'Consulta Médica'}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Data: {c.dataConsulta} às {c.horario || '—'}</Text>
                      </View>
                    ))
                  )}
                </View>

                <View>
                  <Text style={[tipografia.h3, { fontSize: 18, marginBottom: 10, color: theme.Exame }]}>
                    🧪 Exames Registrados pela IA ({itensBiblioteca.exames.length})
                  </Text>
                  {itensBiblioteca.exames.length === 0 ? (
                    <Text style={{ color: theme.textSecondary }}>Nenhum exame registrado pela IA ainda.</Text>
                  ) : (
                    itensBiblioteca.exames.map((e, idx) => (
                      <View key={e.id || idx} style={[cardBibliotecaEstilo, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <Text style={{ fontWeight: '700', fontSize: 15, color: theme.textPrimary }}>{e.titulo}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Data: {e.dataExame} às {e.horario || '—'}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={[
                { paddingHorizontal: isMobile ? 16 : 40, paddingTop: 30, paddingBottom: 20 },
                mensagens.length === 0 && !temAcaoPendente && {
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {mensagens.length === 0 && !temAcaoPendente && (
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Text style={[tipografia.h2, { color: theme.textPrimary }]}>
                    Precisando de ajuda? Peça ao <Text style={[tipografia.h2, { color: theme.yellow5 }]}>VittaIA!</Text>
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 8, textAlign: 'center', maxWidth: 460 }}>
                    {modoAtivo === 'assistente'
                      ? 'Estou pronta para ajudar na rotina oncológica, horários de remédios e exames.'
                      : 'Estou em modo suporte para tirar dúvidas sobre o app ou conectar você à nossa equipe.'}
                  </Text>
                </View>
              )}

              {mensagens.map((msg, index) => {
                const ehUsuario = msg.autor === 'usuario';

                return (
                  <View
                    key={`${msg.autor}-${index}`}
                    style={[
                      styles.mensagemLinha,
                      ehUsuario ? styles.mensagemLinhaUsuario : styles.mensagemLinhaIA,
                    ]}
                  >
                    <View
                      style={[
                        styles.mensagemContainer,
                        ehUsuario ? styles.mensagemContainerUsuario : styles.mensagemContainerIA,
                      ]}
                    >
                      <View
                        style={[
                          ehUsuario
                            ? [styles.bolhaUsuario, { backgroundColor: theme.yellow5 }]
                            : [styles.bolhaIA, { backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1 }],
                        ]}
                      >
                        <Text
                          style={[
                            styles.textoMensagem,
                            ehUsuario
                              ? { color: theme.id === 'dark' ? '#000' : '#FFF' }
                              : { color: theme.textPrimary },
                          ]}
                        >
                          {msg.texto}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => copiarMensagem(msg.texto, index)}
                        style={[
                          styles.botaoCopiar,
                          ehUsuario ? styles.botaoCopiarUsuario : styles.botaoCopiarIA,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                          {mensagemCopiada === index ? (
                            'Copiado!'
                          ) : (
                            <Image
                              source={require('@/img/icons/copy.svg')}
                              style={{ width: 20, height: 20, tintColor: theme.gray4 }}
                            />
                          )}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {carregando && (
                <View style={styles.carregando}>
                  <ActivityIndicator size="large" color="#F7B500" />
                  <Text style={[tipografia.caption, { color: theme.textSecondary }]}>VittaIA está pensando...</Text>
                </View>
              )}

              {/* Cards de Ação Pendente */}
              {examePendente && (
                <ReviewExameCard
                  dados={examePendente}
                  onChange={(campo, valor) =>
                    setExamePendente((prev) => (prev ? { ...prev, [campo]: valor } : prev))
                  }
                  onSalvar={confirmarExame}
                  onCancelar={() => setExamePendente(null)}
                  salvando={salvandoAcao}
                />
              )}

              {medicamentoPendente && (
                <ReviewMedicamentoCard
                  dados={medicamentoPendente}
                  onChange={(campo, valor) =>
                    setMedicamentoPendente((prev) => (prev ? { ...prev, [campo]: valor } : prev))
                  }
                  onSalvar={handleConfirmarMedicamento}
                  onCancelar={() => setMedicamentoPendente(null)}
                  salvando={salvandoAcao}
                />
              )}

              {consultaPendente && (
                <ReviewConsultaCard
                  dados={consultaPendente}
                  onChange={(campo, valor) =>
                    setConsultaPendente((prev) => (prev ? { ...prev, [campo]: valor } : prev))
                  }
                  onSalvar={confirmarConsulta}
                  onCancelar={() => setConsultaPendente(null)}
                  salvando={salvandoAcao}
                />
              )}

              {suportePendente && (
                <CardSuporteAnexo
                  dados={suportePendente}
                  onFechar={fecharSuporteEResetar}
                />
              )}
            </ScrollView>

            {/* Rodapé: Seletor de Modo + Campo de Mensagem */}
            <View style={{ paddingHorizontal: isMobile ? 16 : 40, paddingBottom: 24, alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: theme.inputBg,
                  borderRadius: 999,
                  padding: 4,
                  marginBottom: 10,
                  gap: 4,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <TouchableOpacity
                  onPress={() => setModoAtivo('assistente')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: modoAtivo === 'assistente' ? theme.cardBg : 'transparent',
                  }}
                >
                  <Ionicons
                    name="heart-outline"
                    size={15}
                    color={modoAtivo === 'assistente' ? theme.yellow6 : theme.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: modoAtivo === 'assistente' ? '700' : '500',
                      color: modoAtivo === 'assistente' ? theme.textPrimary : theme.textSecondary,
                    }}
                  >
                    Assistente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModoAtivo('suporte')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: modoAtivo === 'suporte' ? theme.cardBg : 'transparent',
                  }}
                >
                  <Ionicons
                    name="help-buoy-outline"
                    size={15}
                    color={modoAtivo === 'suporte' ? theme.yellow6 : theme.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: modoAtivo === 'suporte' ? '700' : '500',
                      color: modoAtivo === 'suporte' ? theme.textPrimary : theme.textSecondary,
                    }}
                  >
                    Suporte
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Caixa de Input */}
              <View
                style={{
                  width: '100%',
                  maxWidth: 720,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.cardBg,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.border,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <TextInput
                  placeholder={
                    modoAtivo === 'assistente'
                      ? 'Pergunte sobre remédios, exames ou cuidados...'
                      : 'Relate uma dúvida ou problema do sistema...'
                  }
                  placeholderTextColor={theme.gray4}
                  value={inputTexto}
                  onChangeText={setInputTexto}
                  style={{ flex: 1, fontSize: 15, color: theme.textPrimary, outlineStyle: 'none' as any }}
                  editable={!carregando}
                  onSubmitEditing={enviarMensagem}
                />

                <TouchableOpacity
                  onPress={enviarMensagem}
                  disabled={!podeEnviar}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: podeEnviar ? theme.yellow5 : theme.inputBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={podeEnviar ? (theme.id === 'dark' ? '#000' : '#FFF') : theme.gray4}
                  />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 10, textAlign: 'center' }}>
                A Vitta IA não fornece diagnósticos. Em caso de dúvidas médicas urgentes, consulte o oncologista.
              </Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const cardBibliotecaEstilo = {
  borderRadius: 14,
  padding: 14,
  borderWidth: 1,
  marginBottom: 8,
  gap: 4,
};