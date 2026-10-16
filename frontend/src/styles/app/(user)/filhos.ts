import { StyleSheet } from 'react-native';
import { ThemeColors, gerarTema } from '@/styles/themes';

const defaultTheme = gerarTema('ouro', 'claro');

export const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    titulo: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.textPrimary,
    },

    subtitulo: {
      marginLeft: 26,
      color: theme.textSecondary,
      fontSize: 12,
      marginTop: 5,
    },

    cardPrincipal: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      padding: 24,
      gap: 16,
      borderWidth: 1,
      borderColor: theme.border,
      width: '100%',
    },

    lateral: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      paddingVertical: 32,
      paddingHorizontal: 24,
      gap: 16,
    },

    badge: {
      backgroundColor: theme.yellow1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },

    botaoEditar: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 8,
      backgroundColor: theme.cardBg,
    },

    resumoContadores: {
      width: '100%',
      minWidth: 0,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: theme.cardBg,
    },

    iconeEscuro: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    resumoSaude: {
      borderRadius: 24,
      padding: 24,
      gap: 24,
      backgroundColor: theme.cardBg,
      width: '100%',
    },

    itemFilho: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 24,
      padding: 16,
      backgroundColor: theme.cardBg,
    },

    itemFilhoAtivo: {
      borderColor: theme.yellow5,
      backgroundColor: theme.yellow1,
    },

    vazio: {
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },

    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },

    modal: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },

    fotoForm: {
      width: 172,
      height: 172,
      borderRadius: 244,
      overflow: 'hidden',
      alignSelf: 'center',
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: 'dashed',
    },

    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 16,
      fontSize: 16,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
    },
  });

export const styles = getStyles(defaultTheme);