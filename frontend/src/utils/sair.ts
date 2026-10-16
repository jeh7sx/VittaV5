import { Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_SESSAO_KEY = '@vitta_sessao_id';

// Logout imediato sem modal de confirmação (usado na invalidação remota)
export async function deslogarForcado() {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_SESSAO_KEY);
    }
    await AsyncStorage.removeItem(STORAGE_SESSAO_KEY);

    await signOut(auth);
    router.replace('/login');
  } catch (error) {
    console.error('Erro ao forçar logout:', error);
    router.replace('/login');
  }
}

export async function sair() {

  const confirmar = window.confirm(
    'Deseja realmente encerrar a sessão?'
  );

  if (!confirmar) return;

  try {
    await signOut(auth);

    router.replace('/login');

  } catch (erro) {

    console.log(erro);

  }
}