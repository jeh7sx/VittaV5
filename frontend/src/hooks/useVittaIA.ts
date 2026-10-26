import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase';
import { useFilho } from '../context/FilhoContext';
import {
    MensagemIA,
    ExameData,
    MedicamentoData,
    ConsultaData,
    SuporteData,
    ChatSession,
    ModoIA,
} from '../types/vittaIa';
import {
    enviarMensagemParaBackend,
    listarChatsUsuario,
    carregarMensagensDoChat,
} from '../services/vittaIaApi';
import { salvarExameNoBanco } from '../services/exameService';
import { salvarMedicamentoNoBanco } from '../services/medicamentoService';
import { salvarConsultaNoBanco } from '../services/consultaService';
import { onAuthStateChanged } from 'firebase/auth';

const STORAGE_TITULOS_KEY = '@vitta_ia_titulos_chats';
const STORAGE_FIXADOS_KEY = '@vitta_ia_chats_fixados';

const obterTitulosSalvos = async (): Promise<Record<string, string>> => {
    try {
        const json = await AsyncStorage.getItem(STORAGE_TITULOS_KEY);
        return json ? JSON.parse(json) : {};
    } catch {
        return {};
    }
};

const salvarTituloLocal = async (chatId: string, titulo: string) => {
    try {
        const titulos = await obterTitulosSalvos();
        titulos[chatId] = titulo;
        await AsyncStorage.setItem(STORAGE_TITULOS_KEY, JSON.stringify(titulos));
    } catch (err) {
        console.warn('Erro ao salvar título no AsyncStorage:', err);
    }
};

const obterFixadosSalvos = async (): Promise<string[]> => {
    try {
        const json = await AsyncStorage.getItem(STORAGE_FIXADOS_KEY);
        return json ? JSON.parse(json) : [];
    } catch {
        return [];
    }
};

const salvarFixadosLocal = async (idsFixados: string[]) => {
    try {
        await AsyncStorage.setItem(STORAGE_FIXADOS_KEY, JSON.stringify(idsFixados));
    } catch (err) {
        console.warn('Erro ao salvar chats fixados:', err);
    }
};

