import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
	pagina: {
		flex: 1,
		width: '100%',
		backgroundColor: '#FFB653',
		position: 'relative',
		overflow: 'hidden',
	},

	//   decoracoes: {
	//     ...StyleSheet.absoluteFillObject,
	//   },

	decoracoes: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
	},

	scroll: {
		width: '100%',
	},

	conteudoScroll: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 34,
	},

	card: {
		width: '100%',
		maxWidth: 540,
		backgroundColor: '#FFF',
		borderRadius: 22,
		paddingHorizontal: 46,
		paddingVertical: 38,
		shadowColor: '#A66300',
		shadowOffset: {
			width: 0,
			height: 10,
		},
		shadowOpacity: 0.1,
		shadowRadius: 24,
		elevation: 8,
	},

	cardCompacto: {
		paddingHorizontal: 24,
		paddingVertical: 28,
		borderRadius: 18,
	},

	marca: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
		marginBottom: 30,
	},

	nomeMarca: {
		fontSize: 15,
		fontWeight: '800',
		color: '#1D1D1D',
	},

	titulo: {
		fontSize: 34,
		lineHeight: 36,
		fontWeight: '900',
		color: '#252525',
		marginBottom: 30,
	},

	tituloDestaque: {
		color: '#F2AB00',
	},

	grupoCampo: {
		marginBottom: 15,
	},

	label: {
		fontSize: 12,
		fontWeight: '500',
		color: '#464646',
		marginBottom: 7,
	},

	input: {
		borderWidth: 1,
		borderColor: '#DEDEDE',
		borderRadius: 10,
		paddingHorizontal: 13,
		paddingVertical: 13,
		fontSize: 13,
		color: '#2F2F2F',
		backgroundColor: '#FFF',
	},

	filhoAdicional: {
		borderTopWidth: 1,
		borderTopColor: '#EEEEEE',
		paddingTop: 18,
		marginTop: 5,
	},

	cabecalhoFilho: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},

	numeroFilho: {
		fontSize: 13,
		fontWeight: '700',
		color: '#333',
	},

	remover: {
		color: '#D93025',
		fontSize: 12,
		fontWeight: '600',
	},

	botaoOutroFilho: {
		borderWidth: 1,
		borderColor: '#DEDEDE',
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 13,
		marginTop: 2,
		marginBottom: 30,
		backgroundColor: '#FFF',
	},

	textoOutroFilho: {
		color: '#333',
		fontSize: 13,
	},

	acoes: {
		flexDirection: 'row',
		gap: 10,
	},

	botaoAvancar: {
		minHeight: 48,
		backgroundColor: '#F4B000',
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},

	botaoFlexivel: {
		flex: 1,
	},

	botaoLarguraTotal: {
		width: '100%',
	},

	botaoDesabilitado: {
		opacity: 0.6,
	},

	conteudoAvancar: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 12,
	},

	textoAvancar: {
		color: '#222',
		fontSize: 13,
		fontWeight: '600',
	},

	seta: {
		color: '#222',
		fontSize: 19,
		fontWeight: '400',
	},

	botaoCancelar: {
		flex: 1,
		minHeight: 48,
		borderWidth: 1,
		borderColor: '#CFCFCF',
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFF',
	},

	textoCancelar: {
		color: '#555',
		fontSize: 13,
		fontWeight: '600',
	},
});

export default styles;