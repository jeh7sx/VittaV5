import {
  TouchableOpacity,
  Text,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

type ButtonSecondaryProps = {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

export default function ButtonSecondary({
  texto,
  onPress,
  icone,
  style,
}: ButtonSecondaryProps) {
  const themeContext = useTheme();

  const theme = themeContext?.theme ?? {
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    textPrimary: '#1F2937',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 12,
          minWidth: 0,
        },
        style,
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
            flexShrink: 1,
            textAlign: 'center',
          },
        ]}
      >
        {texto}
      </Text>
    </TouchableOpacity>
  );
}