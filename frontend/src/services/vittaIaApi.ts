import {
  MensagemIA,
  RespostaVittaIABackend,
  ChatSession,
  ModoIA,
} from '../types/vittaIa';

const VERCEL_API_URL = 'https://vitta-ia-backend.vercel.app';
// const LOCAL_API_URL2 = 'http://localhost:3001';

// const API_URL = (process.env.EXPO_PUBLIC_API_URL || VERCEL_API_URL).replace(/\/+$/, '');
const API_URL = (process.env.LOCAL_API_URL || VERCEL_API_URL).replace(/\/+$/, '');

export async function enviarMensagemParaBackend(
  chatId: string,
  mensagens: MensagemIA[],
  contexto: any,
  modo: ModoIA = 'assistente'
): Promise<RespostaVittaIABackend> {
  const response = await fetch(`${API_URL}/vitta-ia/mensagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      mensagens,
      contexto,
      modo, // <-- Enviando o modo ('assistente' ou 'suporte') para o backend
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.erro || 'Erro ao consultar o servidor da IA.');
  }

  return data;
}

export async function listarChatsUsuario(usuarioId: string): Promise<ChatSession[]> {
  const response = await fetch(`${API_URL}/vitta-ia/chats?usuarioId=${usuarioId}`);
  const data = await response.json();
  return data.chats || [];
}

export async function carregarMensagensDoChat(chatId: string): Promise<MensagemIA[]> {
  const response = await fetch(`${API_URL}/vitta-ia/chats/${chatId}/mensagens`);
  const data = await response.json();
  return (data.mensagens || []).map((m: any) => ({
    autor: m.autor,
    texto: m.conteudo || m.texto,
    tipo: m.tipo,
    dados: m.dados,
  }));
}