import { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
}

export default function EmptyState({ icone, titulo, descricao }: EmptyStateProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 20 }}>
      {icone && <View style={{ marginBottom: 14 }}>{icone}</View>}
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#444', marginBottom: 4, textAlign: 'center' }}>
        {titulo}
      </Text>
      {descricao && (
        <Text style={{ fontSize: 13, color: '#999', textAlign: 'center', maxWidth: 320 }}>{descricao}</Text>
      )}
    </View>
  );
}