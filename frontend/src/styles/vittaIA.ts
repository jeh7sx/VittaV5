import { StyleSheet } from 'react-native';
import { colors } from './colors';
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 90,
        paddingTop: 34,
        paddingBottom: 34,
        //width: '100%',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    logoCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },

    logoTexto: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111111',
    },

    main: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    chat: {
        width: '100%',
        flex: 1,
    },

    chatConteudo: {
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingTop: 40,
        paddingBottom: 24,
    },

    chatVazio: {
        flexGrow: 1,
        justifyContent: 'center',
    },

    hero: {
        alignItems: 'center',
        marginBottom: 28,
    },

    heroTitulo: {
        fontSize: 28,
        fontWeight: '400',
        color: '#050505',
        textAlign: 'center',
        letterSpacing: -0.4,
    },

    alerta: {
        backgroundColor: '#FFF8E1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#F7B500',
        alignSelf: 'center',
    },

    alertaTexto: {
        color: '#6B4E00',
        fontWeight: '600',
        fontSize: 13,
    },

    inputWrapper: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 18,
    },

    inputBar: {
        width: '100%',
        //maxWidth: 680,
        minHeight: 58,
        borderRadius: 32,
        backgroundColor: colors.inputBg,
        borderWidth: 1,
        borderColor: colors.gray1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 16,
        },
        shadowOpacity: 0.09,
        shadowRadius: 50,
        elevation: 1,
    },

    plusButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },

    plusText: {
        fontSize: 26,
        color: '#333333',
        fontWeight: '300',
        lineHeight: 28,
    },

    input: {
        flex: 1,
        height: 48,
        fontSize: 14,
        color: '#111111',
        outlineStyle: 'none',
    } as any,

    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 99,
        backgroundColor: colors.yellow5,
        alignItems: 'center',
        justifyContent: 'center',        
    },

    sendButtonDisabled: {
        backgroundColor: colors.gray1,
    },

    sendText: {
        color: '#c20000',
        fontSize: 17,
        fontWeight: '700',
        marginTop: -1,
    },

    bolha: {
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 18,
        marginBottom: 12,
        maxWidth: '78%',
    },

    usuario: {
        backgroundColor: '#F7B500',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 6,
    },

    assistente: {
        backgroundColor: '#F4F4F4',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 6,
    },

    textoBolha: {
        color: '#222222',
        lineHeight: 20,
        fontSize: 14,
    },

    carregando: {
        alignItems: 'center',
        marginVertical: 18,
    },

    carregandoTexto: {
        marginTop: 8,
        color: '#777777',
        fontSize: 13,
    },

    card: {
        backgroundColor: '#FFFFFF',
        marginTop: 20,
        padding: 22,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
        width: '100%',
    },

    cardTitulo: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 18,
        color: '#111111',
    },

    label: {
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 12,
        color: '#222222',
        fontSize: 13,
    },

    inputFormulario: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        outlineStyle: 'none',
    } as any,

    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },

    botoes: {
        flexDirection: 'row',
        marginTop: 22,
        gap: 10,
    },

    botaoCriar: {
        flex: 1,
        backgroundColor: '#111111',
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
    },

    botaoCancelar: {
        flex: 1,
        backgroundColor: '#E54848',
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
    },

    botaoDesabilitado: {
        opacity: 0.5,
    },

    botaoTexto: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    mensagemLinha: {
        width: '100%',
        marginBottom: 28,
    },

    mensagemLinhaIA: {
        alignItems: 'flex-start',
    },

    mensagemLinhaUsuario: {
        alignItems: 'flex-end',
    },

    mensagemContainer: {
        maxWidth: '72%',
    },

    mensagemContainerIA: {
        alignItems: 'flex-start',
    },

    mensagemContainerUsuario: {
        alignItems: 'flex-end',
    },

    bolhaIA: {
        backgroundColor: '#F4F4F4',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderBottomRightRadius: 22,
        borderBottomLeftRadius: 4,
    },

    bolhaUsuario: {
        backgroundColor: '#F6E6BF',
        paddingVertical: 17,
        paddingHorizontal: 22,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 4,
    },

    textoMensagem: {
        fontSize: 15,
        lineHeight: 21,
    },

    textoIA: {
        color: '#333333',
        fontWeight: '400',
    },

    textoUsuario: {
        color: '#4A4030',
        fontWeight: '500',
    },

    botaoCopiar: {
        marginTop: 6,
        minHeight: 20,
        justifyContent: 'center',
    },

    botaoCopiarIA: {
        alignSelf: 'flex-start',
    },

    botaoCopiarUsuario: {
        alignSelf: 'flex-end',
    },

    iconeCopiar: {
        fontSize: 13,
        color: '#8A8A8A',
        fontWeight: '500',
    },

    avisoIA: {
        marginTop: 14,
        fontSize: 13,
        color: '#9A9A9A',
        textAlign: 'center',
    },
});

export default styles;