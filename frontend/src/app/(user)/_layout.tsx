import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth, db } from "../../services/firebase";
import Sidebar from "../../components/Sidebar";
import GerenciadorLembretes from "../../components/lembretes/gerenciadorLembretes";
import LoadingVitta from '@/components/carregamentoVitta';
import { ThemeProvider } from '@/context/ThemeContext';

export const STORAGE_DEVICE_ID_KEY = '@vitta_device_session_id';

function obterNomeAparelho(): string {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    let navegador = 'Navegador Web';
    if (ua.includes('Chrome')) navegador = 'Google Chrome';
    else if (ua.includes('Safari')) navegador = 'Safari';
    else if (ua.includes('Firefox')) navegador = 'Firefox';
    else if (ua.includes('Edge')) navegador = 'Microsoft Edge';

    let so = 'Computador';
    if (ua.includes('Windows')) so = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) so = 'macOS';
    else if (ua.includes('Android')) so = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) so = 'iOS';
    else if (ua.includes('Linux')) so = 'Linux';

    return `${navegador} (${so})`;
  }

  return Platform.OS === 'android' ? 'Dispositivo Android' : 'iPhone / iPad';
}

export default function UserLayout() {
  const [autorizado, setAutorizado] = useState(false);
  const deslogandoRef = useRef(false);

  useEffect(() => {
    let unsubSessaoDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubSessaoDoc?.();

      if (!user) {
        setAutorizado(false);
        router.replace("/login");
        return;
      }

      if (deslogandoRef.current) return;

      try {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));
        if (adminSnap.exists()) {
          router.replace("/dashboard");
          return;
        }

        // 1. Obtém ou cria o identificador único deste dispositivo/navegador
        let deviceId: string | null = null;
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          deviceId = window.localStorage.getItem(STORAGE_DEVICE_ID_KEY);
        }
        if (!deviceId) {
          deviceId = await AsyncStorage.getItem(STORAGE_DEVICE_ID_KEY);
        }

        if (!deviceId) {
          deviceId = `disp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_DEVICE_ID_KEY, deviceId);
          }
          await AsyncStorage.setItem(STORAGE_DEVICE_ID_KEY, deviceId);
        }

        // 2. Regista / atualiza a sessão deste dispositivo na subcoleção 'sessoes'
        const sessaoRef = doc(db, 'usuarios', user.uid, 'sessoes', deviceId);
        await setDoc(
          sessaoRef,
          {
            deviceId,
            nomeAparelho: obterNomeAparelho(),
            plataforma: Platform.OS,
            ultimoAcesso: serverTimestamp(),
          },
          { merge: true }
        );

        // 3. Monitoriza a própria sessão: se ela for eliminada remotamente pelo utilizador, encerra a sessão na hora
        unsubSessaoDoc = onSnapshot(sessaoRef, async (snap) => {
          if (deslogandoRef.current) return;

          // Se o documento desta sessão foi apagado no Firestore, significa que foi desconectado
          if (!snap.exists()) {
            deslogandoRef.current = true;
            unsubSessaoDoc?.();

            if (Platform.OS === 'web' && typeof window !== 'undefined') {
              window.localStorage.removeItem(STORAGE_DEVICE_ID_KEY);
            }
            await AsyncStorage.removeItem(STORAGE_DEVICE_ID_KEY);

            try {
              await signOut(auth);
            } finally {
              router.replace("/login");
            }
          }
        });

        setAutorizado(true);
      } catch (e) {
        console.error("Erro ao validar acesso do utilizador:", e);
        router.replace("/login");
      }
    });

    return () => {
      unsubSessaoDoc?.();
      unsubscribeAuth();
    };
  }, []);

  if (!autorizado) {
    return <LoadingVitta />;
  }

  return (
    <View style={styles.container}>
      <ThemeProvider>
        <Sidebar />

        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>

        <GerenciadorLembretes />
      </ThemeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});