import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';
import { gerarTema } from '@/styles/themes';

interface PublicFooterProps {
  sidePadding?: number;
}

const defaultTheme = gerarTema('ouro', 'claro');

export function PublicFooter({ sidePadding }: PublicFooterProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const themeContext = useTheme();
  const isDark = themeContext?.isDark ?? false;

  const paddingHorizontal =
    sidePadding !== undefined ? sidePadding : isMobile ? 20 : width < 1200 ? 48 : 280;

  return (
    <View
      style={{
        width: '100%',
        alignSelf: 'stretch',
        backgroundColor: isDark ? '#161616' : '#1E1E1E',
        paddingVertical: 45,
        paddingHorizontal,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: isDark ? '#2C2C2C' : 'transparent',
      }}
    >
      <Text style={[tipografia.captionInverse, { textAlign: 'center', color: '#D0D0D5' }]}>
        © Elaborado pelos autores • vittaetec@gmail.com
      </Text>
    </View>
  );
}