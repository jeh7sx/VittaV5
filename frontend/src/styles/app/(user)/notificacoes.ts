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
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      gap: 16,
    },
    cabecalho: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    linhaFiltros: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    chipFiltro: {
      height: 44,
      paddingHorizontal: 18,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    badgeContador: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardNotificacao: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    cardNaoLido: {
      borderColor: theme.yellow5,
      backgroundColor: theme.yellow1,
    },
    iconeBox: {
      width: 44,
      height: 44,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    conteudoTexto: {
      flex: 1,
      gap: 4,
    },
    topoLinhaItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pontoDestaqueNaoLido: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.yellow5,
    },
    emptyStateContainer: {
      flex: 1,
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 380,
      gap: 12,
    },
    emptyIconBox: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.yellow2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
  });

export const styles = getStyles(defaultTheme);