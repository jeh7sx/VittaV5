import { StyleSheet } from 'react-native';
import { ThemeColors, gerarTema } from '@/styles/themes';

const defaultTheme = gerarTema('ouro', 'claro');

export const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: theme.bg,
      minHeight: '100%',
    },
    scrollContent: {
      flex: 1,
    },
    secaoResumoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chipsContainer: {
      gap: 8,
      paddingVertical: 4,
    },
    chipItem: {
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardsResumoLinha: {
      gap: 16,
    },
    cardStat: {
      flex: 1,
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 32,
      borderWidth: 1,
      borderColor: theme.border,
      minHeight: 140,
      justifyContent: 'space-between',
      gap: 16,
    },
    cardStatHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconeBoxStat: {
      borderRadius: 999,
      padding: 8,
    },
    cardStatFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    cardStatNumero: {
      fontSize: 32,
      lineHeight: 36,
      color: theme.textPrimary,
    },
    cardStatSubLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cardStatPercentual: {
      fontSize: 13,
      fontWeight: '700',
    },
    cardStatLegenda: {
      fontSize: 12,
      color: theme.textSecondary,
    },

    // Adesão / Tratamento
    secaoTratamentoLinha: {
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 16,
    },
    cardAdesao: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      gap: 16,
      borderColor: theme.border,
      flex: 1,
      height: '100%',
    },
    adesaoHeader: {
      justifyContent: 'space-between',
      gap: 16,
    },
  adesaoSegmented: {
      flexDirection: 'row',
      backgroundColor: theme.inputBg,
      borderRadius: 999,
      padding: 4,
      gap: 4,
      alignSelf: 'flex-start', // <- A barra terá apenas a largura dos botões
    },
    adesaoBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    adesaoBtnAtivo: {
      backgroundColor: theme.yellow5,
    },
    adesaoBtnTextoAtivo: {
      color: theme.yellow9,
      fontWeight: '700',
    },
    adesaoCorpo: {
      alignItems: 'center',
      gap: 36,
      paddingVertical: 8,
    },
    adesaoGraficoCentroTexto: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    adesaoGraficoCentroSub: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      marginTop: -2,
    },
   cardStatus: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.cardBg,
      borderRadius: 16, 
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.border,
      width: '100%',
    },
    secaoProximos: {
      gap: 12,
      backgroundColor: theme.cardBg,
      padding: 24,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 24,
    },
    
    secaoProximosHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 16,
    },
    cardProximoItem: {
      width: '100%',
      backgroundColor: theme.cardBg,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    proximoIconeBox: {
      width: 40,
      height: 40,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    proximoTextos: {
      flex: 1,
      minWidth: 0,
    },
    proximoMetaLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },

    // Modais
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      padding: 24,
      gap: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 14,
      fontSize: 15,
      color: theme.textPrimary,
      backgroundColor: theme.inputBg,
    },
  });

export const styles = getStyles(defaultTheme);