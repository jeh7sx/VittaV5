import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatSession } from '../../types/vittaIa';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  visivel: boolean;
  onFechar: () => void;
  chats: ChatSession[];
  chatIdAtual: string;
  onSelecionarChat: (chatId: string) => void;
  onNovoChat: () => void;
  onRenomearChat: (chatId: string, novoTitulo: string) => void;
}

const obterTituloChat = (chat: any, fallbackIndex: number): string => {
  if (!chat) return `Conversa ${fallbackIndex + 1}`;
  if (chat.titulo && typeof chat.titulo === 'string') return chat.titulo;
  const mensagens = chat.mensagens || chat.messages || chat.historico || chat.history;

  if (Array.isArray(mensagens) && mensagens.length > 0) {
    const msgUsuario = mensagens.find((m: any) => {
      const autor = m?.remetente || m?.role || m?.sender || m?.tipo || m?.from;
      return autor === 'user' || autor === 'usuario' || autor === 'client';
    }) || mensagens[0];

    const texto = typeof msgUsuario === 'string' ? msgUsuario : (msgUsuario?.texto || msgUsuario?.content || msgUsuario?.mensagem);
    if (texto && typeof texto === 'string' && texto.trim().length > 0) return texto.trim();
  }

  const camposTexto = [chat.primeiraMensagem, chat.preview, chat.ultimaMensagem];
  for (const campo of camposTexto) {
    if (campo && typeof campo === 'string' && campo.trim().length > 0) return campo.trim();
  }
  return `Conversa ${fallbackIndex + 1}`;
};

