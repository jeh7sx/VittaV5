import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import LoadingVitta from '@/components/carregamentoVitta';

const ROTAS_ADMIN_VALIDAS = [
  '/dashboard',
  '/usuarios',
  '/equipe',
  '/personalizar',
  '/suporte',
  '/perfil',
];

export default function AdminLayout() {
  const [verificado, setVerificado] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let ativo = true;

    // Aguarda o Firebase restaurar a sessão do usuário
    const desinscrever = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        if (ativo) {
          router.replace('/login' as any);
        }
        return;
      }

      try {
        const adminRef = doc(db, 'admins', usuario.uid);
        const snap = await getDoc(adminRef);

        if (!snap.exists()) {
          Alert.alert('Acesso negado', 'Você não possui permissão para acessar o painel administrativo.');
          router.replace('/login' as any);
          return;
        }

        const dadosAdmin = snap.data();

        // 1. Redireciona para /dashboard se a URL for inexistente ou inválida
        const rotaExiste = ROTAS_ADMIN_VALIDAS.some(
          (r) => pathname === r || pathname.startsWith(r + '/')
        );

        if (!rotaExiste) {
          router.replace('/dashboard' as any);
          if (ativo) setVerificado(true);
          return;
        }

        // 2. Proteção de cargo: Se tentar acessar /equipe sem ser superadmin
        if (pathname.startsWith('/equipe') && dadosAdmin.cargo !== 'superadmin') {
          Alert.alert('Acesso Restrito', 'Apenas Superadministradores podem gerenciar a equipe.');
          router.replace('/dashboard' as any);
          if (ativo) setVerificado(true);
          return;
        }

        if (ativo) setVerificado(true);
      } catch (e) {
        console.error('Erro ao verificar permissão de admin:', e);
        Alert.alert('Erro', 'Não foi possível verificar suas permissões.');
        router.replace('/login' as any);
      }
    });

    return () => {
      ativo = false;
      desinscrever();
    };
  }, [pathname, router]);

  if (!verificado) {
    // return (
    //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
    //     <ActivityIndicator size="large" color="#F7B500" />
    //   </View>
    // );

     return <LoadingVitta />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}