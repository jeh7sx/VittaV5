import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { createPost } from '../../services/postService';
import { Post } from '../../types/post';

interface CriarPostModalProps {
  visivel: boolean;
  onFechar: () => void;
  onPostCriado: (novoPost: Post) => void;
  usuarioLogado: {
    uid: string;
    displayName?: string | null;
    photoURL?: string | null;
  };
}

const TAGS_DISPONIVEIS = ['Rotina', 'Dicas', 'Apoio', 'Dúvidas', 'Conquistas'];

export const CriarPostModal: React.FC<CriarPostModalProps> = ({
  visivel,
  onFechar,
  onPostCriado,
  usuarioLogado,
}) => {
  const [texto, setTexto] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagSelecionada, setTagSelecionada] = useState('Rotina');
  const [salvando, setSalvando] = useState(false);

  const handlePublicar = async () => {
    if (!texto.trim() && !imageUrl.trim()) return;

    setSalvando(true);
    try {
      const novoPost = await createPost({
        userId: usuarioLogado.uid,
        userName: usuarioLogado.displayName || 'Responsável Vitta',
        userPhoto: usuarioLogado.photoURL || null,
        text: texto.trim(),
        imageUrl: imageUrl.trim() || null,
        tag: tagSelecionada,
      });

      onPostCriado(novoPost);
      setTexto('');
      setImageUrl('');
      onFechar();
    } catch (err) {
      console.error('Erro ao publicar:', err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>Nova publicação</Text>
            <TouchableOpacity onPress={onFechar} disabled={salvando}>
              <Text style={styles.fecharTexto}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Seletor de Categoria/Tag */}
            <Text style={styles.label}>Escolha um tema:</Text>
            <View style={styles.tagsContainer}>
              {TAGS_DISPONIVEIS.map((tag) => {
                const ativa = tagSelecionada === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setTagSelecionada(tag)}
                    style={[styles.tagBotao, ativa && styles.tagBotaoAtivo]}
                  >
                    <Text style={[styles.tagTexto, ativa && styles.tagTextoAtivo]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Caixa de Texto */}
            <TextInput
              style={styles.inputArea}
              placeholder="Compartilhe como foi o dia, um relato ou dica com outros responsáveis..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={texto}
              onChangeText={setTexto}
            />

            {/* Campo de Imagem (URL) */}
            <TextInput
              style={styles.inputSimples}
              placeholder="URL de imagem (opcional)"
              placeholderTextColor="#999"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelarBotao}
              onPress={onFechar}
              disabled={salvando}
            >
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.publicarBotao,
                (!texto.trim() && !imageUrl.trim()) && styles.publicarDesativado,
              ]}
              onPress={handlePublicar}
              disabled={salvando || (!texto.trim() && !imageUrl.trim())}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#1A1A1A" />
              ) : (
                <Text style={styles.publicarTexto}>➔ Publicar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#181818',
  },
  fecharTexto: {
    fontSize: 18,
    color: '#888',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagBotao: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  tagBotaoAtivo: {
    backgroundColor: '#FFF8ED',
    borderColor: '#E5A00D',
  },
  tagTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tagTextoAtivo: {
    color: '#A06800',
  },
  inputArea: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#222',
    textAlignVertical: 'top',
    minHeight: 110,
    marginBottom: 14,
  },
  inputSimples: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelarBotao: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancelarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  publicarBotao: {
    backgroundColor: '#E5A00D',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicarDesativado: {
    opacity: 0.5,
  },
  publicarTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});