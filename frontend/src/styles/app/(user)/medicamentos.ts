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
    scrollPrincipal: {
      flex: 1,
    },
    scrollContent: {
      gap: 16,
    },
    topoAcoesRow: {
      gap: 12,
    },
    tooltip: {
      backgroundColor: theme.black,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
      maxWidth: 380,
    },
    estadoVazio: {
      padding: 28,
      backgroundColor: theme.cardBg,
      borderRadius: 12,
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

    // Card do Medicamento
    cardMedicamento: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
    iconeBoxMed: {
      borderRadius: 999,
      backgroundColor: theme.bgMed,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    statusBadgeBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    popover: {
      position: 'absolute',
      top: 35,
      right: 0,
      minWidth: 150,
      backgroundColor: theme.cardBg,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      zIndex: 9999,
      elevation: 9999,
    },
    itemPopover: {
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    // Botão e Menu dos Três Pontinhos (Mais Opções)
    btnMaisOpcoes: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuOpcoesDropdown: {
      position: 'absolute',
      top: 35,
      right: 0,
      minWidth: 140,
      backgroundColor: theme.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      zIndex: 9999,
      elevation: 9999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    itemMenuOpcoes: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },

    botaoVerMaisMenos: {
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 8,
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
    },
    dropdown: {
      position: 'absolute',
      top: 52,
      left: 0,
      right: 0,
      backgroundColor: theme.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      zIndex: 1000,
      elevation: 5,
      overflow: 'hidden',
    },
    dropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    counterBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      height: 48,
      justifyContent: 'space-between',
      paddingHorizontal: 8,
    },
    counterBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acoesModal: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 18,
    },

    // Modal Ver Mais
    verMaisBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      width: '100%',
      maxWidth: 520,
    },
    verMaisIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.yellow2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verMaisBadge: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      borderWidth: 1,
    },
    doseCardItem: {
      borderRadius: 12,
      borderWidth: 1.5,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      minWidth: 74,
    },

    // Modal Seleção de Dose
    doseModalBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
    },
    doseModalIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },

    // Modais Base
    modalOverlayFundo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalPadraoBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      width: '100%',
      maxWidth: 800,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 10,
    },
    modalCalendarioBox: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 360,
    },
  });

export const styles = getStyles(defaultTheme);