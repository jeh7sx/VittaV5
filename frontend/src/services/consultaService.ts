import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { criarNotificacao } from '../utils/notificacao';
import { ConsultaData } from '../types/vittaIa';

export async function salvarConsultaNoBanco(
  consulta: ConsultaData,
  usuarioId: string,
  filho: { id: string; nome: string }
) {
  const ref = await addDoc(collection(db, 'consultas'), {
    consulta: (consulta.consulta || consulta.especialidade || '').trim(),
    especialidade: (consulta.especialidade || consulta.consulta || '').trim(),
    nomeDoutor: (consulta.nomeDoutor || consulta.nomeMedico || '').trim(),
    hospital: (consulta.hospital || '').trim(),
    dataConsulta: (consulta.dataConsulta || '').trim(),
    horario: (consulta.horario || '').trim(),
    motivo: (consulta.motivo || consulta.descricao || '').trim(),
    nomeFilho: filho.nome,
    filhoId: filho.id,
    status: 'Agendada',
    responsavelId: usuarioId,
    criadoPorIA: true, 
    criadoEm: serverTimestamp(),
  });

  try {
    await criarNotificacao(
      usuarioId,
      filho.id,
      'Nova Consulta',
      `Consulta com ${consulta.especialidade || consulta.nomeDoutor || 'Médico'} agendada.`
    );
  } catch (err) {
    console.warn('Erro ao disparar notificação:', err);
  }

  return ref.id;
}