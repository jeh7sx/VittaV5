import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
  StatusBar,
  Animated,
  PanResponder,
  Pressable,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STORAGE_POSICAO_Y_IA = '@vitta_sidebar_ia_btn_pos_y';
const LARGURA_MAXIMA = 280;

export default function SidebarIA({
  chats,
  chatIdAtual,
  onNovoChat,
  onSelecionarChat,
  onAbrirBiblioteca,
  onAlternarFixarChat,
  abaAtiva = 'chat',
}: Props) {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();

  const topoSeguro = Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 12 : 20;

  const [aberto, setAberto] = useState(false);
  const [recentesAberto, setRecentesAberto] = useState(true);

  // Animação de posição do botão flutuante suspenso
  const panY = useRef(new Animated.Value(topoSeguro + 60)).current;
  const ultimoY = useRef(topoSeguro + 60);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_POSICAO_Y_IA).then((salvo) => {
      if (salvo !== null) {
        const valor = parseFloat(salvo);
        if (!isNaN(valor)) {
          panY.setValue(valor);
          ultimoY.current = valor;
        }
      }
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 8;
      },
      onPanResponderGrant: () => {
        panY.setOffset(ultimoY.current);
        panY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: panY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        panY.flattenOffset();
        let destino = ultimoY.current + gestureState.dy;

        const minTop = topoSeguro;
        const maxTop = height - 70;

        if (destino < minTop) destino = minTop;
        if (destino > maxTop) destino = maxTop;

        ultimoY.current = destino;
        Animated.spring(panY, {
          toValue: destino,
          useNativeDriver: false,
          bounciness: 4,
        }).start();

        AsyncStorage.setItem(STORAGE_POSICAO_Y_IA, String(destino));
      },
    })
  ).current;

  const chatsFixados = chats.filter((c) => c.fixado);
  const chatsNaoFixados = chats.filter((c) => !c.fixado);
  const larguraEfetiva = Math.min(width * 0.8, LARGURA_MAXIMA);

  return (
    <>
      {/* BOTÃO FLUTUANTE SUSPENSO (Com o mesmo ícone fechado sideBarClosed.svg) */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.botaoFlutuanteContainer,
          {
            top: panY,
            opacity: aberto ? 0 : 0.85,
          },
        ]}
        pointerEvents={aberto ? 'none' : 'auto'}
      >
        <TouchableOpacity
          onPress={() => setAberto(true)}
          activeOpacity={0.7}
          accessibilityLabel="Abrir menu IA"
          style={[
            styles.botaoFlutuante,
            {
              // backgroundColor:
              //   theme.id === 'dark'
              //     ? 'rgba(30, 30, 30, 0.88)'
              //     : 'rgba(255, 255, 255, 0.92)',
              borderColor: theme.yellow5,
            },
          ]}
        >
          <Image
            source={require('@/img/icons/sideBarClosed.svg')}
            style={{ width: 20, height: 20, tintColor: theme.yellow5}}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* OVERLAY ESCURO PARA FECHAR AO TOCAR FORA */}
      {aberto && (
        <Pressable
          onPress={() => setAberto(false)}
          style={[
            styles.overlay,
            Platform.OS === 'web' && ({ overscrollBehavior: 'contain' } as any),
          ]}
        />
      )}

      {/* PAINEL LATERAL SUSPENSO / DRAWER */}
      {aberto && (
        <View
          style={[
            styles.drawerFlutuante,
            {
              width: larguraEfetiva,
              backgroundColor: theme.cardBg,
              borderRightColor: theme.border,
            },
            Platform.OS === 'web' && ({ overscrollBehavior: 'contain' } as any),
          ]}
        >
          {/* Topo: Logo + Botão recolher com o ícone sideBar.svg */}
          <View style={[styles.header, { paddingTop: topoSeguro }]}>
            <Text style={[styles.logoTexto, { color: theme.textPrimary }]}>
              vitta<Text style={{ color: theme.yellow5 }}>IA</Text>
            </Text>

            <TouchableOpacity
              onPress={() => setAberto(false)}
              accessibilityLabel="Fechar menu IA"
              style={[
                styles.botaoToggle,
                {
                  backgroundColor: theme.inputBg,                 
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Image
                source={require('@/img/icons/sideBar.svg')}
                style={{ width: 18, height: 18,  tintColor: theme.yellow5, }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* ROLAGEM DO CONTEÚDO (Sem recarregar ao puxar no topo) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            nestedScrollEnabled
            contentContainerStyle={styles.scrollContent}
            style={{ flex: 1 }}
          >
            <Text style={[styles.rotuloSecao, { color: theme.textSecondary }]}>Ações</Text>

            {/* Botão Novo Chat */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onNovoChat();
                if (width < 768) setAberto(false);
              }}
              style={[styles.btnNovoChat, { backgroundColor: theme.yellow5 }]}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={18}
                color={theme.id === 'dark' ? '#000' : '#1A1A1A'}
              />
              <Text
                style={[
                  styles.textoBtnNovoChat,
                  { color: theme.id === 'dark' ? '#000' : '#1A1A1A' },
                ]}
              >
                Novo Chat
              </Text>
            </TouchableOpacity>

            {/* Botão Biblioteca */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onAbrirBiblioteca();
                if (width < 768) setAberto(false);
              }}
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
                  <Text style={[styles.rotuloSecaoPequeno, { color: theme.textSecondary }]}>
                    Fixados
                  </Text>
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
                        onPress={() => {
                          onSelecionarChat(chat.id);
                          if (width < 768) setAberto(false);
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.textoItemChat,
                            {
                              color: ativo
                                ? theme.id === 'dark'
                                  ? '#FFF'
                                  : theme.yellow9
                                : theme.textPrimary,
                            },
                            ativo && { fontWeight: '700' },
                          ]}
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
                  <Text style={[styles.textoVazioRecentes, { color: theme.textSecondary }]}>
                    Nenhum chat recente
                  </Text>
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
                          onPress={() => {
                            onSelecionarChat(chat.id);
                            if (width < 768) setAberto(false);
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.textoItemChat,
                              {
                                color: ativo
                                  ? theme.id === 'dark'
                                    ? '#FFF'
                                    : theme.yellow9
                                  : theme.textPrimary,
                              },
                              ativo && { fontWeight: '700' },
                            ]}
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
      )}
    </>
  );
}

const styles = StyleSheet.create({
  botaoFlutuanteContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 250,
  },
  botaoFlutuante: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 299,
  },
  drawerFlutuante: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 300,
    borderRightWidth: 1,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
  },
  logoTexto: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  botaoToggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotuloSecao: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rotuloSecaoPequeno: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  btnNovoChat: {
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 8,
  },
  textoBtnNovoChat: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  btnBiblioteca: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  textoBtnBiblioteca: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  headerRecentes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  textoRecentes: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  listaRecentes: {
    gap: 2,
  },
  textoVazioRecentes: {
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  itemChatWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  textoItemChat: {
    fontSize: 12.5,
  },
  btnPinHover: {
    padding: 6,
  },
});