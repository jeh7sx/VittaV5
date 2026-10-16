import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';

export type TipoNotificacaoAdmin = 'usuario' | 'filho' | 'perfil' | 'alerta';

export async function notificarAdmin({
  titulo,
  descricao,
  tipo,
}: {
  titulo: string;
  descricao: string;
  tipo: TipoNotificacaoAdmin;
}) {
  try {
    await addDoc(collection(db, 'notificacoes_admin'), {
      titulo,
      descricao,
      tipo,
      lida: false,
      criadoEm: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao enviar notificação para o admin:', error);
  }
}