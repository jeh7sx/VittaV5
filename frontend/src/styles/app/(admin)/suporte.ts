import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    minHeight: '100%',
  },
  scrollContent: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 22,
  },
  cardsIndicadores: {
    gap: 16,
    marginBottom: 22,
  },
  cardCarregando: {
    flex: 1,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barraAcoes: {
    gap: 12,
    marginBottom: 18,
    alignItems: 'center',
  },
  linhaChamado: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeStatusTexto: {
    fontSize: 11,
    fontWeight: '800',
  },
  botaoMenu: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 520,
    maxWidth: '92%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});