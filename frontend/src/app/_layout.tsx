// app/_layout.tsx
import { Stack, router, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { FilhoProvider } from "@/context/FilhoContext";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

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
  const [carregando, setCarregando] = useState(true);
  const segments = useSegments();
  const grupoAtual = segments[0];

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const ultimoSegmento = segments[segments.length - 1];

      let nomePagina = "Início";
      if (ultimoSegmento && TITULOS_ROTAS[ultimoSegmento]) {
        nomePagina = TITULOS_ROTAS[ultimoSegmento];
      } else if (ultimoSegmento) {
        nomePagina = ultimoSegmento.charAt(0).toUpperCase() + ultimoSegmento.slice(1);
      }

      document.title = `Vitta - ${nomePagina}`;
    }
  }, [segments]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const estaEmAuth = grupoAtual === "(auth)";
      const rotasPublicas = [
        "index",
        "inicio",
        "recursos",
        "faq",
        "suporte",
        "termos",
        "privacidade",
        undefined,
        "",
      ];

      const estaEmPaginaPublica = rotasPublicas.includes(grupoAtual);

      if (!user) {
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
          if (estaEmAuth || grupoAtual === "(user)") {
            router.replace("/dashboard");
          }
        } else {
          if (estaEmAuth || grupoAtual === "(admin)") {
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
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
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