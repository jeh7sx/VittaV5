import { StyleSheet } from 'react-native';
import { ThemeColors, gerarTema } from '@/styles/themes';

// Fallback padrão seguro para a exportação estática
const defaultTheme = gerarTema('ouro', 'claro');

export const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    root: {
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
    topoAcoesRow: {
      gap: 12,
    },
    btnAdicionarTopo: {
      height: 56,
      borderRadius: 999,
      paddingHorizontal: 24,
    },
    tooltipBox: {
      backgroundColor: theme.black,
      borderRadius: 8,
      padding: 16,
      maxWidth: 320,
    },
    tooltipText: {
      fontSize: 12,
      color: theme.white,
      lineHeight: 18,
    },
    semFilhoBox: {
      padding: 28,
      backgroundColor: theme.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    emptyStateContainer: {
      flex: 1,
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: 500,
    },
    emptyStateText: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 48,
    },
    emptyStateImage: {
      width: 300,
      height: 300,
    },

    // Filtros em Abas
    filtrosLinha: {
      gap: 8,
    },
    btnFiltroIcone: {
      width: 56,
      height: 56,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipFiltro: {
      height: 56,
      paddingHorizontal: 24,
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },

    // Card do Exame
    examCard: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      alignSelf: 'stretch',
    },
    iconeBoxExame: {
      borderRadius: 999,
      backgroundColor: theme.bgExame,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    statusBadgeBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusPopover: {
      position: 'absolute',
      top: 54,
      right: 0,
      minWidth: 160,
      backgroundColor: theme.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 20,
      zIndex: 9999,
    },
    statusPopoverItem: {
      paddingVertical: 14,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    // Botão Ver Mais / Ver Menos
    verTodosBtn: {
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 8,
    },
    verTodosText: {
      color: theme.yellow6,
      textDecorationLine: 'underline',
      fontSize: 15,
    },

    // Formulário
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 16,
      fontSize: 16,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
      marginBottom: 14,
    },
    dropdown: {
      position: 'absolute',
      top: 46,
      left: 0,
      right: 0,
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      zIndex: 999,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    // Modal Ver Mais
    verMaisBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      width: '100%',
      maxWidth: 520,
    },
    verMaisIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.bgExame,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verMaisStatusBadge: {
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    descricaoBox: {
      backgroundColor: theme.inputBg,
      borderRadius: 10,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.yellow5,
    },

    // Modal Calendário
    modalCalendarioOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalCalendarioBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 360,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalPadraoOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.62)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalPadraoBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      width: '100%',
      maxWidth: 780,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });

export const styles = getStyles(defaultTheme);