import { useState } from 'react';
import { Alert } from 'react-native';
import {
  MensagemVittaIA,
  ExameData,
  MedicamentoData,
  ConsultaData,
} from '../types/vittaIa';
import { enviarMensagemParaBackend } from '../services/vittaIaApi';

export default function useVittaIADemo() {
  const [mensagens, setMensagens] = useState<MensagemVittaIA[]>([
    {
      autor: 'ia',
      texto:
        'Olá! Eu sou a Vitta IA 💛. Estou aqui para tirar dúvidas sobre o tratamento, explicar termos médicos e ajudar você a entender como organizamos exames, medicamentos e consultas. Como posso te ajudar hoje?',
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Cards de demonstração
  const [examePendente, setExamePendente] = useState<ExameData | null>(null);
  const [medicamentoPendente, setMedicamentoPendente] = useState<MedicamentoData | null>(null);
  const [consultaPendente, setConsultaPendente] = useState<ConsultaData | null>(null);

  const enviarMensagem = async () => {
    const texto = inputTexto.trim();
    if (!texto || carregando) return;

    const novasMensagens: MensagemVittaIA[] = [...mensagens, { autor: 'usuario', texto }];
    setMensagens(novasMensagens);
    setInputTexto('');
    setCarregando(true);

    try {
      // Envia sem UID e sem filho (modo demonstração)
      const resposta = await enviarMensagemParaBackend('demo_session', novasMensagens, {
        usuario: { nome: 'Visitante' },
        filhoSelecionado: { nome: 'Paciente de Teste' },
      });

      setMensagens((prev) => [
        ...prev,
        { autor: 'ia', texto: resposta.mensagem, tipo: resposta.tipo, dados: resposta.dados },
      ]);

      if (resposta.tipo === 'acao_exame' && resposta.dados) {
        setExamePendente(resposta.dados);
      } else if (resposta.tipo === 'acao_medicamento' && resposta.dados) {
        setMedicamentoPendente(resposta.dados);
      } else if (resposta.tipo === 'acao_consulta' && resposta.dados) {
        setConsultaPendente(resposta.dados);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha ao conversar com a Vitta IA.');
    } finally {
      setCarregando(false);
    }
  };

  return {
    mensagens,
    inputTexto,
    setInputTexto,
    carregando,
    examePendente,
    setExamePendente,
    medicamentoPendente,
    setMedicamentoPendente,
    consultaPendente,
    setConsultaPendente,
    enviarMensagem,
  };
}