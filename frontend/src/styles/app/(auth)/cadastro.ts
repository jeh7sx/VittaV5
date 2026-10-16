import { StyleSheet } from 'react-native';

// Importa as cores 
import { colors } from '@/styles/colors';
export const cores = {
  cinzaTexto: '#737373',
  cinzaLabel: '#404040',
  bordaInput: '#EAEAEA',
  borderErro: '#E53935',
  textoErro: '#E53935',
  branco: '#FFFFFF',
};

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
  
  inputErro: {
    borderColor: cores.borderErro,
  },
  textoErro: {
    color: cores.textoErro,
    fontSize: 11.5,
    marginTop: 3,
    marginLeft: 4,
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
  inputIcon: {
    marginRight: 12,
  },

  passwordInput: {
    paddingRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 0,
    borderWidth: 0,
    color: colors.gray5,
    backgroundColor: 'transparent',
    minWidth: 0,
  },

  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray1,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    gap: 10,
  },
  
  fieldGroup: {
    marginBottom: 12,
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
    backgroundColor: colors.white,
    color: colors.gray5,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
 
  eyeButton: {
    marginLeft: 6,
    paddingVertical: 6,
    paddingLeft: 6,
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
  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.yellow6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: colors.yellow6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
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
  pilhaCirculosWrapper: {
    width: '100%',
    maxWidth: 420,
    aspectRatio: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloBase: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: 999,
    backgroundColor: colors.yellow2,
  },
  circuloSombra3: {
    top: '26%',
    opacity: 0.35,
  },
  circuloSombra2: {
    top: '13%',
    opacity: 0.55,
  },
  circuloPrincipal: {
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  logoCirculoCentral: {
    width: '42%',
    height: '42%',
    borderRadius: 999,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoPontoBranco: {
    position: 'absolute',
    top: '24%',
    left: '26%',
    width: '20%',
    height: '20%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  logoGotaAmarela: {
    position: 'absolute',
    bottom: '22%',
    right: '26%',
    width: '26%',
    height: '34%',
    backgroundColor: '#F5A623',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '-45deg' }],
  },
});