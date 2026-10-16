import { StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    minHeight: '100%',
    width: '100%',
  },
  scrollContent: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardsContainer: {
    gap: 12,
    width: '100%',
  },
  cardCarregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 96,
    width: '100%',
  },
  graficoHeader: {
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  abasMetricaContainer: {
    flexDirection: 'row',
    borderRadius: 24,
    gap: 8,
    alignSelf: 'flex-start',
  },
  abaMetrica: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  abaMetricaAtiva: {
    backgroundColor: colors.yellow5,
    color: colors.yellow9,
  },
  abaMetricaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  abaMetricaTextoAtivo: {
    color: '#8A5B00',
    fontWeight: '700',
  },
  graficoCarregando: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tabelaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    width: '100%',
  },

  /* ── Faixas Etárias Modernas ────────────────────────────────────────────── */
  barraEtariaContainer: {
    height: 14,
    borderRadius: 7,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#EBEBEB',
    marginVertical: 14,
    width: '100%',
  },
  cardsFaixaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    width: '100%',
  },
  cardFaixaItem: {
    flex: 1,
    minWidth: 95,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-start',
  },
  cardFaixaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  cardFaixaValor: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
  },
  cardFaixaPct: {
    fontSize: 11,
    fontWeight: '600',
    color: '#888',
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipMedia: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipMediaTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A5B00',
  },
});