export const DrawerHistorico: React.FC<Props> = ({
  visivel,
  onFechar,
  chats,
  chatIdAtual,
  onSelecionarChat,
  onNovoChat,
  onRenomearChat,
}) => {
  const { theme } = useTheme();
  const [chatEditando, setChatEditando] = useState<{ id: string; titulo: string } | null>(null);
  const [tituloTemp, setTituloTemp] = useState('');

  const iniciarEdicao = (id: string, tituloAtual: string) => {
    setChatEditando({ id, titulo: tituloAtual });
    setTituloTemp(tituloAtual);
  };

  const salvarEdicao = () => {
    if (chatEditando && tituloTemp.trim().length > 0) {
      onRenomearChat(chatEditando.id, tituloTemp.trim());
    }
    setChatEditando(null);
  };

  return (
    <>
      <Modal visible={visivel} animationType="fade" transparent={true} onRequestClose={onFechar}>
        <TouchableWithoutFeedback onPress={onFechar}>
          <View style={drawerStyles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[drawerStyles.container, { backgroundColor: theme.cardBg }]}>
                {/* Header */}
                <View style={drawerStyles.header}>
                  <Text style={[drawerStyles.titulo, { color: theme.textPrimary }]}>Histórico de Conversas</Text>
                  <TouchableOpacity
                    onPress={onFechar}
                    style={[drawerStyles.botaoFechar, { backgroundColor: theme.inputBg }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Botão Nova Conversa */}
                <TouchableOpacity
                  style={[drawerStyles.botaoNovoChat, { backgroundColor: theme.yellow5 }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    onNovoChat();
                    onFechar();
                  }}
                >
                  <Ionicons name="add" size={18} color={theme.id === 'dark' ? '#000' : '#FFF'} />
                  <Text style={[drawerStyles.textoNovoChat, { color: theme.id === 'dark' ? '#000' : '#FFF' }]}>Nova Conversa</Text>
                </TouchableOpacity>

                <Text style={[drawerStyles.subtitulo, { color: theme.textSecondary }]}>Conversas ativas (últimos 3 dias)</Text>

                <ScrollView style={drawerStyles.listaChats} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                  {chats.length === 0 ? (
                    <View style={drawerStyles.containerVazio}>
                      <Ionicons name="chatbubbles-outline" size={36} color={theme.gray4} />
                      <Text style={[drawerStyles.textoVazio, { color: theme.textSecondary }]}>Nenhuma conversa recente encontrada.</Text>
                    </View>
                  ) : (
                    chats.map((chat, idx) => {
                      const isSelecionado = chat.id === chatIdAtual;
                      const titulo = obterTituloChat(chat, idx);

                      return (
                        <TouchableOpacity
                          key={chat.id || idx}
                          style={[
                            drawerStyles.itemChat,
                            { backgroundColor: theme.inputBg, borderColor: theme.border },
                            isSelecionado && { backgroundColor: theme.yellow1, borderColor: theme.yellow5 },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            onSelecionarChat(chat.id);
                            onFechar();
                          }}
                        >
                          <View style={[drawerStyles.avatarIcone, { backgroundColor: theme.cardBg }, isSelecionado && { backgroundColor: theme.yellow2 }]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={16} color={isSelecionado ? theme.yellow9 : theme.textSecondary} />
                          </View>

                          <View style={drawerStyles.infoChat}>
                            <Text numberOfLines={1} style={[drawerStyles.textoItemChat, { color: theme.textPrimary }, isSelecionado && { color: theme.yellow9, fontWeight: '700' }]}>
                              {titulo}
                            </Text>
                            <Text style={[drawerStyles.textoData, { color: theme.textSecondary }]}>
                              {chat.atualizadoEm
                                ? new Date(chat.atualizadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                : 'Recente'}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              iniciarEdicao(chat.id, titulo);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={drawerStyles.botaoEditar}
                          >
                            <Ionicons name="pencil-outline" size={15} color={isSelecionado ? theme.yellow9 : theme.gray4} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal para Renomear Conversa */}
      <Modal visible={!!chatEditando} transparent={true} animationType="fade" onRequestClose={() => setChatEditando(null)}>
        <TouchableWithoutFeedback onPress={() => setChatEditando(null)}>
          <View style={drawerStyles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[drawerStyles.modalContainer, { backgroundColor: theme.cardBg }]}>
                <Text style={[drawerStyles.modalTitulo, { color: theme.textPrimary }]}>Renomear Conversa</Text>

                <TextInput
                  style={[drawerStyles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  value={tituloTemp}
                  onChangeText={setTituloTemp}
                  placeholder="Digite o novo título..."
                  placeholderTextColor={theme.gray4}
                  autoFocus
                  maxLength={40}
                  onSubmitEditing={salvarEdicao}
                />

                <View style={drawerStyles.modalAcoes}>
                  <TouchableOpacity style={drawerStyles.btnCancelar} onPress={() => setChatEditando(null)}>
                    <Text style={[drawerStyles.textoBtnCancelar, { color: theme.textSecondary }]}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[drawerStyles.btnSalvar, { backgroundColor: theme.yellow5 }, !tituloTemp.trim() && drawerStyles.btnSalvarDesabilitado]}
                    onPress={salvarEdicao}
                    disabled={!tituloTemp.trim()}
                  >
                    <Text style={[drawerStyles.textoBtnSalvar, { color: theme.id === 'dark' ? '#000' : '#FFF' }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const drawerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
  },
  container: {
    width: '85%',
    maxWidth: 320,
    height: '100%',
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  botaoFechar: {
    padding: 6,
    borderRadius: 8,
  },
  botaoNovoChat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 22,
    elevation: 2,
  },
  textoNovoChat: {
    fontWeight: '700',
    fontSize: 14,
  },
  subtitulo: {
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listaChats: {
    flex: 1,
  },
  itemChat: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  avatarIcone: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoChat: {
    flex: 1,
  },
  textoItemChat: {
    fontSize: 13,
    fontWeight: '600',
  },
  textoData: {
    fontSize: 11,
    marginTop: 2,
  },
  botaoEditar: {
    padding: 4,
  },
  containerVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    gap: 10,
  },
  textoVazio: {
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 18,
  },
  modalAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btnCancelar: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  textoBtnCancelar: {
    fontWeight: '600',
    fontSize: 13,
  },
  btnSalvar: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnSalvarDesabilitado: {
    opacity: 0.5,
  },
  textoBtnSalvar: {
    fontWeight: '700',
    fontSize: 13,
  },
});