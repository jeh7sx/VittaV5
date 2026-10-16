import {
  TouchableOpacity,
  Text,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

type ButtonTertiaryProps = {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
};

export default function ButtonTertiary({
  texto,
  onPress,
  icone,
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
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        backgroundColor: theme.cardBg,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 24,
        paddingHorizontal: 32,
        paddingVertical: 16,
      }}
    >
      <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
        {texto}
      </Text>
      {icone && (
        <Image
          source={icone}
          style={{
            width: 24,
            height: 24,
            tintColor: theme.textSecondary,
          }}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
}