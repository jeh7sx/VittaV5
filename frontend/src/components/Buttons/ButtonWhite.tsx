import {
  TouchableOpacity,
  Text,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

type ButtonWhiteProps = {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
};

export default function ButtonWhite({
  texto,
  onPress,
  icone,
}: ButtonWhiteProps) {
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
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        backgroundColor: theme.cardBg,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 32,
        paddingVertical: 16,
      }}
    >
      <Text style={[tipografia.body, { color: theme.textPrimary }]}>
        {texto}
      </Text>
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
    </TouchableOpacity>
  );
}