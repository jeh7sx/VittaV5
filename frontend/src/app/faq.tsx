import React, { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Platform,
	TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';

interface ItemFAQ {
	id: string;
	categoria: 'geral' | 'ia' | 'seguranca' | 'rotina';
	pergunta: string;
	resposta: string;
}

const FAQ_DATA: ItemFAQ[] = [
	{
		id: '1',
		categoria: 'ia',
		pergunta: 'A Vitta IA dá diagnósticos médicos ou substitui o médico?',
		resposta:
			'Não. A Vitta IA é estritamente uma assistente de apoio organizacional e educativo. Ela ajuda a explicar termos médicos difíceis e a cadastrar exames, consultas e medicamentos na rotina do seu filho, mas nunca altera tratamentos, não prescreve remédios e não faz diagnósticos.',
	},
	{
		id: '2',
		categoria: 'rotina',
		pergunta: 'Como funciona o agendamento automático de exames e remédios pelo chat?',
		resposta:
			'Basta digitar ou enviar uma mensagem de áudio falando sobre o exame ou receita (exemplo: "Marcar tomografia amanhã às 14h"). A IA identifica os horários, o hospital e o médico, gerando um card de confirmação para você salvar com um clique.',
	},
	{
		id: '3',
		categoria: 'seguranca',
		pergunta: 'Os dados de saúde do meu filho estão seguros e em sigilo?',
		resposta:
			'Sim. O aplicativo Vitta segue todas as diretrizes da LGPD (Lei Geral de Proteção de Dados). As informações são criptografadas, ficam restritas à sua conta e aos cuidadores autorizados por você, e nunca são comercializadas para terceiros.',
	},
	{
		id: '4',
		categoria: 'geral',
		pergunta: 'Posso cadastrar mais de um filho no mesmo aplicativo?',
		resposta:
			'Com certeza. Você pode alternar entre perfis de diferentes dependentes na barra superior. Cada filho terá seu próprio histórico de consultas, medicações, relatórios e exames separados.',
	},
	{
		id: '5',
		categoria: 'rotina',
		pergunta: 'Outros familiares ou cuidadores podem acessar a conta?',
		resposta:
			'Sim! Você pode compartilhar o acompanhamento com avós, parceiros ou babás para que todos saibam exatamente os horários dos remédios e os próximos exames sem falhas de comunicação.',
	},
	{
		id: '6',
		categoria: 'ia',
		pergunta: 'Por quanto tempo as conversas do histórico da IA ficam salvas?',
		resposta:
			'Para proteger sua privacidade e manter o sistema leve, as conversas ficam guardadas por 3 dias a partir da última interação. Sempre que você envia uma nova mensagem no chat, esse prazo é reiniciado automaticamente.',
	},
	{
		id: '7',
		categoria: 'geral',
		pergunta: 'O aplicativo Vitta é gratuito?',
		resposta:
			'Sim! O aplicativo Vitta é uma plataforma pensada para apoiar famílias no momento em que mais precisam de organização e acolhimento.',
	},
];

export default function FaqScreen() {
	const router = useRouter();
	const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
	const [termoBusca, setTermoBusca] = useState<string>('');
	const [itemAberto, setItemAberto] = useState<string | null>(null);

	const toggleItem = (id: string) => {
		setItemAberto(itemAberto === id ? null : id);
	};

	const itensFiltrados = FAQ_DATA.filter((item) => {
		const bateCategoria = categoriaFiltro === 'todos' || item.categoria === categoriaFiltro;
		const bateBusca =
			item.pergunta.toLowerCase().includes(termoBusca.toLowerCase()) ||
			item.resposta.toLowerCase().includes(termoBusca.toLowerCase());
		return bateCategoria && bateBusca;
	});

	return (
		<View style={styles.container}>
			<PublicNavbar />
			<ScrollView>
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
							<Text style={styles.textoVoltar}>← Voltar</Text>
						</TouchableOpacity>
						<View style={styles.tagHeader}>
							<Text style={styles.tagTexto}>Tire suas dúvidas</Text>
						</View>
						<Text style={styles.titulo}>Perguntas Frequentes (FAQ)</Text>
						<Text style={styles.subtitulo}>
							Tudo o que você precisa saber sobre o aplicativo Vitta, a assistente IA e a gestão de rotina.
						</Text>
					</View>

					{/* Input de Busca */}
					<View style={styles.buscaContainer}>
						<TextInput
							placeholder="Pesquise por sua dúvida..."
							placeholderTextColor="#9E9EAC"
							value={termoBusca}
							onChangeText={setTermoBusca}
							style={styles.buscaInput}
						/>
						{termoBusca.length > 0 && (
							<TouchableOpacity onPress={() => setTermoBusca('')}>
								<Text style={{ color: '#888', fontWeight: 'bold' }}>✕</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Filtro por Categorias */}
					<View style={styles.filtrosRow}>
						{[
							{ id: 'todos', label: 'Todas' },
							{ id: 'ia', label: '💛 Vitta IA' },
							{ id: 'rotina', label: '📅 Rotina & Exames' },
							{ id: 'seguranca', label: '🔒 Segurança & LGPD' },
							{ id: 'geral', label: '📱 Geral' },
						].map((cat) => (
							<TouchableOpacity
								key={cat.id}
								style={[
									styles.filtroBtn,
									categoriaFiltro === cat.id && styles.filtroBtnAtivo,
								]}
								onPress={() => setCategoriaFiltro(cat.id)}
							>
								<Text
									style={[
										styles.filtroTexto,
										categoriaFiltro === cat.id && styles.filtroTextoAtivo,
									]}
								>
									{cat.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{/* Acordeão de Perguntas */}
					<View style={styles.faqList}>
						{itensFiltrados.length === 0 ? (
							<View style={styles.vazioBox}>
								<Text style={styles.vazioEmoji}>❓</Text>
								<Text style={styles.vazioTexto}>Nenhuma pergunta encontrada com este termo.</Text>
							</View>
						) : (
							itensFiltrados.map((faq) => {
								const estaAberto = itemAberto === faq.id;
								return (
									<View key={faq.id} style={[styles.faqCard, estaAberto && styles.faqCardAberto]}>
										<TouchableOpacity
											style={styles.perguntaBtn}
											onPress={() => toggleItem(faq.id)}
											activeOpacity={0.7}
										>
											<Text style={[styles.perguntaTexto, estaAberto && styles.perguntaTextoAtivo]}>
												{faq.pergunta}
											</Text>
											<Text style={styles.setaIndicador}>{estaAberto ? '▲' : '▼'}</Text>
										</TouchableOpacity>

										{estaAberto && (
											<View style={styles.respostaBox}>
												<Text style={styles.respostaTexto}>{faq.resposta}</Text>
											</View>
										)}
									</View>
								);
							})
						)}
					</View>

					{/* Contato com Suporte */}
					<View style={styles.suporteCard}>
						<Text style={styles.suporteTitulo}>Não encontrou o que procurava?</Text>
						<Text style={styles.suporteDesc}>
							Nossa equipe de suporte e a comunidade Vitta estão prontas para ajudar você e sua família.
						</Text>
						<TouchableOpacity style={styles.suporteBtn}>
							<Text style={styles.suporteBtnTexto}>Falar com o Suporte</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
				<PublicFooter />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FAFAFC',
	},
	scrollContent: {
		paddingHorizontal: Platform.OS === 'web' ? 32 : 18,
		paddingTop: Platform.OS === 'web' ? 40 : 20,
		paddingBottom: 40,
		maxWidth: 860,
		width: '100%',
		alignSelf: 'center',
	},
	header: {
		marginBottom: 24,
	},
	botaoVoltar: {
		alignSelf: 'flex-start',
		marginBottom: 16,
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 8,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E2EA',
	},
	textoVoltar: {
		fontSize: 13,
		fontWeight: '600',
		color: '#4B4B58',
	},
	tagHeader: {
		alignSelf: 'flex-start',
		backgroundColor: '#FEF3C7',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		marginBottom: 8,
	},
	tagTexto: {
		fontSize: 11,
		fontWeight: '700',
		color: '#B45309',
		textTransform: 'uppercase',
	},
	titulo: {
		fontSize: 28,
		fontWeight: '800',
		color: '#1A1A1E',
		letterSpacing: -0.5,
		marginBottom: 8,
	},
	subtitulo: {
		fontSize: 14,
		color: '#6B6B7B',
		lineHeight: 22,
	},
	buscaContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: '#E2E2EA',
		marginBottom: 16,
	},
	buscaInput: {
		flex: 1,
		fontSize: 14,
		color: '#1A1A1E',
		...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
	},
	filtrosRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 20,
	},
	filtroBtn: {
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 10,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E2E2EA',
	},
	filtroBtnAtivo: {
		backgroundColor: '#1E1E24',
		borderColor: '#1E1E24',
	},
	filtroTexto: {
		fontSize: 12.5,
		fontWeight: '600',
		color: '#4B4B58',
	},
	filtroTextoAtivo: {
		color: '#FFFFFF',
	},
	faqList: {
		gap: 10,
	},
	faqCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#EBEBF2',
		overflow: 'hidden',
	},
	faqCardAberto: {
		borderColor: '#F7B500',
		borderWidth: 1.5,
	},
	perguntaBtn: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 18,
		gap: 12,
	},
	perguntaTexto: {
		fontSize: 15,
		fontWeight: '700',
		color: '#1A1A1E',
		flex: 1,
		lineHeight: 21,
	},
	perguntaTextoAtivo: {
		color: '#92400E',
	},
	setaIndicador: {
		fontSize: 12,
		color: '#8E8E9E',
	},
	respostaBox: {
		paddingHorizontal: 18,
		paddingBottom: 18,
		paddingTop: 0,
	},
	respostaTexto: {
		fontSize: 13.5,
		color: '#4B4B58',
		lineHeight: 22,
	},
	vazioBox: {
		alignItems: 'center',
		paddingVertical: 36,
	},
	vazioEmoji: {
		fontSize: 28,
		marginBottom: 6,
	},
	vazioTexto: {
		color: '#8E8E9E',
		fontSize: 13.5,
	},
	suporteCard: {
		marginTop: 32,
		backgroundColor: '#FFFBEB',
		padding: 22,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: '#FDE68A',
		alignItems: 'center',
		textAlign: 'center',
	},
	suporteTitulo: {
		fontSize: 16,
		fontWeight: '700',
		color: '#92400E',
		marginBottom: 6,
	},
	suporteDesc: {
		fontSize: 13,
		color: '#78350F',
		textAlign: 'center',
		lineHeight: 19,
		marginBottom: 14,
	},
	suporteBtn: {
		backgroundColor: '#F7B500',
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: 10,
	},
	suporteBtnTexto: {
		color: '#1A1A1E',
		fontWeight: '700',
		fontSize: 13,
	},
});