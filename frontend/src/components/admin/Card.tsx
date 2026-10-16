import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '@/styles/colors';
interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
}

export default function Card({ children, style, padding = 20 }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 24,
          paddingHorizontal: 24,
          paddingVertical: 32,
          borderWidth: 1,
          borderColor: colors.gray1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}