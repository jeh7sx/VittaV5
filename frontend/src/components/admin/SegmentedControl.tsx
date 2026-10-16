import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface Opcao<T extends string> {
  valor: T;
  rotulo: string;
}

interface SegmentedControlProps<T extends string> {
  opcoes: Opcao<T>[];
  selecionado: T;
  onSelecionar: (valor: T) => void;
}

export default function SegmentedControl<T extends string>({
  opcoes,
  selecionado,
  onSelecionar,
}: SegmentedControlProps<T>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 4,
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      {opcoes.map((opcao) => (
        <Segmento
          key={opcao.valor}
          rotulo={opcao.rotulo}
          ativo={opcao.valor === selecionado}
          onPress={() => onSelecionar(opcao.valor)}
        />
      ))}
    </View>
  );
}

function Segmento({ rotulo, ativo, onPress }: { rotulo: string; ativo: boolean; onPress: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore
      onHoverIn={() => setHover(true)}
      // @ts-ignore
      onHoverOut={() => setHover(false)}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: ativo ? '#F7B500' : hover ? '#EAEAEA' : 'transparent',
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: ativo ? '700' : '500', color: ativo ? '#1A1A1A' : '#666' }}>
        {rotulo}
      </Text>
    </Pressable>
  );
}