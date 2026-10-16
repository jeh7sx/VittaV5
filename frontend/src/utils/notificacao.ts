import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../services/firebase';

// import * as Notifications from 'expo-notifications';

// // Configura o comportamento do alerta quando o app estiver aberto
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export async function agendarLembrete(titulo, corpo, dataHoraAgendada) {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: titulo,
//       body: corpo,
//       sound: true,
//     },
//     trigger: { date: dataHoraAgendada }, // A data/hora exata do alarme
//   });
// }

export async function criarNotificacao(
  responsavelId: string,
  filhoId: string,
  titulo: string,
  mensagem: string
) {
  await addDoc(
    collection(db, 'notificacoes'),
    {
      titulo,
      mensagem,
      lida: false,
      responsavelId,
      filhoId,
      criadoEm: serverTimestamp(),
    }
  );
}