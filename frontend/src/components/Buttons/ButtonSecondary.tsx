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
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: theme.cardBg,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 999,
          paddingHorizontal: 32,
          paddingVertical: 16,
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
            tintColor: theme.textPrimary,
          }}
          resizeMode="contain"
        />
      )}

      <Text style={[tipografia.body, { color: theme.textPrimary }]}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}