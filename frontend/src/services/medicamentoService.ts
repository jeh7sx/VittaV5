import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function salvarMedicamentoNoBanco(dados: any, userId: string, filho: any) {
  return await addDoc(collection(db, 'medicamentos'), {
    nome: dados.nome || '',
    nomeMedicamento: dados.nome || '',
    dosagem: dados.dosagem || '',
    horario: dados.horario || '08:00',
    frequencia: dados.frequencia || '8 Horas',
    dataInicio: dados.dataInicio || '',
    dataTermino: dados.dataTermino || '',
    hospital: dados.hospital || '',
    instrucoes: dados.instrucoes || '',
    status: 'Ativo',
    dosesTomadas: [],
    fotos: [],
    filhoId: filho.id,
    nomeFilho: filho.nome || '',
    responsavelId: userId,
    criadoPorIA: true,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
}