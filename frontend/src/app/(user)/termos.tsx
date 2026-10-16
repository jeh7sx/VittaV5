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

export default function TermosUserScreen() {
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
							{ backgroundColor: isDark ? '#1E254A' : '#E0E7FF' },
						]}
					>
						<Text style={[styles.tagTexto, { color: isDark ? '#93C5FD' : '#3730A3' }]}>
							Documento Legal
						</Text>
					</View>
					<Text style={[tipografia.h2, { color: theme.textPrimary, marginBottom: 8 }]}>
						Termos de Uso
					</Text>
					<Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
						Última atualização: Outubro de 2026. Conheça as condições de uso da plataforma e dos serviços Vitta.
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
							1. Aceitação dos Termos
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Ao criar uma conta ou utilizar o aplicativo Vitta (incluindo o assistente Vitta IA e recursos associados), você declara ter lido, compreendido e concordado expressamente com estes Termos de Uso e com nossa Política de Privacidade.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							2. Finalidade da Plataforma e Ausência de Ato Médico
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							O Vitta é uma ferramenta de gestão de rotina, organização e apoio educativo destinada a pais e responsáveis por crianças e adolescentes em tratamento oncológico.
						</Text>
						<View
							style={[
								styles.avisoImportante,
								{
									backgroundColor: isDark ? '#3B1215' : '#FEF2F2',
									borderLeftColor: isDark ? '#F87171' : '#EF4444',
								},
							]}
						>
							<Text style={[styles.avisoTitulo, { color: isDark ? '#FCA5A5' : '#991B1B' }]}>
								⚠️ AVISO MÉDICO CRUCIAL:
							</Text>
							<Text style={[styles.avisoTexto, { color: isDark ? '#FECACA' : '#7F1D1D' }]}>
								O Vitta e a assistente Vitta IA NÃO realizam diagnósticos, NÃO prescrevem medicamentos e NÃO substituem a avaliação clínica, médica ou de enfermagem. Nunca altere dosagens, medicamentos ou protocolos sem expressa autorização do médico oncologista responsável. Em caso de febre ou emergência, procure o pronto-atendimento hospitalar imediatamente.
							</Text>
						</View>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							3. Cadastro e Responsabilidade pelo Acesso
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							O usuário é o único responsável por manter a confidencialidade de seus dados de login e pelas informações dos dependentes cadastradas no sistema. O compartilhamento de acesso com outros cuidadores deve ser realizado com consentimento consciente.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							4. Funcionamento da Vitta IA
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							A Vitta IA utiliza inteligência artificial generativa para auxiliar na organização de exames e esclarecimento de termos técnicos. Embora seja treinada com diretrizes rigorosas e guardrails de segurança, o usuário reconhece que modelos de IA podem gerar imprecisões e deve sempre revisar os dados antes de confirmar agendamentos.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							5. Modificações dos Termos
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Reservamo-nos o direito de atualizar estes termos a qualquer momento para refletir melhorias no sistema ou exigências legais. Alterações substanciais serão comunicadas diretamente no aplicativo.
						</Text>
					</View>

					<View style={styles.secao}>
						<Text style={[styles.secaoTitulo, { color: theme.textPrimary }]}>
							6. Contato Legal
						</Text>
						<Text style={[styles.secaoTexto, { color: theme.textSecondary }]}>
							Para dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail oficial: <Text style={{ fontWeight: '700', color: theme.yellow6 }}>vittaetec@gmail.com</Text>.
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
	avisoImportante: {
		borderLeftWidth: 4,
		padding: 14,
		borderRadius: 10,
		marginTop: 8,
		gap: 4,
	},
	avisoTitulo: {
		fontSize: 13,
		fontWeight: '800',
	},
	avisoTexto: {
		fontSize: 12.5,
		lineHeight: 18,
	},
});