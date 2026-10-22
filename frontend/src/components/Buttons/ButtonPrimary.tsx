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

interface ButtonPrimaryProps {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function ButtonPrimary({
  texto,
  onPress,
  icone,
  style,
  disabled = false,
}: ButtonPrimaryProps) {
  const themeContext = useTheme();

  const theme = themeContext?.theme ?? {
    id: 'light',
    yellow5: '#F7B500',
    yellow9: '#7A5A00',
  };

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

  const corTextoIcone = theme.id === 'dark' ? '#000000' : theme.yellow9;

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
        style, // O flex: 1 agora é aplicado aqui no elemento mais externo!
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: theme.yellow5,
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 12,
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
              tintColor: corTextoIcone,
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
            tipografia.buttonDark,
            {
              color: corTextoIcone,
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