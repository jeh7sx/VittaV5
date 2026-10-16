import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useConvites } from '@/hooks/useConvites';
import { ParentescoResponsavel } from '@/types/convites';
import ButtonPrimary from './Buttons/ButtonPrimary';

interface Props {
  visivel: boolean;
  aoFechar: () => void;
  filhoId: string;
  nomeFilho: string;
}

export default function ModalConvidarResponsavel({ visivel, aoFechar, filhoId, nomeFilho }: Props) {
  const [email, setEmail] = useState('');
  const [parentesco, setParentesco] = useState<ParentescoResponsavel>('pai');
  const { enviarConvite, enviando } = useConvites();

  const handleEnviar = async () => {
    await enviarConvite({
      filhoIdAlvo: filhoId,
      nomeFilho,
      emailDestino: email,
      parentesco,
    });
    setEmail('');
    aoFechar();
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ width: '100%', minWidth: 800, backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1A1A' }}>Convidar Outro Responsável</Text>
          <Text style={{ fontSize: 16, color: '#666' }}>
            Compartilhe os cuidados de {nomeFilho} com o pai, mãe ou outro cuidador.
          </Text>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>E-mail do responsável</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 12, fontSize: 14 }}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }}>Parentesco</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['pai', 'mae', 'padrasto', 'madrasta', 'cuidador'] as ParentescoResponsavel[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setParentesco(p)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: parentesco === p ? '#F7B500' : '#E0E0E0',
                    backgroundColor: parentesco === p ? '#FFF8E1' : '#FFF',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: parentesco === p ? '#8A5B00' : '#666' }}>
                    {p.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <TouchableOpacity onPress={aoFechar} style={{ padding: 12 }}>
              <Text style={{ color: '#888', fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEnviar}
              disabled={enviando}
              style={{ backgroundColor: '#F7B500', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 }}
            >
              {enviando ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar Convite</Text>}
            </TouchableOpacity>
            <ButtonPrimary
              texto='oi'
              onPress={handleEnviar}

            >

            </ButtonPrimary>
          </View>
        </View>
      </View>
    </Modal>
  );
}