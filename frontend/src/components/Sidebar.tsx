import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useFilho } from '../context/FilhoContext';
import { useTheme } from '@/context/ThemeContext';
import { sair } from '../utils/sair';

import { tipografia } from '../styles/tipografia';
import filhoIcon from '../img/filho.svg';
import { IconLogout } from './Icons';

interface ItemMenu {
  label: string;
  icone: any;
  rota: string;
  secao?: string;
}

const MENU_PRINCIPAL: ItemMenu[] = [
  { label: 'Visão geral', icone: require('@/img/icons/dashboard.svg'), rota: '/visaoGeral' },
  { label: 'Medicamentos', icone: require('@/img/icons/medicamento.svg'), rota: '/medicamentos' },
  { label: 'Consultas', icone: require('@/img/icons/stethoscope-02.svg'), rota: '/consultas' },
  { label: 'Exames', icone: require('@/img/icons/microscope.svg'), rota: '/exames' },
  { label: 'Calendário', icone: require('@/img/icons/calendar-02.svg'), rota: '/calendario' },
  { label: 'Documentos', icone: require('@/img/icons/document.svg'), rota: '/documentos' },
];

const MENU_CONTA: ItemMenu[] = [
  { label: 'Perfil', icone: require('@/img/icons/user.svg'), rota: '/perfil' },
  { label: 'Crianças e adolescentes', icone: require('@/img/icons/userGroup.svg'), rota: '/filhos' },
];

const LARGURA_ABERTA = 286;
const LARGURA_FECHADA = 84;
const BREAKPOINT_DESKTOP = 768;
const STORAGE_KEY = '@vitta_user_sidebar_aberta';

interface UsuarioLogado {
  nome: string;
  email: string;
  fotoUri: string | null;
}

