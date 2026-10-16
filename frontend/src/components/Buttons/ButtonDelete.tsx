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

interface ButtonDeleteProps {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}

export default function ButtonDelete({
  texto,
  onPress,
  icone,
  style,
}: ButtonDeleteProps) {
  const themeContext = useTheme();
  const isDark = themeContext?.isDark ?? false;

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

  const corFundoDelete = isDark ? '#7F1D1D' : '#C31F1F';

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
          backgroundColor: corFundoDelete,
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
            tintColor: '#FFFFFF',
          }}
          resizeMode="contain"
        />
      )}

      <Text
        style={[
          tipografia.buttonDark,
          {
            color: '#FFFFFF',
          },
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}