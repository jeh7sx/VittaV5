import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatSession } from '../../types/vittaIa';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  chats: ChatSession[];
  chatIdAtual: string;
  onNovoChat: () => void;
  onSelecionarChat: (chatId: string) => void;
  onAbrirBiblioteca: () => void;
  onAlternarFixarChat: (chatId: string) => void;
  abaAtiva?: 'chat' | 'biblioteca';
}

export default function SidebarIA({
  chats,
  chatIdAtual,
  onNovoChat,
  onSelecionarChat,
  onAbrirBiblioteca,
  onAlternarFixarChat,
  abaAtiva = 'chat',
}: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { theme } = useTheme();

  const [recentesAberto, setRecentesAberto] = useState(true);
  const [colapsado, setColapsado] = useState(false);

  const chatsFixados = chats.filter((c) => c.fixado);
  const chatsNaoFixados = chats.filter((c) => !c.fixado);

  if (colapsado) {
    return (
      <View style={[styles.sidebarColapsada, { backgroundColor: theme.cardBg, borderRightColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setColapsado(false)}
          style={[styles.botaoToggle, { backgroundColor: theme.inputBg }]}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNovoChat}
          style={[styles.iconeAcaoColapsado, { backgroundColor: theme.inputBg }]}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color={theme.yellow5} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAbrirBiblioteca}
          style={[styles.iconeAcaoColapsado, { backgroundColor: theme.inputBg }]}
          activeOpacity={0.8}
        >
          <Ionicons name="library-outline" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isMobile && styles.containerMobile, { backgroundColor: theme.cardBg, borderRightColor: theme.border }]}>
      {/* Topo: Logo + Botão recolher */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.logoTexto, { color: theme.textPrimary }]}>
            vitta<Text style={{ color: theme.yellow5 }}>IA</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setColapsado(true)}
          style={[styles.botaoToggle, { backgroundColor: theme.inputBg }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="file-tray-full-outline" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <Text style={[styles.rotuloSecao, { color: theme.textSecondary }]}>Ações</Text>

        {/* Botão Novo Chat */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onNovoChat}
          style={[styles.btnNovoChat, { backgroundColor: theme.yellow5 }]}
        >
          <Ionicons name="chatbox-ellipses-outline" size={18} color={theme.id === 'dark' ? '#000' : '#1A1A1A'} />
          <Text style={[styles.textoBtnNovoChat, { color: theme.id === 'dark' ? '#000' : '#1A1A1A' }]}>Novo Chat</Text>
        </TouchableOpacity>

        {/* Botão Biblioteca */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAbrirBiblioteca}
          style={[
            styles.btnBiblioteca,
            abaAtiva === 'biblioteca' && { backgroundColor: theme.yellow1 },
          ]}
        >
          <Ionicons
            name="library-outline"
            size={18}
            color={abaAtiva === 'biblioteca' ? theme.yellow6 : theme.textSecondary}
          />
          <Text
            style={[
              styles.textoBtnBiblioteca,
              { color: abaAtiva === 'biblioteca' ? theme.yellow6 : theme.textPrimary },
              abaAtiva === 'biblioteca' && { fontWeight: '700' },
            ]}
          >
            Biblioteca
          </Text>
        </TouchableOpacity>

        {/* Chats Fixados */}
        {chatsFixados.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ionicons name="pin" size={13} color={theme.yellow6} />
              <Text style={[styles.rotuloSecaoPequeno, { color: theme.textSecondary }]}>Fixados</Text>
            </View>

            {chatsFixados.map((chat, idx) => {
              const ativo = chat.id === chatIdAtual && abaAtiva === 'chat';
              const titulo = chat.titulo || chat.primeiraMensagem || `Conversa ${idx + 1}`;

              return (
                <View
                  key={chat.id || idx}
                  style={[styles.itemChatWrapper, ativo && { backgroundColor: theme.yellow1 }]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6 }}
                    onPress={() => onSelecionarChat(chat.id)}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.textoItemChat, { color: ativo ? (theme.id === 'dark' ? '#FFF' : theme.yellow9) : theme.textPrimary }, ativo && { fontWeight: '700' }]}
                    >
                      {titulo}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onAlternarFixarChat(chat.id)}
                    style={{ padding: 6 }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="pin" size={14} color={theme.yellow6} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Acordeão Recentes */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setRecentesAberto(!recentesAberto)}
          style={styles.headerRecentes}
        >
          <Text style={[styles.textoRecentes, { color: theme.textPrimary }]}>Recentes</Text>
          <Ionicons
            name={recentesAberto ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={16}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {recentesAberto && (
          <View style={styles.listaRecentes}>
            {chatsNaoFixados.length === 0 ? (
              <Text style={[styles.textoVazioRecentes, { color: theme.textSecondary }]}>Nenhum chat recente</Text>
            ) : (
              chatsNaoFixados.map((chat, idx) => {
                const ativo = chat.id === chatIdAtual && abaAtiva === 'chat';
                const titulo = chat.titulo || chat.primeiraMensagem || `Conversa ${idx + 1}`;

                return (
                  <View
                    key={chat.id || idx}
                    style={[styles.itemChatWrapper, ativo && { backgroundColor: theme.yellow1 }]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6 }}
                      onPress={() => onSelecionarChat(chat.id)}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.textoItemChat, { color: ativo ? (theme.id === 'dark' ? '#FFF' : theme.yellow9) : theme.textPrimary }, ativo && { fontWeight: '700' }]}
                      >
                        {titulo}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => onAlternarFixarChat(chat.id)}
                      style={styles.btnPinHover}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="pin-outline" size={14} color={theme.gray4} />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 270,
    height: '100%',
    borderRightWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  containerMobile: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 16,
  },
  sidebarColapsada: {
    width: 68,
    height: '100%',
    borderRightWidth: 1,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoTexto: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  botaoToggle: {
    padding: 6,
    borderRadius: 8,
  },
  iconeAcaoColapsado: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotuloSecao: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  rotuloSecaoPequeno: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  btnNovoChat: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  textoBtnNovoChat: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnBiblioteca: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  textoBtnBiblioteca: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerRecentes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  textoRecentes: {
    fontSize: 13,
    fontWeight: '600',
  },
  listaRecentes: {
    gap: 4,
  },
  textoVazioRecentes: {
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  itemChatWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  textoItemChat: {
    fontSize: 13,
  },
  btnPinHover: {
    padding: 6,
    opacity: 0.6,
  },
});