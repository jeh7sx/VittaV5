import { ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';
import { colors } from '@/styles/colors'
type Variante = 'primaria' | 'secundaria' | 'perigo' | 'fantasma';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variante?: Variante;
  icone?: ReactNode;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: ViewStyle;
  tamanho?: 'sm' | 'md';
}

const CORES: Record<Variante, { bg: string; bgHover: string; texto: string; borda?: string }> = {
  primaria: { bg: '#F7B500', bgHover: '#E0A500', texto: '#1A1A1A' },
  secundaria: { bg: '#FFFFFF', bgHover: '#F7F7F7', texto: '#1A1A1A', borda: '#E0E0E0' },
  perigo: { bg: '#FDECEC', bgHover: '#FBDBDB', texto: '#B00020' },
  fantasma: { bg: 'transparent', bgHover: '#F5F5F5', texto: '#555' },
};

export default function Button({
  label,
  onPress,
  variante = 'primaria',
  icone,
  carregando = false,
  desabilitado = false,
  style,
  tamanho = 'md',
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const cores = CORES[variante];
  const bloqueado = desabilitado || carregando;

  return (
    <Pressable
      onPress={bloqueado ? undefined : onPress}
      // @ts-ignore — eventos de hover existem no target web (react-native-web)
      onHoverIn={() => setHover(true)}
      // @ts-ignore
      onHoverOut={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={() => setFoco(false)}
      disabled={bloqueado}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: tamanho === 'sm' ? 8 : 12,
          paddingHorizontal: tamanho === 'sm' ? 14 : 20,
          borderRadius: 999,
          backgroundColor: bloqueado ? '#F0F0F0' : (pressed ? cores.bgHover : (hover ? cores.bgHover : cores.bg)),
          borderWidth:  1,
          borderColor: colors.gray1,
          opacity: bloqueado && !carregando ? 0.6 : 1,
          outlineStyle: (foco ? 'solid' : 'none') as any,
          outlineColor: '#F7B500' as any,
          outlineWidth: 2 as any,
          outlineOffset: 2 as any,
          transitionDuration: '120ms' as any,
        },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={variante === 'primaria' ? '#1A1A1A' : cores.texto} />
      ) : (
        <>
          {icone}
          <Text style={{ color: bloqueado ? '#999' : cores.texto, fontWeight: '700', fontSize: tamanho === 'sm' ? 13 : 14 }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}