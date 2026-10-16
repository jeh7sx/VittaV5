import { useRef, useState } from 'react';
import {
  Pressable,
  Text,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { gsap } from 'gsap';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

interface ButtonPrimaryProps {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

export default function ButtonPrimary({
  texto,
  onPress,
  icone,
  style,
}: ButtonPrimaryProps) {
  const themeContext = useTheme();
  
  // Cores padrão caso esteja fora do ThemeProvider
  const theme = themeContext?.theme ?? {
    id: 'light',
    yellow5: '#F7B500',
    yellow9: '#7A5A00',
  };

  const animation = useRef({
    scale: 1,
    translateY: 0,
  }).current;

  const [animatedStyle, setAnimatedStyle] = useState({
    scale: 1,
    translateY: 0,
  });

  function handleHoverIn() {
    if (Platform.OS !== 'web') return;
    gsap.to(animation, {
      scale: 1.03,
      translateY: -2,
      duration: 0.25,
      ease: 'power2.out',
      onUpdate: () => {
        setAnimatedStyle({
          scale: animation.scale,
          translateY: animation.translateY,
        });
      },
    });
  }

  function handleHoverOut() {
    if (Platform.OS !== 'web') return;
    gsap.to(animation, {
      scale: 1,
      translateY: 0,
      duration: 0.25,
      ease: 'power2.out',
      onUpdate: () => {
        setAnimatedStyle({
          scale: animation.scale,
          translateY: animation.translateY,
        });
      },
    });
  }

  const corTextoIcone = theme.id === 'dark' ? '#000000' : theme.yellow9;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: theme.yellow5,
          borderRadius: 999,
          paddingHorizontal: 32,
          paddingVertical: 16,
          transform: [
            { translateY: animatedStyle.translateY },
            { scale: animatedStyle.scale },
          ],
          ...(Platform.OS === 'web' && {
            cursor: 'pointer',
          }),
        },
        style,
      ]}
    >
      {icone && (
        <Image
          source={icone}
          style={{
            width: 24,
            height: 24,
            tintColor: corTextoIcone,
          }}
          resizeMode="contain"
        />
      )}

      <Text
        style={[
          tipografia.buttonDark,
          {
            color: corTextoIcone,
          },
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}