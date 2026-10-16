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
    btnAdicionarTopo: {
      height: 56,
      borderRadius: 999,
      paddingHorizontal: 24,
    },
    tooltip: {
      maxWidth: 320,
      padding: 10,
      backgroundColor: theme.black,
      borderRadius: 8,
    },
    textoTooltip: {
      color: theme.white,
      fontSize: 12,
      lineHeight: 18,
    },
    carregando: {
      marginTop: 40,
    },
    estadoVazio: {
      alignItems: 'center',
      padding: 28,
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
    },
    textoEstadoVazio: {
      color: theme.textSecondary,
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

    // Card Consulta
    cardConsulta: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 8,
    },
    iconeBoxConsulta: {
      borderRadius: 999,
      backgroundColor: theme.bgConsul,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    statusBadgeBtn: {
      height: 40,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    popover: {
      position: 'absolute',
      top: 48,
      right: 0,
      zIndex: 9999,
      elevation: 20,
      minWidth: 160,
      overflow: 'hidden',
      backgroundColor: theme.cardBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
    itemPopover: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    // Menu Dropdown Mobile
    menuDropdownMobile: {
      position: 'absolute',
      right: 0,
      top: 42,
      minWidth: 158,
      backgroundColor: theme.cardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 20,
      zIndex: 9999,
    },
    itemMenuMobile: {
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },

    // Botão Expandir / Recolher Lista
    botaoExpandir: {
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 8,
    },
    textoExpandir: {
      color: theme.textPrimary,
      textDecorationLine: 'underline',
      fontSize: 15,
    },

    // Formulário
    formularioScroll: {
      maxHeight: 580,
    },
    formularioScrollMobile: {
      maxHeight: 510,
    },
    campoContainer: {
      marginBottom: 14,
    },
    label: {
      marginBottom: 6,
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      padding: 16,
      color: theme.textPrimary,
      fontSize: 16,
      backgroundColor: theme.inputBg,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
    },
    dropdownPlaces: {
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
    },
    itemDropdownPlaces: {
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
      backgroundColor: theme.yellow1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verMaisStatusBadge: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
    },
    descricaoBox: {
      backgroundColor: theme.inputBg,
      borderRadius: 8,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: theme.yellow5,
    },

    // Modais Base
    modalFundo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
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