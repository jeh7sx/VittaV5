import { useState, useEffect, useMemo, useCallback } from 'react';
import {
	collection,
	query,
	limit,
	onSnapshot,
	orderBy,
	updateDoc,
	doc,
	writeBatch,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export type TipoNotificacaoAdmin = 'usuario' | 'filho' | 'perfil' | 'alerta';

export interface AdminNotificacaoItem {
	id: string;
	titulo: string;
	descricao: string;
	horario: string;
	lida: boolean;
	tipo: TipoNotificacaoAdmin;
	timestampOriginal?: number;
}

function formatarTempoDecorrido(timestamp: any): string {
	if (!timestamp) return 'Recentemente';

	let dataObj: Date | null = null;
	if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
		dataObj = timestamp.toDate();
	} else if (timestamp?.seconds) {
		dataObj = new Date(timestamp.seconds * 1000);
	} else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
		const d = new Date(timestamp);
		if (!isNaN(d.getTime())) dataObj = d;
	}

	if (!dataObj) return 'Recentemente';

	const agora = new Date();
	const diffSegundos = Math.floor((agora.getTime() - dataObj.getTime()) / 1000);

	if (diffSegundos < 60) return 'Agora mesmo';
	const diffMinutos = Math.floor(diffSegundos / 60);
	if (diffMinutos < 60) return `Há ${diffMinutos} min`;
	const diffHoras = Math.floor(diffMinutos / 60);
	if (diffHoras < 24) return `Há ${diffHoras}h`;
	const diffDias = Math.floor(diffHoras / 24);
	return `Há ${diffDias}d`;
}

export function useAdminNotificacoesController() {
	const [notificacoes, setNotificacoes] = useState<AdminNotificacaoItem[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [filtroAba, setFiltroAba] = useState<'todas' | 'nao_lidas'>('todas');
	const [modalAberto, setModalAberto] = useState(false);

	// Escuta em tempo real eventos administrativos na coleção de notificações ou logs do sistema
	useEffect(() => {
		const q = query(collection(db, 'notificacoes_admin'), limit(50));

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const lista: AdminNotificacaoItem[] = snapshot.docs.map((d) => {
					const data = d.data();
					const tipoTexto = String(data.tipo || '').toLowerCase();

					let tipoFormatado: TipoNotificacaoAdmin = 'alerta';
					if (tipoTexto.includes('usuario') || tipoTexto.includes('user')) {
						tipoFormatado = 'usuario';
					} else if (tipoTexto.includes('filho') || tipoTexto.includes('crianca')) {
						tipoFormatado = 'filho';
					} else if (tipoTexto.includes('perfil')) {
						tipoFormatado = 'perfil';
					}

					const ts = data.criadoEm?.seconds
						? data.criadoEm.seconds * 1000
						: Date.now();

					return {
						id: d.id,
						titulo: data.titulo || 'Atividade Administrativa',
						descricao: data.descricao || data.mensagem || 'Sem detalhes fornecidos.',
						horario: formatarTempoDecorrido(data.criadoEm),
						lida: !!data.lida,
						tipo: tipoFormatado,
						timestampOriginal: ts,
					};
				});

				// Ordena no front-end para não depender de índices complexos do Firestore
				lista.sort((a, b) => (b.timestampOriginal || 0) - (a.timestampOriginal || 0));

				setNotificacoes(lista);
				setCarregando(false);
			},
			(error) => {
				console.error('Erro ao escutar notificações de admin:', error);
				setCarregando(false);
			}
		);

		return () => unsubscribe();
	}, []);
	const naoLidas = useMemo(() => {
		return notificacoes.filter((n) => !n.lida).length;
	}, [notificacoes]);

	const notificacoesExibidas = useMemo(() => {
		if (filtroAba === 'nao_lidas') {
			return notificacoes.filter((n) => !n.lida);
		}
		return notificacoes;
	}, [notificacoes, filtroAba]);

	const marcarComoLida = useCallback(async (id: string) => {
		try {
			setNotificacoes((prev) =>
				prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
			);
			await updateDoc(doc(db, 'notificacoes_admin', id), { lida: true });
		} catch (e) {
			console.error('Erro ao marcar notificação como lida:', e);
		}
	}, []);

	const marcarTodasComoLidas = useCallback(async () => {
		const pendentes = notificacoes.filter((n) => !n.lida);
		if (pendentes.length === 0) return;

		try {
			setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));

			const batch = writeBatch(db);
			pendentes.forEach((n) => {
				batch.update(doc(db, 'notificacoes_admin', n.id), { lida: true });
			});
			await batch.commit();
		} catch (e) {
			console.error('Erro ao marcar todas como lidas:', e);
		}
	}, [notificacoes]);

	return {
		notificacoes: notificacoesExibidas,
		totalNotificacoes: notificacoes.length,
		naoLidas,
		carregando,
		modalAberto,
		setModalAberto,
		filtroAba,
		setFiltroAba,
		marcarComoLida,
		marcarTodasComoLidas,
	};
}