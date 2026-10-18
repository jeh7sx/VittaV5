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
}

export default function ButtonPrimary({
  texto,
  onPress,
  icone,
  style,
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
    if (Platform.OS !== 'web') return;
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
    if (Platform.OS !== 'web') return;
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
          transform: [
            { translateY: animTranslateY },
            { scale: animScale },
          ],
        },
      ]}
    >
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
    </Animated.View>
  );
}