import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

import { router, usePathname } from 'expo-router';

import {
  Alert,
  Image,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { tipografia } from '@/styles/tipografia';
import { colors } from '@/styles/colors';

import { auth, db } from '../../services/firebase';
import { sair } from '../../utils/sair';

import {
  IconDashboard,
  IconLogout,
  IconPersonalizar,
  IconSidebarToggle,
  IconSuporte,
  IconUsers,
} from '../Icons';

/* -------------------------------------------------------------------------- */
/*                                   TIPOS                                    */
/* -------------------------------------------------------------------------- */

type IconProps = {
  size?: number;
  color?: string;
};

interface ItemMenu {
  label: string;

  rota:
    | '/dashboard'
    | '/usuarios'
    | '/equipe'
    | '/personalizar'
    | '/suporte'
    | '/perfil';

  Icone: ComponentType<IconProps>;

  somenteSuperadmin?: boolean;
}

interface AdminUsuarioLogado {
  nome: string;
  email: string;
  cargo: 'superadmin' | 'admin';
  fotoUri?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                                ITENS MENU                                  */
/* -------------------------------------------------------------------------- */

const MENU: ItemMenu[] = [
  {
    label: 'Dashboard',
    rota: '/dashboard',
    Icone: IconDashboard,
  },
  {
    label: 'Usuários',
    rota: '/usuarios',
    Icone: IconUsers,
  },
  {
    label: 'Equipe Admins',
    rota: '/equipe',
    Icone: IconUsers,
    somenteSuperadmin: true,
  },
  // {
  //   label: 'Personalizar',
  //   rota: '/personalizar',
  //   Icone: IconPersonalizar,
  // },
  // {
  //   label: 'Suporte',
  //   rota: '/suporte',
  //   Icone: IconSuporte,
  // },
];

/* -------------------------------------------------------------------------- */
/*                           CONFIGURAÇÕES SIDEBAR                            */
/* -------------------------------------------------------------------------- */

const LARGURA_ABERTA = 296;
const LARGURA_FECHADA = 82;

const BREAKPOINT_DESKTOP = 900;

const STORAGE_KEY = '@vitta_admin_sidebar_aberta';

/* -------------------------------------------------------------------------- */
/*                              ADMIN SIDEBAR                                 */
/* -------------------------------------------------------------------------- */

export default function AdminSidebar() {
  const { width: larguraTela } = useWindowDimensions();

  const pathname = usePathname();

  const isDesktop = larguraTela >= BREAKPOINT_DESKTOP;

  /* ------------------------------------------------------------------------ */
  /*                                  STATE                                   */
  /* ------------------------------------------------------------------------ */

  const [aberta, setAberta] = useState(true);

  const [drawerMobileAberto, setDrawerMobileAberto] =
    useState(false);

  const [usuarioAtual, setUsuarioAtual] =
    useState<AdminUsuarioLogado>({
      nome: 'Administrador',
      email: 'admin@vitta.com',
      cargo: 'admin',
      fotoUri: null,
    });

  /* ------------------------------------------------------------------------ */
  /*                         CARREGAR ADMIN LOGADO                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const desinscrever = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) return;

        let nomeEncontrado =
          user.displayName || 'Administrador';

        let fotoEncontrada =
          user.photoURL || null;

        const emailEncontrado =
          user.email || 'admin@vitta.com';

        let cargoEncontrado:
          | 'superadmin'
          | 'admin' = 'admin';

        try {
          const snapshot = await getDoc(
            doc(db, 'admins', user.uid)
          );

          if (snapshot.exists()) {
            const dados = snapshot.data();

            // GUARDA DE SEGURANÇA: Bloqueia sessões ativas imediatamente
            if (dados.status === 'bloqueado') {
              await signOut(auth);
              if (Platform.OS === 'web') {
                window.alert('Seu acesso administrativo foi suspenso.');
              } else {
                Alert.alert('Sessão Bloqueada', 'Seu acesso administrativo foi suspenso.');
              }
              router.replace('/login');
              return;
            }

            if (dados.nome) {
              nomeEncontrado = dados.nome;
            }

            if (dados.cargo === 'superadmin') {
              cargoEncontrado = 'superadmin';
            }

            if (
              dados.fotoUri ||
              dados.foto ||
              dados.avatarUrl
            ) {
              fotoEncontrada =
                dados.fotoUri ||
                dados.foto ||
                dados.avatarUrl;
            }
          }
        } catch (erro) {
          console.error(
            'Erro ao recuperar dados do admin:',
            erro
          );
        }

        setUsuarioAtual({
          nome: nomeEncontrado,
          email: emailEncontrado,
          cargo: cargoEncontrado,
          fotoUri: fotoEncontrada,
        });
      }
    );

    return () => desinscrever();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*                      RECUPERA ESTADO DA SIDEBAR                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isDesktop) return;

    AsyncStorage.getItem(STORAGE_KEY).then(
      (valor) => {
        if (valor !== null) {
          setAberta(valor === 'true');
        }
      }
    );
  }, [isDesktop]);

  /* ------------------------------------------------------------------------ */
  /*                    FECHAR AUTOMATICAMENTE MOBILE                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isDesktop) {
      setDrawerMobileAberto(false);
    }
  }, [pathname, isDesktop]);

  /* ------------------------------------------------------------------------ */
  /*                            FUNÇÕES AUXILIARES                             */
  /* ------------------------------------------------------------------------ */

  function alternar() {
    const novoEstado = !aberta;

    setAberta(novoEstado);

    if (isDesktop) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        String(novoEstado)
      );
    }
  }

  const isAtivo = (rota: string) =>
    pathname === rota ||
    pathname.startsWith(`${rota}/`);

  function irPara(rota: ItemMenu['rota']) {
    router.push(rota as any);
  }

  /* ------------------------------------------------------------------------ */
  /*                         FILTRAGEM DOS ITENS                              */
  /* ------------------------------------------------------------------------ */

  const itensFiltrados = MENU.filter(
    (item) => {
      if (
        item.somenteSuperadmin &&
        usuarioAtual.cargo !== 'superadmin'
      ) {
        return false;
      }

      return true;
    }
  );

  /* ------------------------------------------------------------------------ */
  /*                        CONTEÚDO DA SIDEBAR                               */
  /* ------------------------------------------------------------------------ */

  function ConteudoInterno({
    expandido,
    aoFechar,
  }: {
    expandido: boolean;
    aoFechar?: () => void;
  }) {
    return (
      <View
        style={{
          width: expandido
            ? LARGURA_ABERTA
            : LARGURA_FECHADA,

          height: '100%',
          backgroundColor: colors.bg,
          paddingTop: 18,
          paddingBottom: 18,
          paddingHorizontal: expandido
            ? 16
            : 8,
          justifyContent: 'space-between',
        }}
      >
        {/* --------------------------------------------------------------- */}
        {/*                             TOPO                                */}
        {/* --------------------------------------------------------------- */}

        <View>
          {/* Header */}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',

              justifyContent: expandido
                ? 'space-between'
                : 'center',

              marginBottom: 24,
            }}
          >
            {/* Logo */}

            {expandido && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('@/img/logo.svg')}
                  style={{
                    width: 88,
                    height: 32,
                  }}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Botão expandir/recolher */}

            <TouchableOpacity
              onPress={aoFechar ?? alternar}
              accessibilityLabel={
                expandido
                  ? 'Recolher menu'
                  : 'Expandir menu'
              }
              style={{
                width: 28,
                height: 28,

                justifyContent: 'center',
                alignItems: 'center',

                borderRadius: 8,
              }}
            >
              <Image
                source={
                  expandido
                    ? require('@/img/icons/sideBar.svg')
                    : require('@/img/icons/sideBarClosed.svg')
                }
                style={{
                  width: 24,
                  height: 24,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* ------------------------------------------------------------- */}
          {/*                         NAVEGAÇÃO                             */}
          {/* ------------------------------------------------------------- */}

          <View>
            {itensFiltrados.map((item) => (
              <ItemNav
                key={item.rota}
                item={item}
                ativo={isAtivo(item.rota)}
                expandido={expandido}
                onPress={() =>
                  irPara(item.rota)
                }
              />
            ))}
          </View>
        </View>

        {/* --------------------------------------------------------------- */}
        {/*                       USUÁRIO / PERFIL                          */}
        {/* --------------------------------------------------------------- */}

        <Pressable
          onPress={() => irPara('/perfil')}
          style={{
            flexDirection: 'row',

            alignItems: 'center',

            justifyContent: expandido
              ? 'space-between'
              : 'center',

            backgroundColor: colors.white,

            borderWidth: 1,
            borderColor: colors.gray1,

            borderRadius: 999,

            paddingVertical: expandido
              ? 12
              : 8,

            paddingHorizontal: expandido
              ? 14
              : 8,

            minHeight: 64,
          }}
        >
          {/* Avatar + dados */}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',

              gap: 8,

              flex: 1,
            }}
          >
            {/* Avatar */}

            <View
              style={{
                width: 40,
                height: 40,

                borderRadius: 999,

                backgroundColor: '#E6E6E6',

                overflow: 'hidden',

                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {usuarioAtual.fotoUri ? (
                <Image
                  source={{
                    uri: usuarioAtual.fotoUri,
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              ) : (
                <Text
                  style={{
                    fontSize: 14,

                    fontWeight: '800',

                    color: '#666666',
                  }}
                >
                  {usuarioAtual.nome
                    ?.charAt(0)
                    ?.toUpperCase() || 'A'}
                </Text>
              )}
            </View>

            {/* Dados do usuário */}

            {expandido && (
              <View
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    tipografia.body,
                    {
                      fontWeight: '600',
                    },
                  ]}
                >
                  {usuarioAtual.nome}
                </Text>

                <Text
                  numberOfLines={1}
                  style={tipografia.caption}
                >
                  {usuarioAtual.email}
                </Text>
              </View>
            )}
          </View>

          {/* Logout */}

          {expandido && (
            <TouchableOpacity
              onPress={(evento) => {
                evento.stopPropagation();

                sair();
              }}
              accessibilityLabel="Sair"
              style={{
                width: 28,
                height: 28,

                alignItems: 'center',
                justifyContent: 'center',

                marginLeft: 8,
              }}
            >
              <IconLogout
                size={20}
                color={colors.gray4}
              />
            </TouchableOpacity>
          )}
        </Pressable>
      </View>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                 DESKTOP                                  */
  /* ------------------------------------------------------------------------ */

  if (isDesktop) {
    return (
      <ConteudoInterno
        expandido={aberta}
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  MOBILE                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* Botão mobile */}

      <TouchableOpacity
        onPress={() =>
          setDrawerMobileAberto(true)
        }
        accessibilityLabel="Abrir menu"
        style={{
          position: 'absolute',

          top: 16,
          left: 16,

          zIndex: 200,

          width: 40,
          height: 40,

          borderRadius: 12,

          backgroundColor: '#FFFFFF',

          justifyContent: 'center',
          alignItems: 'center',

          shadowColor: '#000000',

          shadowOffset: {
            width: 0,
            height: 4,
          },

          shadowOpacity: 0.08,

          shadowRadius: 10,

          elevation: 5,
        }}
      >
        <IconSidebarToggle
          size={20}
          color={colors.gray4}
        />
      </TouchableOpacity>

      {/* Overlay */}

      {drawerMobileAberto && (
        <Pressable
          onPress={() =>
            setDrawerMobileAberto(false)
          }
          style={{
            position: 'absolute',

            top: 0,
            left: 0,
            right: 0,
            bottom: 0,

            backgroundColor:
              'rgba(0, 0, 0, 0.28)',

            zIndex: 299,
          }}
        />
      )}

      {/* Drawer */}

      {drawerMobileAberto && (
        <View
          style={{
            position: 'absolute',

            top: 0,
            left: 0,
            bottom: 0,

            zIndex: 300,

            shadowColor: '#000000',

            shadowOffset: {
              width: 4,
              height: 0,
            },

            shadowOpacity: 0.12,

            shadowRadius: 12,

            elevation: 20,
          }}
        >
          <ConteudoInterno
            expandido
            aoFechar={() =>
              setDrawerMobileAberto(false)
            }
          />
        </View>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                            ITEM DE NAVEGAÇÃO                               */
/* -------------------------------------------------------------------------- */

function ItemNav({
  item,
  ativo,
  expandido,
  onPress,
}: {
  item: ItemMenu;

  ativo: boolean;

  expandido: boolean;

  onPress: () => void;
}) {
  const [hover, setHover] =
    useState(false);

  const { Icone } = item;

  const corConteudo = ativo
    ? colors.yellow9
    : colors.gray4;

  return (
    <Pressable
      onPress={onPress}

      // @ts-ignore
      onHoverIn={() =>
        setHover(true)
      }

      // @ts-ignore
      onHoverOut={() =>
        setHover(false)
      }

      accessibilityLabel={item.label}

      style={{
        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: expandido
          ? 'flex-start'
          : 'center',

        gap: expandido ? 8 : 0,

        minHeight: 46,

        paddingHorizontal: expandido
          ? 32
          : 10,

        paddingVertical: expandido
          ? 16
          : 10,

        borderRadius: 999,

        backgroundColor: ativo
          ? colors.yellow5
          : hover
            ? colors.gray1
            : 'transparent',
      }}
    >
      <Icone
        size={20}
        color={corConteudo}
      />

      {expandido && (
        <Text
          style={[
            tipografia.body,
            {
              fontSize: 16,

              fontWeight: ativo
                ? '700'
                : '500',

              color: corConteudo,
            },
          ]}
        >
          {item.label}
        </Text>
      )}
    </Pressable>
  );
}