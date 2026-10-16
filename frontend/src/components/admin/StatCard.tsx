import { ReactNode } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Card from './Card';
import { IconTrendUp } from '../Icons';
import { tipografia } from '@/styles/tipografia';
interface StatCardProps {
  icone: any | ReactNode;
  corIcone: string;
  rotulo: string;
  valor: string | number;
  variacaoPercentual?: number;
  descricaoVariacao?: string;
}

export default function StatCard({
  icone,
  corIcone,
  rotulo,
  valor,
  variacaoPercentual,
  descricaoVariacao = 'este mês',
}: StatCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 480;

  return (
    <Card style={{ flex: 1, minWidth: isMobile ? '100%' : 200 }} padding={16}>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            backgroundColor: corIcone,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {icone}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={tipografia.body} numberOfLines={1}>
            {rotulo}
          </Text>
          <Text style={tipografia.h2}>{valor}</Text>
        </View>
      </View>

      {typeof variacaoPercentual === 'number' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }}>
          <IconTrendUp color={variacaoPercentual >= 0 ? '#1B8A3B' : '#B00020'} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: variacaoPercentual >= 0 ? '#1B8A3B' : '#B00020' }}>
            {variacaoPercentual >= 0 ? '+' : ''}
            {variacaoPercentual}%
          </Text>
          <Text style={tipografia.caption}>{descricaoVariacao}</Text>
        </View>
      )}
    </Card>
  );
}