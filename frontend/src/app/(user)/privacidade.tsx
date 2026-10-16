import React from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';

export default function PrivacidadeUserScreen() {
	const router = useRouter();
	const { theme, isDark } = useTheme();

	return (
		<View style={[styles.container, { backgroundColor: theme.bg }]}>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => router.back()}
						style={[
							styles.botaoVoltar,
							{ backgroundColor: theme.cardBg, borderColor: theme.border },
						]}
					>
						<Text style={[styles.textoVoltar, { color: theme.textPrimary }]}>← Voltar</Text>
					</TouchableOpacity>

					<View
						style={[
							styles.tagHeader,
							{ backgroundColor: isDark ? '#143322' : '#DCFCE7' },
						]}
					>
						<Text style={[styles.tagTexto, { color: isDark ? '#86EFAC' : '#166534' }]}>
							Privacidade & LGPD
						</Text>
					</View>
					<Text style={[tipografia.h2, { color: theme.textPrimary, marginBottom: 8 }]}>
						Política de Privacidade
					</Text>
					<Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
						Como tratamos, protegemos e armazenamos com rigor ético os dados de saúde da sua família.
					</Text>
				</View>

				{/* Conteúdo */}
				<View
					style={[
						styles.conteudoBox,
						{ backgroundColor: theme.cardBg, borderColor: theme.border },
					]}
				>
					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							1. Compromisso com a Proteção de Dados
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							O Vitta tem como prioridade máxima o sigilo, a segurança e a conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), em especial no que tange a dados sensíveis de saúde de crianças e adolescentes.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							2. Dados Coletados
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Coletamos apenas as informações estritamente necessárias para o funcionamento do app:
						</Text>
						<Text style={[styles.itemLista, { color: theme.textSecondary }]}>
							• <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Dados do Responsável:</Text> Nome, e-mail e identificador de autenticação.
						</Text>
						<Text style={[styles.itemLista, { color: theme.textSecondary }]}>
							• <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Dados do Paciente:</Text> Nome/apelido do filho e histórico de exames, medicamentos, receitas e consultas cadastrados por você.
						</Text>
						<Text style={[styles.itemLista, { color: theme.textSecondary }]}>
							• <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Conversas com a IA:</Text> Mensagens enviadas temporariamente para processamento de agendamentos e esclarecimento de dúvidas.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							3. Política de Retenção e Expiração (3 Dias)
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Para minimizar o armazenamento desnecessário de dados, as conversas interativas com a Vitta IA permanecem ativas por um ciclo de 3 dias de inatividade, sendo descartadas automaticamente caso não haja novas mensagens no chat.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							4. Não Comercialização de Informações
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Os dados de saúde cadastrados no Vitta <Text style={{ fontWeight: '700', color: theme.textPrimary }}>NUNCA</Text> são vendidos, alugados ou compartilhados com corretoras de seguro, laboratórios farmacêuticos ou empresas de publicidade.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							5. Direitos do Titular (Exclusão e Portabilidade)
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Você tem o direito de solicitar a qualquer momento a exclusão completa da sua conta e de todos os registros de exames e dependentes associados diretamente pelas Configurações ou pelo e-mail: <Text style={{ fontWeight: '700', color: theme.yellow6 }}>vittaetec@gmail.com</Text>.
						</Text>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: Platform.OS === 'web' ? 32 : 18,
		paddingTop: Platform.OS === 'web' ? 36 : 20,
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
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 12,
		borderWidth: 1,
	},
	textoVoltar: {
		fontSize: 13,
		fontWeight: '600',
	},
	tagHeader: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		marginBottom: 10,
	},
	tagTexto: {
		fontSize: 11,
		fontWeight: '700',
		textTransform: 'uppercase',
	},
	conteudoBox: {
		padding: 24,
		borderRadius: 24,
		borderWidth: 1,
		gap: 20,
	},
	secao: {
		gap: 8,
	},
	secaoTitulo: {
		fontSize: 16,
		fontWeight: '700',
	},
	secaoTexto: {
		fontSize: 14,
		lineHeight: 22,
	},
	itemLista: {
		fontSize: 13.5,
		lineHeight: 20,
		marginLeft: 6,
	},
});