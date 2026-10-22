import { useRef } from 'react';
import {
  Pressable,
  Text,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
  Platform,
  Animated,
} from 'react-native';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

interface ButtonSecondaryProps {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function ButtonSecondary({
  texto,
  onPress,
  icone,
  style,
  disabled = false,
}: ButtonSecondaryProps) {
  const themeContext = useTheme();

  const theme = themeContext?.theme ?? {
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#1F2937',
  };

  // Mesma animação de escala e elevação do ButtonPrimary
  const animScale = useRef(new Animated.Value(1)).current;
  const animTranslateY = useRef(new Animated.Value(0)).current;

  function handleHoverIn() {
    if (Platform.OS !== 'web' || disabled) return;
    Animated.parallel([
      Animated.timing(animScale, {
        toValue: 1.03,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animTranslateY, {
        toValue: -2,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }

  function handleHoverOut() {
    if (Platform.OS !== 'web' || disabled) return;
    Animated.parallel([
      Animated.timing(animScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }

  return (
    <Animated.View
      style={[
        {
          minWidth: 0,
          transform: [
            { translateY: animTranslateY },
            { scale: animScale },
          ],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        style={[
          {
            width: '100%',
            height: 48, // Altura padronizada idêntica ao ButtonPrimary
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: theme.cardBg,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 999,
            paddingHorizontal: 20,
            opacity: disabled ? 0.7 : 1,
          },
          Platform.OS === 'web' && ({
            cursor: disabled ? 'not-allowed' : 'pointer',
          } as any),
        ]}
      >
        {icone && (
          <Image
            source={icone}
            style={{
              width: 18,
              height: 18,
              tintColor: theme.textPrimary,
              flexShrink: 0,
            }}
            resizeMode="contain"
          />
        )}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={[
            tipografia.body,
            {
              color: theme.textPrimary,
              fontWeight: '400',
              flexShrink: 1,
              textAlign: 'center',
            },
          ]}
        >
          {texto}
        </Text>
      </Pressable>
    </Animated.View>
  );
}