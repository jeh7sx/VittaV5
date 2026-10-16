import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { criarNotificacao } from '../utils/notificacao';
import { ExameData } from '../types/vittaIa';

export function calcularTurno(horario: string): string {
  const match = (horario || '').trim().match(/^(\d{1,2}):/);
  if (!match) return 'Manhã';
  const hora = parseInt(match[1], 10);
  if (hora >= 5 && hora < 12) return 'Manhã';
  if (hora >= 12 && hora < 18) return 'Tarde';
  return 'Noite';
}

export async function salvarExameNoBanco(
  exame: ExameData,
  usuarioId: string,
  filho: { id: string; nome: string }
) {
  const tituloFormatado = (exame.titulo || '').trim() || 'Exame Laboratorial';
  const dataFormatada = (exame.dataExame || '').trim();
  const horarioFormatado = (exame.horario || '').trim();

  const ref = await addDoc(collection(db, 'exames'), {
    titulo: tituloFormatado,
    descricao: (exame.descricao || tituloFormatado).trim(),
    nomeDoutor: (exame.nomeDoutor || '').trim(),
    nomeFilho: filho.nome,
    filhoId: filho.id,
    dataExame: dataFormatada,
    horario: horarioFormatado,
    turno: calcularTurno(horarioFormatado),
    hospital: (exame.hospital || '').trim(),
    hospitalPlaceId: '',
    hospitalLat: null,
    hospitalLng: null,
    status: ((exame as any).status || 'Ativo').trim(),
    fotos: [],
    responsavelId: usuarioId,
    criadoPorIA: true, // <-- ADICIONADO: Necessário para a Biblioteca encontrar o exame
    criadoEm: serverTimestamp(),
  });

  try {
    await criarNotificacao(
      usuarioId,
      filho.id,
      'Novo Exame',
      `${tituloFormatado} agendado para ${filho.nome}.`
    );
  } catch (err) {
    console.warn('Erro ao disparar notificação:', err);
  }

  return ref.id;
}