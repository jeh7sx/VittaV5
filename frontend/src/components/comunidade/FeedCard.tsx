import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Post } from '../../types/post';
import { toggleLikePost } from '../../services/postService';

interface FeedCardProps {
  post: Post;
  currentUserId: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, currentUserId }) => {
  const [curtido, setCurtido] = useState(false);
  const [totalLikes, setTotalLikes] = useState(post.likesCount || 0);
  const [processando, setProcessando] = useState(false);

  const handleLike = async () => {
    if (processando || !currentUserId) return;
    setProcessando(true);

    // Atualização otimista na interface
    const proximoEstado = !curtido;
    setCurtido(proximoEstado);
    setTotalLikes((prev) => (proximoEstado ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await toggleLikePost(post.id, currentUserId);
      setCurtido(res.liked);
    } catch (err) {
      // Reverte se falhar
      setCurtido(!proximoEstado);
      setTotalLikes((prev) => (!proximoEstado ? prev + 1 : Math.max(0, prev - 1)));
      console.error('Erro ao curtir post:', err);
    } finally {
      setProcessando(false);
    }
  };

  const formatarData = (dataIso: string) => {
    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.card}>
      {/* Cabeçalho do Autor */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {post.userPhoto ? (
            <Image source={{ uri: post.userPhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {post.userName ? post.userName.charAt(0).toUpperCase() : 'V'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.autorNome}>{post.userName}</Text>
          <Text style={styles.dataTexto}>{formatarData(post.createdAt)}</Text>
        </View>

        {post.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>#{post.tag}</Text>
          </View>
        )}
      </View>

      {/* Conteúdo em Texto */}
      {Boolean(post.text) && (
        <Text style={styles.conteudoTexto}>{post.text}</Text>
      )}

      {/* Imagem da Publicação */}
      {Boolean(post.imageUrl) && (
        <Image
          source={{ uri: post.imageUrl as string }}
          style={styles.postImagem}
          resizeMode="cover"
        />
      )}

      {/* Rodapé de Interações */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.acaoBotao}
          onPress={handleLike}
          disabled={processando}
          activeOpacity={0.7}
        >
          <Text style={[styles.acaoIcone, curtido && styles.coracaoAtivo]}>
            {curtido ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.acaoTexto, curtido && styles.textoCurtido]}>
            {totalLikes} {totalLikes === 1 ? 'curtida' : 'curtidas'}
          </Text>
        </TouchableOpacity>

        <View style={styles.acaoBotao}>
          <Text style={styles.acaoIcone}>💬</Text>
          <Text style={styles.acaoTexto}>
            {post.commentsCount || 0} {post.commentsCount === 1 ? 'comentário' : 'comentários'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3DFC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#342109',
  },
  autorNome: {
    fontSize: 15,
    fontWeight: '700',
    color: '#181818',
  },
  dataTexto: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  tagBadge: {
    backgroundColor: '#FFF8ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECC87C',
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A06800',
  },
  conteudoTexto: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#2C2C2C',
    marginBottom: 12,
  },
  postImagem: {
    width: '100%',
    height: 280,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#F7F7F7',
    paddingTop: 12,
  },
  acaoBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acaoIcone: {
    fontSize: 16,
  },
  coracaoAtivo: {
    transform: [{ scale: 1.1 }],
  },
  acaoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  textoCurtido: {
    color: '#E53935',
  },
});