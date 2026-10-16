import { ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface AbaItem<T extends string> {
  valor: T;
  rotulo: string;
  icone?: ReactNode;
}

interface TabsProps<T extends string> {
  abas: AbaItem<T>[];
  ativa: T;
  onSelecionar: (valor: T) => void;
}

export default function Tabs<T extends string>({ abas, ativa, onSelecionar }: TabsProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 6, borderBottomWidth: 1, borderBottomColor: '#EDEDED' }}>
        {abas.map((aba) => (
          <Aba key={aba.valor} aba={aba} ativa={aba.valor === ativa} onPress={() => onSelecionar(aba.valor)} />
        ))}
      </View>
    </ScrollView>
  );
}

function Aba<T extends string>({
  aba,
  ativa,
  onPress,
}: {
  aba: AbaItem<T>;
  ativa: boolean;
  onPress: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore
      onHoverIn={() => setHover(true)}
      // @ts-ignore
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: ativa ? '#F7B500' : 'transparent',
        backgroundColor: hover && !ativa ? '#FAFAFA' : 'transparent',
      }}
    >
      {aba.icone}
      <Text style={{ fontSize: 14, fontWeight: ativa ? '700' : '500', color: ativa ? '#F7B500' : '#666' }}>
        {aba.rotulo}
      </Text>
    </Pressable>
  );
}