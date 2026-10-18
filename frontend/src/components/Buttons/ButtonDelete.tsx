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

  const corFundoDelete = isDark ? '#7F1D1D' : '#C31F1F';

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
            backgroundColor: corFundoDelete,
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
    </Animated.View>
  );
}