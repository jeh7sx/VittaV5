import { StyleSheet } from 'react-native';

// Importa as cores 
import { colors } from '@/styles/colors';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.black,
  },
  container: {
    flex: 1,
    backgroundColor: colors.black,
    minHeight: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudoDesktop: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conteudoMobile: {
    flex: 1,
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── CARD BRANCO FLUTUANTE (ESQUERDA) ──────────────────────
  leftPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  cardFormulario: {
    justifyContent: 'center',
    width: '100%',
    maxWidth: 620,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 54,
    paddingVertical: 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
    gap: 16,
  },
  cardFormularioMobile: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 20,
    width: '100%',
    maxWidth: '100%',
  },

  // ─── CABEÇALHO DO FORMULÁRIO ──────────────────────────────
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    marginLeft: 8,
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  logoDot: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F7B500',
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: colors.gray5,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.gray4,
    marginBottom: 22,
  },

  // ─── CAMPOS DE TEXTO ──────────────────────────────────────
  fieldGroup: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray1,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.inputBg,
    color: colors.gray5,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    color: '#555555',
    fontSize: 13,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  // ─── BOTÃO E FOOTER ───────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#666666',
    fontSize: 13.5,
  },
  footerLink: {
    color: colors.yellow6,
    fontWeight: '700',
    fontSize: 13.5,
    marginLeft: 4,
  },

  // ─── ILUSTRAÇÃO DA DIREITA (RESPONSIVA) ───────────────────
  rightPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});