export default function useVittaIA() {
    const usuario = auth.currentUser;
    const { filhoSelecionado } = useFilho();

    const [nomeUsuario] = useState('usuário');
    const [chatIdAtual, setChatIdAtual] = useState<string>(() => `chat_${Date.now()}`);
    const [historicoChats, setHistoricoChats] = useState<ChatSession[]>([]);
    const [mensagens, setMensagens] = useState<MensagemIA[]>([]);
    const [inputTexto, setInputTexto] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [salvandoAcao, setSalvandoAcao] = useState(false);

    // Modo da IA
    const [modoAtivo, setModoAtivo] = useState<ModoIA>('assistente');

    // Estados das ações estruturadas
    const [examePendente, setExamePendente] = useState<ExameData | null>(null);
    const [medicamentoPendente, setMedicamentoPendente] = useState<MedicamentoData | null>(null);
    const [consultaPendente, setConsultaPendente] = useState<ConsultaData | null>(null);
    const [suportePendente, setSuportePendente] = useState<SuporteData | null>(null);

    // Reinicia o card de suporte e atualiza o histórico
    const fecharSuporteEResetar = () => {
        setSuportePendente(null);
        setMensagens((msgsAnteriores) =>
            msgsAnteriores.map((m) =>
                m.tipo === 'acao_suporte'
                    ? { ...m, tipo: 'mensagem', dados: null }
                    : m
            )
        );
    };

    function normalizarMedicamentoIA(dados: any): MedicamentoData {
        let dosagem = dados.dosagem || '1 Comprimido(s)';
        if (/^\d+$/.test(dosagem.trim())) {
            dosagem = `${dosagem.trim()} Comprimido(s)`;
        }

        let frequencia = dados.frequencia || '8 Horas';
        const matchFreq = frequencia.match(/(\d+)/);
        if (matchFreq) {
            frequencia = `${matchFreq[1]} Horas`;
        }

        let horario = dados.horario;
        if (!horario || horario.length < 4) {
            const agora = new Date();
            horario = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
        }

        let dataInicio = dados.dataInicio;
        if (!dataInicio) {
            const hoje = new Date();
            dataInicio = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
        }

        return {
            ...dados,
            dosagem,
            frequencia,
            horario,
            dataInicio,
            criadoPorIA: true,
        };
    }

    const carregarChats = useCallback(async (uid?: string) => {
        const targetUid = uid || auth.currentUser?.uid;
        if (!targetUid) return;

        try {
            const [chats, titulosLocais, fixadosLocais] = await Promise.all([
                listarChatsUsuario(targetUid),
                obterTitulosSalvos(),
                obterFixadosSalvos(),
            ]);

            const tresDiasAtras = new Date();
            tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

            const chatsMapeados = chats.map((chat) => {
                const tituloFinal =
                    (chat as any).titulo || titulosLocais[chat.id] || undefined;
                const ehFixado = fixadosLocais.includes(chat.id) || !!chat.fixado;
                return {
                    ...chat,
                    titulo: tituloFinal,
                    fixado: ehFixado,
                };
            });

            const chatsValidos = chatsMapeados.filter((chat) => {
                if (chat.fixado) return true;
                const dataReferencia = chat.atualizadoEm ? new Date(chat.atualizadoEm) : null;
                if (!dataReferencia || isNaN(dataReferencia.getTime())) return true;
                return dataReferencia >= tresDiasAtras;
            });

            setHistoricoChats(chatsValidos);
        } catch (err) {
            console.warn('Erro ao listar conversas:', err);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (usr) => {
            if (usr) {
                carregarChats(usr.uid);
            }
        });
        return () => unsubscribe();
    }, [carregarChats]);

    const alternarFixarChat = async (chatId: string) => {
        try {
            const fixadosAtuais = await obterFixadosSalvos();
            let novosFixados: string[];

            if (fixadosAtuais.includes(chatId)) {
                novosFixados = fixadosAtuais.filter((id) => id !== chatId);
            } else {
                novosFixados = [...fixadosAtuais, chatId];
            }

            await salvarFixadosLocal(novosFixados);
            setHistoricoChats((prev) =>
                prev.map((c) =>
                    c.id === chatId ? { ...c, fixado: novosFixados.includes(chatId) } : c
                )
            );
        } catch (err) {
            console.warn('Erro ao alternar fixado:', err);
        }
    };

    const selecionarChat = async (id: string) => {
        try {
            setCarregando(true);
            setChatIdAtual(id);
            const msgs = await carregarMensagensDoChat(id);
            setMensagens(msgs);
            setExamePendente(null);
            setMedicamentoPendente(null);
            setConsultaPendente(null);
            setSuportePendente(null);
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível carregar o histórico desta conversa.');
        } finally {
            setCarregando(false);
        }
    };

    const iniciarNovoChat = () => {
        setChatIdAtual(`chat_${Date.now()}`);
        setMensagens([]);
        setExamePendente(null);
        setMedicamentoPendente(null);
        setConsultaPendente(null);
        setSuportePendente(null);
    };

    const renomearChat = async (chatId: string, novoTitulo: string) => {
        const tituloFormatado = novoTitulo.trim();
        if (!tituloFormatado) return;

        await salvarTituloLocal(chatId, tituloFormatado);
        setHistoricoChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId ? { ...chat, titulo: tituloFormatado } : chat
            )
        );
    };

    const enviarMensagem = async () => {
        const texto = inputTexto.trim();
        if (!texto || carregando) return;

        const historicoPreparado = mensagens.map((m) =>
            m.tipo === 'acao_suporte' ? { ...m, tipo: 'mensagem' as const, dados: null } : m
        );

        const novasMensagens: MensagemIA[] = [...historicoPreparado, { autor: 'usuario', texto }];
        setMensagens(novasMensagens);
        setInputTexto('');
        setCarregando(true);

        setSuportePendente(null);
        setExamePendente(null);
        setMedicamentoPendente(null);
        setConsultaPendente(null);

        if (mensagens.length === 0) {
            const tituloGerado = texto.length > 28 ? `${texto.substring(0, 28)}...` : texto;
            await salvarTituloLocal(chatIdAtual, tituloGerado);

            setHistoricoChats((prev) => {
                const index = prev.findIndex((c) => c.id === chatIdAtual);
                if (index >= 0) {
                    const copia = [...prev];
                    copia[index] = { ...copia[index], titulo: tituloGerado } as any;
                    return copia;
                }
                return [
                    {
                        id: chatIdAtual,
                        titulo: tituloGerado,
                        atualizadoEm: new Date().toISOString(),
                        fixado: false,
                    } as any,
                    ...prev,
                ];
            });
        }

        try {
            const primeiraMensagemDoChat = mensagens.length === 0 ? texto : undefined;

            const resposta = await enviarMensagemParaBackend(
                chatIdAtual,
                novasMensagens,
                {
                    usuario: { uid: usuario?.uid, nome: nomeUsuario, email: usuario?.email },
                    filhoSelecionado: filhoSelecionado ? { id: filhoSelecionado.id, nome: filhoSelecionado.nome } : null,
                    titulo: primeiraMensagemDoChat,
                },
                modoAtivo
            );

            // Garante dados estruturados para o suporte mesmo se vierem incompletos do backend
            const dadosSuporte: SuporteData = resposta.dados || {
                email: 'vittaetec@gmail.com',
                assunto: 'Solicitação de Suporte Vitta',
                corpo: `Olá equipe Vitta,\n\nPreciso de suporte com a seguinte questão:\n${texto}\n\nResponsável: ${usuario?.displayName || usuario?.email || 'Usuário'}`,
            };

            setMensagens((prev) => [
                ...prev,
                {
                    autor: 'ia',
                    texto: resposta.mensagem,
                    tipo: resposta.tipo,
                    dados: resposta.tipo === 'acao_suporte' ? dadosSuporte : resposta.dados,
                },
            ]);

            if (resposta.tipo === 'acao_exame' && resposta.dados) {
                setExamePendente({ ...resposta.dados, criadoPorIA: true });
            } else if (resposta.tipo === 'acao_medicamento' && resposta.dados) {
                setMedicamentoPendente(normalizarMedicamentoIA(resposta.dados));
            } else if (resposta.tipo === 'acao_consulta' && resposta.dados) {
                setConsultaPendente({ ...resposta.dados, criadoPorIA: true });
            } else if (resposta.tipo === 'acao_suporte') {
                setSuportePendente(dadosSuporte);
            }

            carregarChats();
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao se comunicar com a Vitta IA.');
        } finally {
            setCarregando(false);
        }
    };

    const confirmarExame = async () => {
        if (!usuario?.uid || !filhoSelecionado || !examePendente) return;
        setSalvandoAcao(true);
        try {
            await salvarExameNoBanco(
                { ...examePendente, criadoPorIA: true },
                usuario.uid,
                filhoSelecionado
            );
            setExamePendente(null);
            Alert.alert('Sucesso', 'Exame cadastrado com sucesso!');
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao salvar exame.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const confirmarMedicamento = async () => {
        if (!usuario?.uid || !filhoSelecionado || !medicamentoPendente) return;
        setSalvandoAcao(true);
        try {
            await salvarMedicamentoNoBanco(
                { ...medicamentoPendente, criadoPorIA: true },
                usuario.uid,
                filhoSelecionado
            );
            setMedicamentoPendente(null);
            Alert.alert('Sucesso', 'Medicamento cadastrado com sucesso!');
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao salvar medicamento.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    const confirmarConsulta = async () => {
        if (!usuario?.uid || !filhoSelecionado || !consultaPendente) return;
        setSalvandoAcao(true);
        try {
            await salvarConsultaNoBanco(
                { ...consultaPendente, criadoPorIA: true },
                usuario.uid,
                filhoSelecionado
            );
            setConsultaPendente(null);
            Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Falha ao salvar consulta.');
        } finally {
            setSalvandoAcao(false);
        }
    };

    return {
        mensagens,
        inputTexto,
        setInputTexto,
        carregando,
        salvandoAcao,
        historicoChats,
        chatIdAtual,
        modoAtivo,
        setModoAtivo,
        examePendente,
        setExamePendente,
        medicamentoPendente,
        setMedicamentoPendente,
        consultaPendente,
        setConsultaPendente,
        suportePendente,
        setSuportePendente,
        fecharSuporteEResetar,
        enviarMensagem,
        iniciarNovoChat,
        selecionarChat,
        confirmarExame,
        confirmarMedicamento,
        confirmarConsulta,
        renomearChat,
        alternarFixarChat,
    };
}