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

type ButtonTertiaryProps = {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

export default function ButtonTertiary({
  texto,
  onPress,
  icone,
  style,
}: ButtonTertiaryProps) {
  const themeContext = useTheme();

  const theme = themeContext?.theme ?? {
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    textSecondary: '#6B7280',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 24,
          paddingHorizontal: 20,
          paddingVertical: 14,
          minWidth: 0,
        },
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={[
          tipografia.bodySecondary,
          {
            color: theme.textSecondary,
            flexShrink: 1,
          },
        ]}
      >
        {texto}
      </Text>

      {icone && (
        <Image
          source={icone}
          style={{
            width: 20,
            height: 20,
            tintColor: theme.textSecondary,
            flexShrink: 0,
          }}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
}