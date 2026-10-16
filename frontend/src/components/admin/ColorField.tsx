import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

interface ColorFieldProps {
  label: string;
  descricao?: string;
  valor: string;
  onChange: (hex: string) => void;
  erro?: string;
}

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

export default function ColorField({ label, descricao, valor, onChange, erro }: ColorFieldProps) {
  const [focado, setFocado] = useState(false);
  const [textoLocal, setTextoLocal] = useState(valor);
  const inputColorRef = useRef<HTMLInputElement | null>(null);

  // Mantém o campo de texto sincronizado quando o valor externo muda
  if (valor !== textoLocal && !focado) {
    // sincroniza sem causar loop, pois só roda quando não está sendo editado
    if (textoLocal !== valor) setTimeout(() => setTextoLocal(valor), 0);
  }

  const corValida = HEX_REGEX.test(textoLocal) ? textoLocal : '#CCCCCC';
  const corBorda = erro ? '#D93025' : focado ? '#F7B500' : '#E0E0E0';

  function commit(texto: string) {
    setTextoLocal(texto);
    if (HEX_REGEX.test(texto)) {
      onChange(texto.toUpperCase());
    }
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 }}>{label}</Text>
      {descricao && <Text style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{descricao}</Text>}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderWidth: 1.5,
          borderColor: corBorda,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Swatch clicável que abre o seletor nativo de cor do navegador */}
        <div
          onClick={() => inputColorRef.current?.click()}
          role="button"
          aria-label={`Selecionar ${label}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: corValida,
            border: '1px solid rgba(0,0,0,0.12)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <input
          ref={inputColorRef as any}
          type="color"
          value={corValida}
          onChange={(e: any) => commit(e.target.value.toUpperCase())}
          style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
        />

        <TextInput
          value={textoLocal}
          onChangeText={(t) => setTextoLocal(t.toUpperCase())}
          onFocus={() => setFocado(true)}
          onBlur={() => { setFocado(false); commit(textoLocal); }}
          autoCapitalize="characters"
          maxLength={7}
          style={{ flex: 1, fontSize: 14, color: '#1A1A1A', outlineStyle: 'none' as any }}
        />
      </View>
      {erro && <Text style={{ fontSize: 12, color: '#D93025', marginTop: 4 }}>{erro}</Text>}
    </View>
  );
}