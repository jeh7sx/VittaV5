import { StyleSheet, useWindowDimensions, } from 'react-native';
import { colors } from './colors';
// Importação da fonte inter
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
  // Função para carregar a fonte inter
export function useCarregarFontes() {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
}
export const tipografia = {

  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 62,
    lineHeight: 48,
    letterSpacing: -2,
    color: colors.textPrimary,
  },

  h2: {
    fontFamily: 'Inter_500Medium',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -2,
    color: colors.textPrimary,
  },

  h3: {
    fontFamily: 'Inter_500Medium',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  h4: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: -1,
    color: colors.textPrimary,
  },

  h3Inverse: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    color: colors.textInverse,
  },

  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },

  bodySecondary: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 20,
    color: colors.gray4,
    letterSpacing: -0.2,
  },

  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
    color: colors.gray4,
  },

  captionInverse: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textInverse,
  },

  buttonDark: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: colors.textPrimary,
  },

  buttonLight: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textInverse,
  },

  highlight: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
};
