import {
  TouchableOpacity,
  Text,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

type ButtonBlackProps = {
  texto: string;
  onPress: () => void;
  icone?: ImageSourcePropType;
};

export default function ButtonBlack({
  texto,
  onPress,
  icone,
}: ButtonBlackProps) {
  const themeContext = useTheme();

  const isDark = themeContext?.isDark ?? false;
  const theme = themeContext?.theme ?? {
    yellow5: '#F7B500',
    black: '#000000',
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
        backgroundColor: isDark ? theme.yellow5 : (theme.black ?? '#000000'),
        borderRadius: 999,
        paddingHorizontal: 32,
        paddingVertical: 16,
        width: '100%',
      }}
    >
      <Text
        style={[
          tipografia.body,
          { color: isDark ? '#000000' : '#FFFFFF', fontWeight: '700' },
        ]}
      >
        {texto}
      </Text>
      {icone && (
        <Image
          source={icone}
          style={{
            width: 24,
            height: 24,
            tintColor: isDark ? '#000000' : '#FFFFFF',
          }}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
}