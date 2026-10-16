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
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';

export default function TermosScreen() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<PublicNavbar />
			<ScrollView>
				<View style={{ height: Platform.OS === 'web' ? 40 : 20 }} />
				<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
							<Text style={styles.textoVoltar}>← Voltar</Text>
						</TouchableOpacity>

						<View style={styles.tagHeader}>
							<Text style={styles.tagTexto}>Documento Legal</Text>
						</View>
						<Text style={styles.titulo}>Termos de Uso</Text>
						<Text style={styles.subtitulo}>
							Última atualização: Agosto de 2026. Conheça as condições de uso da plataforma e dos serviços Vitta.
						</Text>
					</View>

					{/* Conteúdo dos Termos */}
					<View style={styles.conteudoBox}>
						<View style={styles.secao}>
							<Text style={styles.secaoTitulo}>1. Aceitação dos Termos</Text>
							<Text style={styles.secaoTexto}>
								Ao criar uma conta ou utilizar o aplicativo Vitta (incluindo o assistente Vitta IA e recursos associados), você declara ter lido, compreendido e concordado expressamente com estes Termos de Uso e com nossa Política de Privacidade.
							</Text>
						</View>

						<View style={styles.secao}>
							<Text style={styles.secaoTitulo}>2. Finalidade da Plataforma e Ausência de Ato Médico</Text>
							<Text style={styles.secaoTexto}>
								O Vitta é uma ferramenta de gestão de rotina, organização e apoio educativo destinada a pais e responsáveis por crianças e adolescentes em tratamento oncológico.
							</Text>
							<View style={styles.avisoImportante}>
								<Text style={styles.avisoTitulo}>⚠️ AVISO MÉDICO CRUCIAL:</Text>
								<Text style={styles.avisoTexto}>
									O Vitta e a assistente Vitta IA NÃO realizam diagnósticos, NÃO prescrevem medicamentos e NÃO substituem a avaliação clínica, médica ou de enfermagem. Nunca altere dosagens, medicamentos ou protocolos sem expressa autorização do médico oncologista responsável. Em caso de febre ou emergência, procure o pronto-atendimento hospitalar imediatamente.
								</Text>
							</View>
						</View>

						<View style={styles.secao}>
							<Text style={styles.secaoTitulo}>3. Cadastro e Responsabilidade pelo Acesso</Text>
							<Text style={styles.secaoTexto}>
								O usuário é o único responsável por manter a confidencialidade de seus dados de login e pelas informações dos dependentes cadastradas no sistema (como receitas, nomes de exames e datas). O compartilhamento de acesso com outros cuidadores deve ser realizado com consentimento consciente.
							</Text>
						</View>

						<View style={styles.secao}>
							<Text style={styles.secaoTitulo}>4. Funcionamento da Vitta IA</Text>
							<Text style={styles.secaoTexto}>
								A Vitta IA utiliza inteligência artificial generativa para auxiliar na organização de exames e esclarecimento de termos técnicos. Embora seja treinada com diretrizes rigorosas e guardrails de segurança, o usuário reconhece que modelos de IA podem gerar imprecisões e deve sempre revisar os dados antes de confirmar agendamentos.
							</Text>
						</View>

						<View style={styles.secao}>
							<Text style={styles.secaoTitulo}>5. Modificações dos Termos</Text>
							<Text style={styles.secaoTexto}>
								Reservamo-nos o direito de atualizar estes termos a qualquer momento para refletir melhorias no sistema ou exigências legais. Alterações substanciais serão comunicadas diretamente no aplicativo.
							</Text>
						</View>

						<View style={styles.secao}>
							<Text style={styles.secaoTitulo}>6. Contato Legal</Text>
							<Text style={styles.secaoTexto}>
								Para dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail oficial: <Text style={{ fontWeight: '700', color: '#1A1A1E' }}>vittaetec@gmail.com</Text>.
							</Text>
						</View>
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
		maxWidth: 820,
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
		backgroundColor: '#E0E7FF',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		marginBottom: 8,
	},
	tagTexto: {
		fontSize: 11,
		fontWeight: '700',
		color: '#3730A3',
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
	conteudoBox: {
		backgroundColor: '#FFFFFF',
		padding: 24,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#EBEBF2',
		gap: 20,
	},
	secao: {
		gap: 8,
	},
	secaoTitulo: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1A1A1E',
	},
	secaoTexto: {
		fontSize: 14,
		color: '#4B4B58',
		lineHeight: 22,
	},
	avisoImportante: {
		backgroundColor: '#FEF2F2',
		borderLeftWidth: 4,
		borderLeftColor: '#EF4444',
		padding: 14,
		borderRadius: 10,
		marginTop: 8,
		gap: 4,
	},
	avisoTitulo: {
		fontSize: 13,
		fontWeight: '800',
		color: '#991B1B',
	},
	avisoTexto: {
		fontSize: 12.5,
		color: '#7F1D1D',
		lineHeight: 18,
	},
});