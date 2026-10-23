// app/_layout.tsx
import { Stack, router, useSegments } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { FilhoProvider } from "@/context/FilhoContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCarregarFontes } from "@/styles/tipografia";
import LoadingVitta from '@/components/carregamentoVitta';

// ==========================================
// 1. COMPONENTE DE ALERTA GLOBAL (INLINE NO LAYOUT)
// ==========================================
type AlertType = 'success' | 'error' | 'info' | 'warning';

interface GlobalAlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  showCancel: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const GlobalAlertContext = createContext<{
  triggerAlert: (title: string, message: string, type?: AlertType, showCancel?: boolean, onConfirm?: () => void, onCancel?: () => void) => void;
}>({} as any);

function GlobalAlertProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [alertState, setAlertState] = useState<GlobalAlertState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
  });

  const triggerAlert = (
    title: string,
    message: string,
    type: AlertType = 'info',
    showCancel: boolean = false,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
      showCancel,
      onConfirm,
      onCancel,
    });
  };

  const handleConfirm = async () => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    } else {
      // Fallback automático para mensagens comuns do sistema (como logout)
      if (alertState.message.includes("encerrar a sessão") || alertState.message.includes("sair")) {
        try {
          await signOut(auth);
          router.replace("/login");
        } catch (e) {
          console.error("Erro ao deslogar:", e);
        }
      }
    }
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const handleCancel = () => {
    if (alertState.onCancel) alertState.onCancel();
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  // Expõe a função globalmente para o window.alert / window.confirm da Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      (window as any)._vittaAlert = triggerAlert;
    }
  }, []);

  return (
    <GlobalAlertContext.Provider value={{ triggerAlert }}>
      {children}

      <Modal transparent visible={alertState.visible} animationType="fade" onRequestClose={handleCancel}>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: theme.cardBg, borderColor: theme.border, shadowColor: theme.black }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{alertState.title}</Text>
              <TouchableOpacity onPress={handleCancel} style={[styles.closeButton, { backgroundColor: theme.inputBg }]}>
                <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.message, { color: theme.textSecondary }]}>{alertState.message}</Text>

            <View style={styles.actionContainer}>
              {alertState.showCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: alertState.showCancel ? (theme.delete) : theme.yellow5 }, alertState.showCancel && { flex: 1 }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.buttonText, { color: alertState.showCancel ? theme.white : theme.yellow9 }]}>
                  {alertState.showCancel ? 'Confirmar' : 'Entendido'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GlobalAlertContext.Provider>
  );
}

// ==========================================
// 2. TÍTULOS DE ROTAS
// ==========================================
const TITULOS_ROTAS: Record<string, string> = {
  index: "Início",
  inicio: "Início",
  recursos: "Recursos",
  faq: "Perguntas Frequentes",
  suporte: "Suporte",
  termos: "Termos de Uso",
  privacidade: "Privacidade",
  login: "Entrar",
  cadastro: "Criar Conta",
  recuperarSenha: "Recuperar Senha",
  visaoGeral: "Visão Geral",
  medicamentos: "Medicamentos",
  consultas: "Consultas",
  exames: "Exames",
  documentos: "Documentos",
  perfil: "Meu Perfil",
  filhos: "Filhos",
  configuracoes: "Configurações",
  dashboard: "Dashboard Administrativo",
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GlobalAlertProvider>
        <MainLayout />
      </GlobalAlertProvider>
    </ThemeProvider>
  );
}

// ==========================================
// 3. LAYOUT PRINCIPAL E INTERCEÇÃO GLOBAL
// ==========================================
function MainLayout() {
  useCarregarFontes();
  const [carregando, setCarregando] = useState(true);
  const segments = useSegments();
  const grupoAtual = segments[0];

  // Intercepta nativamente qualquer alert() ou confirm() do navegador na Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert = (message: any) => {
        if ((window as any)._vittaAlert) {
          (window as any)._vittaAlert("Aviso Vitta", String(message), "info", false);
        }
      };

      window.confirm = (message: any) => {
        if ((window as any)._vittaAlert) {
          (window as any)._vittaAlert("Confirmação", String(message), "warning", true);
        }
        return false;
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      const ultimoSegmento = segments[segments.length - 1];
      let nomePagina = "Início";
      if (ultimoSegmento && TITULOS_ROTAS[ultimoSegmento]) {
        nomePagina = TITULOS_ROTAS[ultimoSegmento];
      } else if (ultimoSegmento) {
        nomePagina = ultimoSegmento.charAt(0).toUpperCase() + ultimoSegmento.slice(1);
      }
      document.title = `Vitta - ${nomePagina}`;

      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = require("@/img/logo.svg");
    }
  }, [segments]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const estaEmAuth = grupoAtual === "(auth)";
      const ehGrupoUser = grupoAtual === "(user)";
      const ehGrupoAdmin = grupoAtual === "(admin)";

      // Páginas públicas abertas apenas para quem NÃO está logado
      const rotasPublicas = ["index", "inicio", "recursos", "faq", "suporte", "termos", "privacidade", undefined, ""];
      const estaEmPaginaPublica = rotasPublicas.includes(grupoAtual);

      if (!user) {
        // Se NÃO estiver logado e tentar aceder a áreas protegidas ((user) ou (admin)), vai para o login
        if (!estaEmAuth && !estaEmPaginaPublica) {
          router.replace("/login");
        }
        setCarregando(false);
        return;
      }

      try {
        const adminRef = doc(db, "admins", user.uid);
        const snap = await getDoc(adminRef);
        const ehAdmin = snap.exists();

        if (ehAdmin) {
          // Se for Admin: se estiver em (auth), (user) ou numa página pública, joga para o painel admin
          if (estaEmAuth || ehGrupoUser || estaEmPaginaPublica) {
            router.replace("/dashboard");
          }
        } else {
          // SE FOR UTILIZADOR COMUM LOGADO:
          // Se estiver em (auth), em (admin) OU NMA PÁGINA PÚBLICA (como a home/index), é forçado a voltar para dentro de (user)
          if (estaEmAuth || ehGrupoAdmin || estaEmPaginaPublica) {
            router.replace("/visaoGeral");
          }
        }
      } catch (e) {
        console.error("Erro ao verificar acesso no root layout:", e);
      } finally {
        setCarregando(false);
      }
    });

    return unsubscribe;
  }, [grupoAtual]);

  if (carregando) {
    return <LoadingVitta />;
  }

  return (
    <FilhoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="inicio" />
        <Stack.Screen name="recursos" />
        <Stack.Screen name="faq" />
        <Stack.Screen name="suporte" />
        <Stack.Screen name="termos" />
        <Stack.Screen name="privacidade" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </FilhoProvider>
  );
}

// ==========================================
// 4. ESTILOS DO MODAL
// ==========================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999999999999,
      },
      default: {
        zIndex: 999999999999,
      }
    }),
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 999,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 1000000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  cancelButton: {
    borderWidth: 1,
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});