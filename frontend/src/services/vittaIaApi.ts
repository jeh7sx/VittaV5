import {
  MensagemIA,
  RespostaVittaIABackend,
  ChatSession,
  ModoIA,
} from '../types/vittaIa';

// URLs de Produção e Desenvolvimento com valores de contingência seguros
const URL_GEMINI = (
  process.env.EXPO_PUBLIC_VERCEL_API_URL_GEMINI ||
  'https://vitta-ia-gemini.vercel.app'
).replace(/\/+$/, '');

const URL_GROQ = (
  process.env.EXPO_PUBLIC_VERCEL_API_URL_GROQ ||
  'https://vitta-ia-backend.vercel.app'
).replace(/\/+$/, '');

/**
 * Executa uma chamada fetch com suporte a timeout para não travar a UI caso o backend caia.
 */
async function fetchComTimeout(url: string, options: RequestInit, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const idTimeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resposta = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return resposta;
  } finally {
    clearTimeout(idTimeout);
  }
}

/**
 * Envia a mensagem tentando primeiramente a rota do Gemini.
 * Em caso de erro de rede, timeout ou erro HTTP (ex: 429, 500, 503), tenta o Groq automaticamente.
 */
export async function enviarMensagemParaBackend(
  chatId: string,
  mensagens: MensagemIA[],
  contexto: any,
  modo: ModoIA = 'assistente'
): Promise<RespostaVittaIABackend> {
  const corpoRequisicao = JSON.stringify({
    chatId,
    mensagens,
    contexto,
    modo,
  });

  const headers = { 'Content-Type': 'application/json' };

  // 1. Tentar primeiro via Gemini
  try {
    const respostaGemini = await fetchComTimeout(`${URL_GEMINI}/vitta-ia/mensagem`, {
      method: 'POST',
      headers,
      body: corpoRequisicao,
    });

    if (respostaGemini.ok) {
      return await respostaGemini.json();
    }

    console.warn(`[Vitta IA] Gemini retornou status ${respostaGemini.status}. Alternando para Groq...`);
  } catch (erroGemini) {
    console.warn('[Vitta IA] Falha de comunicação com Gemini. Alternando para Groq...', erroGemini);
  }

  // 2. Fallback imediato via Groq
  try {
    const respostaGroq = await fetchComTimeout(`${URL_GROQ}/vitta-ia/mensagem`, {
      method: 'POST',
      headers,
      body: corpoRequisicao,
    });

    const dadosGroq = await respostaGroq.json();
    if (!respostaGroq.ok) {
      throw new Error(dadosGroq.erro || `Erro ${respostaGroq.status} no servidor Groq.`);
    }

    return dadosGroq;
  } catch (erroGroq: any) {
    console.error('[Vitta IA] Ambos os servidores falharam ao processar a mensagem:', erroGroq);
    throw new Error('Não foi possível obter resposta dos servidores de IA no momento. Tente novamente em instantes.');
  }
}

/**
 * Lista o histórico de conversas do utilizador tentando os dois backends.
 */
export async function listarChatsUsuario(usuarioId: string): Promise<ChatSession[]> {
  try {
    const resposta = await fetchComTimeout(`${URL_GEMINI}/vitta-ia/chats?usuarioId=${usuarioId}`, {}, 8000);
    if (resposta.ok) {
      const data = await resposta.json();
      return data.chats || [];
    }
  } catch {
    // Falha silenciosa no Gemini, tenta no Groq
  }

  try {
    const respostaGroq = await fetchComTimeout(`${URL_GROQ}/vitta-ia/chats?usuarioId=${usuarioId}`, {}, 8000);
    if (respostaGroq.ok) {
      const data = await respostaGroq.json();
      return data.chats || [];
    }
  } catch (err) {
    console.warn('Erro ao carregar lista de conversas:', err);
  }

  return [];
}

/**
 * Carrega o histórico de mensagens de uma sessão tentando os dois backends.
 */
export async function carregarMensagensDoChat(chatId: string): Promise<MensagemIA[]> {
  const mapearMensagens = (msgs: any[]): MensagemIA[] =>
    (msgs || []).map((m: any) => ({
      autor: m.autor,
      texto: m.conteudo || m.texto,
      tipo: m.tipo,
      dados: m.dados,
    }));

  try {
    const resposta = await fetchComTimeout(`${URL_GEMINI}/vitta-ia/chats/${chatId}/mensagens`, {}, 8000);
    if (resposta.ok) {
      const data = await resposta.json();
      return mapearMensagens(data.mensagens);
    }
  } catch {
    // Falha silenciosa no Gemini, tenta no Groq
  }

  try {
    const respostaGroq = await fetchComTimeout(`${URL_GROQ}/vitta-ia/chats/${chatId}/mensagens`, {}, 8000);
    if (respostaGroq.ok) {
      const data = await respostaGroq.json();
      return mapearMensagens(data.mensagens);
    }
  } catch (err) {
    console.warn('Erro ao carregar mensagens da conversa:', err);
  }

  return [];
}