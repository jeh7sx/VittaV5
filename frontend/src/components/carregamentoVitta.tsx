import React, { useEffect, useRef } from 'react';
import {
	View,
	Text,
	Animated,
	StyleSheet,
	useWindowDimensions,
} from 'react-native';
import { colors } from '@/styles/colors';
import { tipografia } from '@/styles/tipografia';

interface LoadingGlobalProps {
	/**
	 * Título principal do carregamento. Opcional (padrão: "Carregando...")
	 */
	titulo?: string;
	/**
	 * Subtítulo informativo. Opcional (padrão: "Aguarde um momento")
	 */
	subtitulo?: string;
	/**
	 * Se true, ocupa a tela inteira com position absolute cobrindo o ecrã.
	 * Se false (padrão), preenche flex: 1 na view pai onde for inserido.
	 */
	overlay?: boolean;
}

export default function LoadingGlobal({
	titulo = 'Carregando...',
	subtitulo = 'Aguarde um instante enquanto preparamos tudo.',
	overlay = false,
}: LoadingGlobalProps) {
	const { width } = useWindowDimensions();
	const isMobile = width < 768;

	// Animação de pulso e brilho do logo
	const animEscala = useRef(new Animated.Value(1)).current;
	const animOpacidade = useRef(new Animated.Value(0.85)).current;
	const animHalo = useRef(new Animated.Value(0.3)).current;

	// Animação contínua da barra de progresso linear
	const animBarra = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		// 1. Efeito de respiração / pulsação do logo
		const pulsoLoop = Animated.loop(
			Animated.sequence([
				Animated.parallel([
					Animated.timing(animEscala, {
						toValue: 1.05,
						duration: 900,
						useNativeDriver: true,
					}),
					Animated.timing(animOpacidade, {
						toValue: 1,
						duration: 900,
						useNativeDriver: true,
					}),
					Animated.timing(animHalo, {
						toValue: 0.8,
						duration: 900,
						useNativeDriver: true,
					}),
				]),
				Animated.parallel([
					Animated.timing(animEscala, {
						toValue: 1,
						duration: 900,
						useNativeDriver: true,
					}),
					Animated.timing(animOpacidade, {
						toValue: 0.85,
						duration: 900,
						useNativeDriver: true,
					}),
					Animated.timing(animHalo, {
						toValue: 0.3,
						duration: 900,
						useNativeDriver: true,
					}),
				]),
			])
		);

		// 2. Translação infinita da barra de progresso
		const barraLoop = Animated.loop(
			Animated.sequence([
				Animated.timing(animBarra, {
					toValue: 1,
					duration: 1300,
					useNativeDriver: true,
				}),
				Animated.timing(animBarra, {
					toValue: 0,
					duration: 0,
					useNativeDriver: true,
				}),
			])
		);

		pulsoLoop.start();
		barraLoop.start();

		return () => {
			pulsoLoop.stop();
			barraLoop.stop();
		};
	}, [animEscala, animOpacidade, animHalo, animBarra]);

	// Translação da barra de -100% até +150% do tamanho do trilho
	const translateX = animBarra.interpolate({
		inputRange: [0, 1],
		outputRange: [-100, 200],
	});

	return (
		<View style={[styles.container, overlay && styles.overlayFull]}>
			{/* Card Flutuante com cantos curvos e sombra limpa */}
			<View style={[styles.card, { width: isMobile ? '88%' : 360 }]}>

				{/* Emblema Circular com Efeito Halo */}
				<View style={styles.logoArea}>
					<Animated.View
						style={[
							styles.haloBrilho,
							{
								opacity: animHalo,
								transform: [{ scale: animEscala }],
							},
						]}
					/>

					<Animated.View
						style={[
							styles.circuloLogo,
							{
								opacity: animOpacidade,
								transform: [{ scale: animEscala }],
							},
						]}
					>
						<Text style={styles.textoV}>
							v<Text style={styles.textoPonto}>.</Text>
						</Text>
					</Animated.View>
				</View>

				{/* Textos da marca */}
				<Text style={[tipografia.h3, styles.titulo]}>{titulo}</Text>

				{subtitulo ? (
					<Text style={[tipografia.caption, styles.subtitulo]}>{subtitulo}</Text>
				) : null}

				{/* Trilho de Progresso com preenchimento em Dourado Vitta */}
				<View style={styles.trilho}>
					<Animated.View
						style={[
							styles.barraProgresso,
							{
								transform: [{ translateX }],
							},
						]}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F8F9FA',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	overlayFull: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 99999,
		backgroundColor: 'rgba(248, 249, 250, 0.94)',
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 28,
		paddingVertical: 36,
		paddingHorizontal: 28,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#EFEFEF',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.05,
		shadowRadius: 16,
		elevation: 4,
	},
	logoArea: {
		position: 'relative',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	haloBrilho: {
		position: 'absolute',
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#FEF3C7', // Tom amarelo suave que envolve o círculo
	},
	circuloLogo: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#111111',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#F7B500',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 3,
	},
	textoV: {
		fontSize: 26,
		fontWeight: '900',
		color: '#FFFFFF',
		letterSpacing: -0.5,
	},
	textoPonto: {
		color: '#F7B500',
	},
	titulo: {
		fontSize: 17,
		fontWeight: '700',
		color: '#1A1A1A',
		textAlign: 'center',
		marginBottom: 6,
	},
	subtitulo: {
		fontSize: 13,
		color: '#71717A',
		textAlign: 'center',
		marginBottom: 22,
		lineHeight: 18,
	},
	trilho: {
		width: '100%',
		maxWidth: 200,
		height: 5,
		backgroundColor: '#F0F0F0',
		borderRadius: 999,
		overflow: 'hidden',
	},
	barraProgresso: {
		width: 90,
		height: '100%',
		backgroundColor: '#F7B500',
		borderRadius: 999,
	},
});