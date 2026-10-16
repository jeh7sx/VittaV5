import React from 'react';
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	StyleSheet,
	Platform,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Dimensions,
	ViewStyle,
	Image,
} from 'react-native';
import { useRouter } from 'expo-router';

import useVittaIADemo from '../hooks/useVittaIADemo';
import { ReviewExameCard } from './vittaIA/ReviewExameCard';
import { ReviewMedicamentoCard } from './vittaIA/ReviewMedicamentoCard';
import { ReviewConsultaCard } from './vittaIA/ReviewConsultaCard';

import logoVittaIA from '../img/estrelasIa.svg';

interface Props {
	visivel: boolean;
	onFechar: () => void;
}

const SUGESTOES_DEMO = [
	'💡 "O que é neutropenia febril e quando ir ao hospital?"',
	'🧪 "Simule o agendamento de um hemograma para amanhã às 08h"',
	'💊 "Como organizar o remédio Ondansetrona de 8 em 8 horas?"',
];

const screenHeight = Dimensions.get('window').height;

export const VittaIADemoModal: React.FC<Props> = ({ visivel, onFechar }) => {
	const router = useRouter();
	const {
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
	} = useVittaIADemo();

	const handleIrParaCadastro = () => {
		onFechar();
		router.push('/(auth)/cadastro' as any);
	};

	const aplicarSugestao = (texto: string) => {
		const textoLimpo = texto.replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\s"💡🧪💊]+/g, '').replace(/"$/g, '');
		setInputTexto(textoLimpo);
	};

	const podeEnviar = inputTexto.trim().length > 0 && !carregando;
	const temAcaoPendente = !!(examePendente || medicamentoPendente || consultaPendente);

	return (
		<Modal
			visible={visivel}
			animationType="fade"
			transparent={Platform.OS === 'web'}
			onRequestClose={onFechar}
		>
			<View style={styles.overlay}>
				<TouchableWithoutFeedback onPress={onFechar}>
					<View style={styles.backdrop} />
				</TouchableWithoutFeedback>

				<KeyboardAvoidingView
					style={styles.modalCard}
					behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				>
					{/* Header */}
					<View style={styles.topHeader}>
						<View style={styles.headerBrand}>
							<View style={styles.avatarIA}>
								{/* <Text style={{ fontSize: 18 }}>💛</Text> */}

								<Image
									source={logoVittaIA}
									style={{ width: 19, height: 19, tintColor: '#F7B500' }}
								/>
							</View>
							<View style={styles.headerTextos}>
								<View style={styles.badgeRow}>
									<Text style={styles.brandTitulo}>Vitta IA</Text>
									<View style={styles.badgeDemo}>
										<Text style={styles.badgeDemoTexto}>DEMO INTERATIVA</Text>
									</View>
								</View>
								<Text style={styles.brandSub} numberOfLines={1}>
									Experimente gratuitamente as funções do assistente
								</Text>
							</View>
						</View>

						<TouchableOpacity onPress={onFechar} style={styles.botaoFechar} activeOpacity={0.7}>
							<Text style={styles.textoFechar}>✕</Text>
						</TouchableOpacity>
					</View>

					{/* Banner de CTA */}
					<View style={styles.ctaBanner}>
						<View style={styles.ctaTextos}>
							<Text style={styles.ctaTitulo}>Gostou da praticidade?</Text>
							<Text style={styles.ctaDescricao}>
								Crie uma conta para salvar a rotina do seu filho e receber alertas automáticos.
							</Text>
						</View>
						<TouchableOpacity style={styles.ctaBotao} onPress={handleIrParaCadastro} activeOpacity={0.85}>
							<Text style={styles.ctaBotaoTexto}>Criar Conta ➔</Text>
						</TouchableOpacity>
					</View>

					{/* Área do Chat */}
					<ScrollView
						style={styles.chatScroll}
						contentContainerStyle={[
							styles.chatConteudo,
							mensagens.length <= 1 && styles.chatVazio,
						]}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={true}
					>
						{mensagens.map((msg, index) => {
							const ehUsuario = msg.autor === 'usuario';

							return (
								<View
									key={index}
									style={[
										styles.mensagemLinha,
										ehUsuario ? styles.mensagemLinhaUsuario : styles.mensagemLinhaIA,
									]}
								>
									<View
										style={[
											styles.mensagemWrapper,
											ehUsuario && styles.mensagemWrapperUsuario,
										]}
									>
										{!ehUsuario && (
											<View style={styles.avatarMiniIA}>
												<Image
													source={logoVittaIA}
													style={{ width: 19, height: 19, tintColor: '#F7B500' }}
												/>
											</View>
										)}

										<View style={[styles.bolhaBase, ehUsuario ? styles.bolhaUsuario : styles.bolhaIA]}>
											<Text
												style={[
													styles.textoMensagem,
													ehUsuario ? styles.textoUsuario : styles.textoIA,
												]}
											>
												{msg.texto}
											</Text>
										</View>
									</View>
								</View>
							);
						})}

						{/* Sugestões Iniciais */}
						{mensagens.length <= 1 && !temAcaoPendente && (
							<View style={styles.sugestoesBox}>
								<Text style={styles.sugestoesTitulo}>Experimente perguntar:</Text>
								{SUGESTOES_DEMO.map((sugestao, idx) => (
									<TouchableOpacity
										key={idx}
										style={styles.sugestaoChip}
										onPress={() => aplicarSugestao(sugestao)}
										activeOpacity={0.7}
									>
										<Text style={styles.sugestaoTexto}>{sugestao}</Text>
										<Text style={styles.sugestaoSeta}>➜</Text>
									</TouchableOpacity>
								))}
							</View>
						)}

						{/* Carregando */}
						{carregando && (
							<View style={styles.carregandoContainer}>
								<ActivityIndicator size="small" color="#F7B500" />
								<Text style={styles.carregandoTexto}>Vitta IA está digitando...</Text>
							</View>
						)}

						{/* Cards de Demonstração */}
						{examePendente && (
							<ReviewExameCard
								dados={examePendente}
								onChange={(campo, valor) =>
									setExamePendente((prev) => (prev ? { ...prev, [campo]: valor } : prev))
								}
								onSalvar={handleIrParaCadastro}
								onCancelar={() => setExamePendente(null)}
								salvando={false}
							/>
						)}

						{medicamentoPendente && (
							<ReviewMedicamentoCard
								dados={medicamentoPendente}
								onChange={(campo, valor) =>
									setMedicamentoPendente((prev) => (prev ? { ...prev, [campo]: valor } : prev))
								}
								onSalvar={handleIrParaCadastro}
								onCancelar={() => setMedicamentoPendente(null)}
								salvando={false}
							/>
						)}

						{consultaPendente && (
							<ReviewConsultaCard
								dados={consultaPendente}
								onChange={(campo, valor) =>
									setConsultaPendente((prev) => (prev ? { ...prev, [campo]: valor } : prev))
								}
								onSalvar={handleIrParaCadastro}
								onCancelar={() => setConsultaPendente(null)}
								salvando={false}
							/>
						)}
					</ScrollView>

					{/* Barra de Entrada */}
					<View style={styles.inputWrapper}>
						<View style={styles.inputBar}>
							<TextInput
								placeholder="Pergunte sobre medicamentos, exames ou rotina..."
								placeholderTextColor="#9E9EAC"
								value={inputTexto}
								onChangeText={setInputTexto}
								style={styles.input}
								editable={!carregando}
								onSubmitEditing={enviarMensagem}
							/>

							<TouchableOpacity
								style={[styles.sendButton, !podeEnviar && styles.sendButtonDisabled]}
								onPress={enviarMensagem}
								disabled={!podeEnviar}
								activeOpacity={0.8}
							>
								<Text style={[styles.sendText, !podeEnviar && { color: '#B0B0C0' }]}>
									{carregando ? '...' : '➜'}
								</Text>
							</TouchableOpacity>
						</View>

						<Text style={styles.avisoIA}>
							Modo de teste. As orientações são educativas e não substituem uma consulta médica.
						</Text>
					</View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.65)' : '#FAFAFC',
		justifyContent: 'center',
		alignItems: 'center',
		padding: Platform.OS === 'web' ? 24 : 0,
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},
	modalCard: {
		width: '100%',
		maxWidth: 780,
		height: Platform.OS === 'web' ? Math.round(screenHeight * 0.88) : '100%',
		maxHeight: 880,
		backgroundColor: '#FAFAFC',
		borderRadius: Platform.OS === 'web' ? 24 : 0,
		overflow: 'hidden',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.25,
		shadowRadius: 28,
		elevation: 12,
		flexDirection: 'column',
	} as ViewStyle,

	// --- Header ---
	topHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 14,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#EDEDF2',
		zIndex: 10,
	},
	headerBrand: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
	},
	avatarIA: {
		width: 38,
		height: 38,
		borderRadius: 12,
		backgroundColor: '#FFF4D6',
		borderWidth: 1,
		borderColor: '#F7B500',
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTextos: {
		flex: 1,
	},
	badgeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	brandTitulo: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1A1A1E',
	},
	badgeDemo: {
		backgroundColor: '#FEF3C7',
		paddingHorizontal: 7,
		paddingVertical: 2,
		borderRadius: 6,
	},
	badgeDemoTexto: {
		fontSize: 10,
		fontWeight: '800',
		color: '#B45309',
		letterSpacing: 0.5,
	},
	brandSub: {
		fontSize: 12,
		color: '#6B6B7B',
		marginTop: 2,
	},
	botaoFechar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#F4F4F8',
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
	},
	textoFechar: {
		fontSize: 14,
		color: '#6B6B7B',
		fontWeight: '700',
	},

	// --- Banner CTA ---
	ctaBanner: {
		backgroundColor: '#1E1E24',
		paddingHorizontal: 18,
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	ctaTextos: {
		flex: 1,
	},
	ctaTitulo: {
		color: '#FFFFFF',
		fontSize: 12.5,
		fontWeight: '700',
		marginBottom: 2,
	},
	ctaDescricao: {
		color: '#B4B4C0',
		fontSize: 11,
		lineHeight: 15,
	},
	ctaBotao: {
		backgroundColor: '#F7B500',
		paddingVertical: 7,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	ctaBotaoTexto: {
		color: '#1A1A1E',
		fontWeight: '700',
		fontSize: 12,
	},

	// --- Chat ---
	chatScroll: {
		flex: 1,
		width: '100%',
	},
	chatConteudo: {
		paddingHorizontal: 18,
		paddingVertical: 16,
	},
	chatVazio: {
		flexGrow: 1,
	},

	// --- Mensagens ---
	mensagemLinha: {
		width: '100%',
		marginBottom: 14,
	},
	mensagemLinhaIA: {
		alignItems: 'flex-start',
	},
	mensagemLinhaUsuario: {
		alignItems: 'flex-end',
	},
	mensagemWrapper: {
		maxWidth: '85%',
		flexDirection: 'row',
		gap: 8,
		alignItems: 'flex-start',
	},
	mensagemWrapperUsuario: {
		justifyContent: 'flex-end',
	},
	avatarMiniIA: {
		width: 24,
		height: 24,
		borderRadius: 8,
		backgroundColor: '#FFF4D6',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 2,
		flexShrink: 0,
	},
	bolhaBase: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 18,
		flexShrink: 1,
	},
	bolhaIA: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 4,
		borderWidth: 1,
		borderColor: '#EBEBF2',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.03,
		shadowRadius: 4,
		elevation: 1,
	},
	bolhaUsuario: {
		backgroundColor: '#1E1E24',
		borderTopRightRadius: 4,
	},
	textoMensagem: {
		fontSize: 14,
		lineHeight: 21,
		flexWrap: 'wrap',
	},
	textoIA: {
		color: '#272730',
	},
	textoUsuario: {
		color: '#FFFFFF',
	},

	// --- Sugestões ---
	sugestoesBox: {
		marginTop: 14,
		marginBottom: 8,
		gap: 8,
	},
	sugestoesTitulo: {
		fontSize: 11.5,
		fontWeight: '700',
		color: '#6B6B7B',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	sugestaoChip: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E8E8F0',
		paddingVertical: 9,
		paddingHorizontal: 13,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	sugestaoTexto: {
		fontSize: 12.5,
		color: '#3B3B48',
		fontWeight: '500',
		flex: 1,
	},
	sugestaoSeta: {
		color: '#F7B500',
		fontSize: 12,
		fontWeight: '700',
	},

	// --- Carregando ---
	carregandoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		backgroundColor: '#FFFFFF',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#EBEBF2',
		gap: 8,
		marginVertical: 4,
	},
	carregandoTexto: {
		fontSize: 12,
		color: '#6B6B7B',
		fontWeight: '500',
	},

	// --- Input ---
	inputWrapper: {
		paddingHorizontal: 16,
		paddingBottom: 14,
		paddingTop: 8,
		backgroundColor: '#FAFAFC',
		borderTopWidth: 1,
		borderTopColor: '#EDEDF2',
	},
	inputBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 24,
		borderWidth: 1,
		borderColor: '#E2E2EA',
		paddingLeft: 14,
		paddingRight: 5,
		paddingVertical: 4,
		minHeight: 46,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.04,
		shadowRadius: 6,
		elevation: 2,
	},
	input: {
		flex: 1,
		fontSize: 13.5,
		color: '#1A1A1E',
		paddingVertical: 6,
		...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
	},
	sendButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#F7B500',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 6,
	},
	sendButtonDisabled: {
		backgroundColor: '#EAEAEE',
	},
	sendText: {
		color: '#1A1A1E',
		fontSize: 15,
		fontWeight: '700',
	},
	avisoIA: {
		marginTop: 6,
		fontSize: 10.5,
		color: '#9E9EAC',
		textAlign: 'center',
	},
});