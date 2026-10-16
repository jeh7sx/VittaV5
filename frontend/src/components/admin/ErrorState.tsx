import { Text, View } from 'react-native';
import Button from './Button';
import { IconAlert } from '../Icons';

interface ErrorStateProps {
  mensagem: string;
  aoTentarNovamente?: () => void;
}

export default function ErrorState({ mensagem, aoTentarNovamente }: ErrorStateProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 20 }}>
      <View style={{ marginBottom: 14 }}>
        <IconAlert />
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: '#B00020', marginBottom: 4, textAlign: 'center' }}>
        Algo deu errado
      </Text>
      <Text style={{ fontSize: 13, color: '#999', textAlign: 'center', maxWidth: 320, marginBottom: 18 }}>
        {mensagem}
      </Text>
      {aoTentarNovamente && (
        <Button label="Tentar novamente" onPress={aoTentarNovamente} variante="secundaria" tamanho="sm" />
      )}
    </View>
  );
}