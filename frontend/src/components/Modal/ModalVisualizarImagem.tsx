import React from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import ButtonPrimary from '../Buttons/ButtonPrimary';
import ButtonSecondary from '../Buttons/ButtonSecondary';
import { useTheme } from '@/context/ThemeContext';

interface ModalVisualizarImagemProps {
  imagemUri: string | null;
  nomeArquivo?: string;
  onClose: () => void;
}

export default function ModalVisualizarImagem({
  imagemUri,
  nomeArquivo = 'exame-vitta',
  onClose,
}: ModalVisualizarImagemProps) {
  const { theme, isDark } = useTheme();

  if (!imagemUri) return null;

  async function baixarImagem() {
    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = imagemUri!;
        link.download = `${nomeArquivo}-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        Alert.alert('Download', 'Imagem pronta para download.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível fazer o download da imagem.');
    }
  }

  return (
    <Modal animationType="fade" transparent visible={!!imagemUri} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.88)' : 'rgba(244, 244, 244, 0.92)' }]}>
        <View style={styles.barraAcoes}>
          <ButtonPrimary
            texto="Baixar Imagem"
            onPress={baixarImagem}
            icone={require('@/img/icons/image-down.svg')}
          />
          <ButtonSecondary
            texto="Fechar"
            onPress={onClose}
            icone={require('@/img/icons/x.svg')}
          />
        </View>

        <View style={[styles.imagemContainer, { borderColor: theme.border }]}>
          <Image source={{ uri: imagemUri }} style={styles.imagem} resizeMode="contain" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 99999,
  },
  barraAcoes: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100000,
  },
  imagemContainer: {
    width: '92%',
    height: '82%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
});