export default function Sidebar() {
  const { filhos, filhoSelecionado, setFilhoSelecionado } = useFilho();
  const { theme } = useTheme();

  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isDesktop = width >= BREAKPOINT_DESKTOP;
  const topoSeguro = Platform.OS === 'android' ? StatusBar.currentHeight || 16 : 16;

  const [aberta, setAberta] = useState(true);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [fotoFilho, setFotoFilho] = useState('');
  const [itemHover, setItemHover] = useState<string | null>(null);

  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado>({
    nome: 'Usuário',
    email: 'usuario@gmail.com',
    fotoUri: null,
  });

  useEffect(() => {
    const desinscrever = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let nomeFinal = user.displayName || 'Usuário';
        let fotoFinal = user.photoURL || null;
        const emailFinal = user.email || '';

        try {
          const [perfilSnap, fotoSnap] = await Promise.all([
            getDoc(doc(db, 'usuarios', user.uid)),
            getDoc(doc(db, 'fotos', user.uid)),
          ]);

          if (perfilSnap.exists() && perfilSnap.data().nome) {
            nomeFinal = perfilSnap.data().nome;
          }

          if (fotoSnap.exists() && fotoSnap.data().imagemBase64) {
            fotoFinal = fotoSnap.data().imagemBase64;
          } else {
            const fotoLocal = await AsyncStorage.getItem(`foto_${user.uid}`);
            if (fotoLocal) fotoFinal = fotoLocal;
          }
        } catch (e) {
          console.error('Erro ao buscar dados do utilizador:', e);
        }

        setUsuarioLogado({
          nome: nomeFinal,
          email: emailFinal,
          fotoUri: fotoFinal,
        });
      }
    });

    return () => desinscrever();
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setAberta(false);
      return;
    }
    AsyncStorage.getItem(STORAGE_KEY).then((valor) => {
      if (valor !== null) setAberta(valor === 'true');
    });
  }, [isDesktop]);

  function toggleSidebar() {
    const novoEstado = !aberta;
    setAberta(novoEstado);
    if (isDesktop) AsyncStorage.setItem(STORAGE_KEY, String(novoEstado));
  }

  useEffect(() => {
    if (!isDesktop) setAberta(false);
  }, [pathname, isDesktop]);

  useEffect(() => {
    async function carregarFoto() {
      if (!filhoSelecionado) {
        setFotoFilho('');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'filhos', filhoSelecionado.id));
        setFotoFilho(snap.exists() && snap.data().fotoBase64 ? snap.data().fotoBase64 : '');
      } catch {
        setFotoFilho('');
      }
    }
    carregarFoto();
  }, [filhoSelecionado?.id]);

  function selecionarFilho(filho: (typeof filhos)[0]) {
    setFilhoSelecionado(filho);
    setModalVisivel(false);
  }

  const isAtivo = (rota: string) => pathname === rota || pathname.startsWith(rota + '/');

  function ConteudoSidebar() {
    const larguraEfetiva = !isDesktop
      ? Math.min(width * 0.82, LARGURA_ABERTA)
      : aberta
        ? LARGURA_ABERTA
        : LARGURA_FECHADA;

    const exibirTexto = !isDesktop || aberta;
    const { isDark } = useTheme();
    const configAtivo = isAtivo('/configuracoes');
    const hoverConfig = itemHover === '__config_btn__';

    return (
      <View
        style={{
          width: larguraEfetiva,
          height: '100%',
          backgroundColor: theme.bg,
          paddingVertical: 16,
          paddingHorizontal: exibirTexto ? 16 : 10,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* BLOCO SUPERIOR */}
          <View style={{ gap: 24 }}>
            {/* Topo: Marca e Toggle */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: exibirTexto ? 'space-between' : 'center',
                minHeight: 36,
                paddingTop: !isDesktop ? topoSeguro : 0,
              }}
            >
              {exibirTexto && (
                <Image
                  source={
                    isDark
                      ? require('@/img/logotipo/vittaBlack.svg')
                      : require('@/img/logotipo/vittaWhite.svg')
                  }
                  style={{ width: 92, height: 32, resizeMode: 'contain' }}
                />
              )}

              <TouchableOpacity
                onPress={toggleSidebar}
                accessibilityLabel="Alternar menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.inputBg,
                }}
              >
                <Image
                  source={
                    exibirTexto
                      ? require('@/img/icons/sideBar.svg')
                      : require('@/img/icons/sideBarClosed.svg')
                  }
                  style={{ width: 20, height: 20, tintColor: theme.textSecondary }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Card Selecionar Filho */}
            <TouchableOpacity
              onPress={() => setModalVisivel(true)}
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 999,
                paddingVertical: exibirTexto ? 12 : 8,
                paddingHorizontal: exibirTexto ? 14 : 8,
                borderWidth: 1,
                borderColor: theme.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: exibirTexto ? 8 : 0,
                justifyContent: exibirTexto ? 'space-between' : 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: theme.inputBg,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {fotoFilho ? (
                    <Image source={{ uri: fotoFilho }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Image source={filhoIcon} style={{ width: 20, height: 20 }} />
                  )}
                </View>

                {exibirTexto && (
                  <View style={{ flex: 1, minWidth: 0 }}>
                    {!filhoSelecionado ? (
                      <ActivityIndicator size="small" color={theme.yellow5} />
                    ) : (
                      <Text
                        style={[tipografia.body, { fontWeight: '600', fontSize: 14, color: theme.yellow5 }]}
                        numberOfLines={1}
                      >
                        {filhoSelecionado?.nome ?? 'Selecionar filho'}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {exibirTexto && (
                <Image
                  source={require('@/img/icons/setaDireita.svg')}
                  style={{ width: 14, height: 14, tintColor: theme.gray4 }}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            {/* Menu Principal */}
            <View style={{ gap: 4 }}>
              {MENU_PRINCIPAL.map((item) => {
                const ativo = isAtivo(item.rota);
                const hover = itemHover === item.rota;

                return (
                  <Pressable
                    key={item.rota}
                    onPress={() => router.push(item.rota as any)}
                    onHoverIn={() => setItemHover(item.rota)}
                    onHoverOut={() => setItemHover(null)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: exibirTexto ? 14 : 0,
                      justifyContent: exibirTexto ? 'flex-start' : 'center',
                      paddingVertical: 12,
                      paddingHorizontal: exibirTexto ? 14 : 8,
                      borderRadius: 999,
                      backgroundColor: ativo
                        ? theme.yellow5
                        : hover
                          ? theme.yellow2
                          : 'transparent',
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        source={item.icone}
                        style={{
                          width: 22,
                          height: 22,
                          tintColor: ativo || hover ? (theme.modo === 'escuro' ? '#000' : theme.yellow9) : theme.gray4,
                        }}
                        resizeMode="contain"
                      />
                    </View>

                    {exibirTexto && (
                      <Text
                        style={[
                          tipografia.body,
                          {
                            fontSize: 14,
                            fontWeight: ativo ? '700' : hover ? '500' : '400',
                            color: ativo || hover ? (theme.modo === 'escuro' ? '#000' : theme.yellow9) : theme.gray4,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Seção Conta */}
            <View style={{ gap: 4, marginTop: 4 }}>
              {exibirTexto && (
                <Text
                  style={[
                    tipografia.caption,
                    {
                      fontSize: 12,
                      marginBottom: 4,
                      paddingHorizontal: 8,
                      color: theme.gray4,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    },
                  ]}
                >
                  Conta
                </Text>
              )}

              {MENU_CONTA.map((item) => {
                const ativo = isAtivo(item.rota);
                const hover = itemHover === item.rota;

                return (
                  <Pressable
                    key={item.rota}
                    onPress={() => router.push(item.rota as any)}
                    onHoverIn={() => setItemHover(item.rota)}
                    onHoverOut={() => setItemHover(null)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: exibirTexto ? 14 : 0,
                      justifyContent: exibirTexto ? 'flex-start' : 'center',
                      paddingVertical: 12,
                      paddingHorizontal: exibirTexto ? 14 : 8,
                      borderRadius: 999,
                      backgroundColor: ativo
                        ? theme.yellow5
                        : hover
                          ? theme.yellow2
                          : 'transparent',
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        source={item.icone}
                        style={{
                          width: 20,
                          height: 20,
                          tintColor: ativo || hover ? (theme.modo === 'escuro' ? '#000' : theme.yellow9) : theme.gray4,
                        }}
                        resizeMode="contain"
                      />
                    </View>

                    {exibirTexto && (
                      <Text
                        style={[
                          tipografia.body,
                          {
                            fontSize: 14,
                            fontWeight: ativo ? '700' : hover ? '500' : '400',
                            color: ativo || hover ? (theme.modo === 'escuro' ? '#000' : theme.yellow9) : theme.gray4,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* BLOCO INFERIOR: Botão de Configurações + Perfil */}
          <View style={{ gap: 10, paddingTop: 12 }}>
            {/* Botão de Configurações */}
            <Pressable
              onPress={() => router.push('/(user)/configuracoes')}
              onHoverIn={() => setItemHover('__config_btn__')}
              onHoverOut={() => setItemHover(null)}
              accessibilityRole="button"
              accessibilityLabel="Abrir configurações"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: configAtivo
                  ? theme.yellow5
                  : hoverConfig
                    ? theme.yellow1
                    : theme.cardBg,
                borderRadius: 999,
                paddingVertical: 10,
                paddingHorizontal: exibirTexto ? 14 : 8,
                borderWidth: 1,
                borderColor: configAtivo || hoverConfig ? theme.yellow5 : theme.border,
                justifyContent: exibirTexto ? 'space-between' : 'center',
                opacity: pressed ? 0.82 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image
                  source={require('@/img/icons/config.svg')}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: configAtivo
                      ? (theme.modo === 'escuro' ? '#000' : theme.yellow9)
                      : theme.textPrimary,
                  }}
                  resizeMode="contain"
                />
                {exibirTexto && (
                  <Text
                    style={[
                      tipografia.body,
                      {
                        fontSize: 13,
                        fontWeight: configAtivo ? '700' : '600',
                        color: configAtivo
                          ? (theme.modo === 'escuro' ? '#000' : theme.yellow9)
                          : theme.textPrimary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    Configurações
                  </Text>
                )}
              </View>

              {exibirTexto && (
                <Image
                  source={require('@/img/icons/setaDireita.svg')}
                  style={{
                    width: 14,
                    height: 14,
                    tintColor: configAtivo
                      ? (theme.modo === 'escuro' ? '#000' : theme.yellow9)
                      : theme.gray4,
                  }}
                  resizeMode="contain"
                />
              )}
            </Pressable>

            {/* Perfil */}
            <Pressable
              onPress={() => router.push('/perfil' as any)}
              onHoverIn={() => setItemHover('__perfil_card__')}
              onHoverOut={() => setItemHover(null)}
              accessibilityRole="button"
              accessibilityLabel="Abrir perfil"
              style={({ pressed }) => {
                const hoverPerfil = itemHover === '__perfil_card__';
                const perfilAtivo = isAtivo('/perfil');

                return {
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: perfilAtivo
                    ? theme.yellow1
                    : hoverPerfil
                      ? theme.yellow1
                      : theme.cardBg,
                  borderRadius: 999,
                  padding: exibirTexto ? 10 : 8,
                  borderWidth: 1,
                  borderColor:
                    perfilAtivo || hoverPerfil ? theme.yellow5 : theme.border,
                  justifyContent: exibirTexto ? 'space-between' : 'center',
                  opacity: pressed ? 0.82 : 1,
                };
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: theme.inputBg,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {usuarioLogado.fotoUri ? (
                    <Image
                      source={{ uri: usuarioLogado.fotoUri }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Text style={[tipografia.body, { color: theme.textPrimary }]}>
                      {usuarioLogado.nome.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                {exibirTexto && (
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={[{ fontWeight: '600', fontSize: 13 }, tipografia.body, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {usuarioLogado.nome}
                    </Text>
                    <Text
                      style={[tipografia.caption, { fontSize: 11, color: theme.gray4 }]}
                      numberOfLines={1}
                    >
                      {usuarioLogado.email}
                    </Text>
                  </View>
                )}
              </View>

              {exibirTexto && (
                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation();
                    sair();
                  }}
                  accessibilityLabel="Terminar sessão"
                  style={{ padding: 4 }}
                >
                  <IconLogout color={theme.gray4} />
                </TouchableOpacity>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  function ModalFilho() {
    return (
      <Modal
        animationType="fade"
        transparent
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: isDesktop ? 'flex-start' : 'center',
            alignItems: isDesktop ? 'flex-start' : 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setModalVisivel(false)}
        >
          <View
            style={{
              position: isDesktop ? 'absolute' : 'relative',
              top: isDesktop ? 96 : undefined,
              left: isDesktop ? (aberta ? 20 : LARGURA_FECHADA + 10) : undefined,
              width: isDesktop ? 260 : '90%',
              maxWidth: 340,
              backgroundColor: theme.cardBg,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Text
              style={[
                tipografia.body,
                {
                  fontWeight: '600',
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
            >
              Selecionar filho
            </Text>
            {filhos.length === 0 ? (
              <Text style={{ color: '#AAA', padding: 16, fontSize: 14 }}>
                Nenhum filho registado.
              </Text>
            ) : (
              <FlatList
                data={filhos}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 280 }}
                renderItem={({ item }) => {
                  const sel = filhoSelecionado?.id === item.id;
                  return (
                    <TouchableOpacity
                      onPress={() => selecionarFilho(item)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        backgroundColor: sel ? theme.yellow2 : theme.cardBg,
                        borderTopWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            tipografia.body,
                            {
                              fontWeight: sel ? '600' : '500',
                              color: sel ? (theme.modo === 'escuro' ? '#FFF' : theme.yellow9) : theme.textPrimary,
                            },
                          ]}
                        >
                          {item.nome}
                        </Text>
                        <Text style={[tipografia.caption, { color: theme.yellow6 }]}>
                          {item.idade} anos
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  if (isDesktop) {
    return (
      <>
        <ConteudoSidebar />
        <ModalFilho />
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={toggleSidebar}
        style={{
          position: 'absolute',
          top: topoSeguro,
          left: 16,
          zIndex: 200,
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Image
          source={require('@/img/icons/sideBarClosed.svg')}
          style={{ width: 20, height: 20, tintColor: theme.textSecondary }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {aberta && (
        <Pressable
          onPress={() => setAberta(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 299,
          }}
        />
      )}

      {aberta && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 300,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 20,
          }}
        >
          <ConteudoSidebar />
        </View>
      )}

      <ModalFilho />
    </>
  );
}