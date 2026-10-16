import { StyleSheet } from 'react-native';
import { ThemeColors, gerarTema } from '@/styles/themes';

const defaultTheme = gerarTema('ouro', 'claro');

export const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    pagina: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.bg,
    },

    conteudo: {
      flex: 1,
      flexDirection: 'column',
      padding: 30,
    },

    headerContainer: {
      marginBottom: 30,
    },

    scrollView: {
      flex: 1,
    },
    card: {
      width: '100%',
      maxWidth: 680,
      paddingHorizontal: 24,
      paddingVertical: 32,
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.02,
      shadowRadius: 5,
      elevation: 1,
    },

    carregamentoContainer: {
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
    },

    perfilHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 28,
    },

    fotoContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.inputBg,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },

    foto: {
      width: '100%',
      height: '100%',
    },

    fotoPlaceholder: {
      fontSize: 28,
      color: theme.textSecondary,
    },

    informacoesUsuario: {
      flex: 1,
    },

    nomeUsuario: {
      marginBottom: 2,
      color: theme.textPrimary,
      fontSize: 17,
      fontWeight: '700',
    },

    emailUsuario: {
      color: theme.textSecondary,
      fontSize: 13,
    },

    botaoFoto: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      backgroundColor: theme.cardBg,
    },

    botaoFotoDesabilitado: {
      opacity: 0.6,
    },

    textoBotaoFoto: {
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: '500',
    },

    campoContainer: {
      marginBottom: 18,
    },

    label: {
      marginBottom: 6,
      color: theme.textPrimary,
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
    },

    labelSenha: {
      marginBottom: 6,
      color: theme.textPrimary,
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
    },

    input: {
      padding: 16,
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      color: theme.textPrimary,
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
    },

    inputErro: {
      borderColor: '#D93025',
    },

    mensagemErro: {
      marginTop: 4,
      color: '#D93025',
      fontSize: 11,
    },

    secaoSenha: {
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },

    descricaoSenha: {
      marginBottom: 10,
      color: theme.textSecondary,
      fontSize: 12,
    },

    botaoAlterarSenha: {
      alignSelf: 'flex-start',
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      backgroundColor: theme.cardBg,
    },

    textoBotaoAlterarSenha: {
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: '500',
    },

    camposSenha: {
      marginTop: 14,
      gap: 10,
    },

    acoes: {
      flexDirection: 'row',
      gap: 8,
      maxWidth: '100%',
    },
  });

export const styles = getStyles(defaultTheme);