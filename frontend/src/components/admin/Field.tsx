import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '@/styles/colors';
import { tipografia } from '@/styles/tipografia';
interface FieldProps {
  label?: string;
  descricao?: string;
  valor: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  erro?: string;
  icone?: React.ReactNode;
  editavel?: boolean;
}

export default function Field({
  label,
  descricao,
  valor,
  onChangeText,
  placeholder,
  erro,
  icone,
  editavel = true,
}: FieldProps) {
  const [focado, setFocado] = useState(false);

  const corBorda = erro ? '#D93025' : focado ? '#F7B500' : '#E0E0E0';

  return (
    <View style={{ marginBottom: 4 }}>
      {label && <Text style={tipografia.body}>{label}</Text>}
      {descricao && <Text style={tipografia.caption}>{descricao}</Text>}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          borderWidth: 1,
          borderColor: colors.gray1,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: colors.inputBg,
          
        }}
      >
        {icone}
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAA"
          editable={editavel}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={{ flex: 1, fontSize: 16, color: '#1A1A1A', outlineStyle: 'none' as any, gap: 16 }}
        />
      </View>
      {erro && <Text style={{ fontSize: 16, color: '#D93025', marginTop: 4 }}>{erro}</Text>}
    </View>
  );
}