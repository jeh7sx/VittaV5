import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { MensagemDirect, UsuarioComunidade } from '../../types/comunidade';

interface DirectChatModalProps {
  usuarioLogado: UsuarioComunidade;
  destinatario: UsuarioComunidade | null;
  onFechar: () => void;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  usuarioLogado,
  destinatario,
  onFechar,
}) => {
  const [mensagens, setMensagens] = useState<MensagemDirect[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!destinatario) return null;

  // Gerador de ID determinístico da conversa (ordem alfabética dos uids)
  const chatId =
    usuarioLogado.id < destinatario.id
      ? `${usuarioLogado.id}_${destinatario.id}`
      : `${destinatario.id}_${usuarioLogado.id}`;

  useEffect(() => {
    setCarregando(true);
    const msgsRef = collection(db, 'chats', chatId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista: MensagemDirect[] = snapshot.docs.map((d) => ({
          id: d.id,
          senderId: d.data().senderId,
          text: d.data().text,
          createdAt: d.data().createdAt,
        }));
        setMensagens(lista);
        setCarregando(false);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      },
      (err) => {
        console.error('Erro ao ouvir mensagens:', err);
        setCarregando(false);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  const handleEnviar = async () => {
    if (!novoTexto.trim()) return;
    const msg = novoTexto.trim();
    setNovoTexto('');

    try {
      // 1. Grava no histórico de mensagens
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: usuarioLogado.id,
        text: msg,
        createdAt: serverTimestamp(),
      });

      // 2. Atualiza os metadados da conversa
      await setDoc(
        doc(db, 'chats', chatId),
        {
          participantes: [usuarioLogado.id, destinatario.id],
          participantesInfo: {
            [usuarioLogado.id]: {
              nome: usuarioLogado.nome,
              foto: usuarioLogado.foto || null,
            },
            [destinatario.id]: {
              nome: destinatario.nome,
              foto: destinatario.foto || null,
            },
          },
          ultimaMensagem: msg,
          ultimaMensagemSenderId: usuarioLogado.id,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <View style={styles.floatingChatBox}>
      {/* Header do Chat */}
      <View style={styles.header}>
        <View style={styles.headerUsuario}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>
              {destinatario.nome.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.destinatarioNome}>{destinatario.nome}</Text>
            <Text style={styles.statusOnline}>● Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onFechar} style={styles.fecharBtn}>
          <Text style={styles.fecharBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Mensagens */}
      {carregando ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator color="#E5A00D" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.mensagensScroll}
          contentContainerStyle={{ padding: 12, gap: 8 }}
        >
          {mensagens.length === 0 ? (
            <Text style={styles.semMensagens}>Inicie a conversa com {destinatario.nome}!</Text>
          ) : (
            mensagens.map((m) => {
              const ehMeu = m.senderId === usuarioLogado.id;
              return (
                <View
                  key={m.id}
                  style={[styles.balaoWrapper, ehMeu ? styles.balaoMe : styles.balaoOutro]}
                >
                  <View style={[styles.balao, ehMeu ? styles.balaoFundoMe : styles.balaoFundoOutro]}>
                    <Text style={[styles.balaoTexto, ehMeu ? styles.textoMe : styles.textoOutro]}>
                      {m.text}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Campo de Digitação */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Escreva uma mensagem..."
          placeholderTextColor="#8E8E8E"
          value={novoTexto}
          onChangeText={setNovoTexto}
          onSubmitEditing={handleEnviar}
        />
        <TouchableOpacity style={styles.enviarBtn} onPress={handleEnviar}>
          <Text style={styles.enviarBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingChatBox: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 340,
    height: 440,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 9999,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    backgroundColor: '#181818',
  },
  headerUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DE9E12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#181818',
    fontWeight: '800',
    fontSize: 14,
  },
  destinatarioNome: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  statusOnline: {
    color: '#4CAF50',
    fontSize: 10.5,
    fontWeight: '600',
  },
  fecharBtn: {
    padding: 4,
  },
  fecharBtnText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  mensagensScroll: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  semMensagens: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12.5,
  },
  balaoWrapper: {
    flexDirection: 'row',
  },
  balaoMe: {
    justifyContent: 'flex-end',
  },
  balaoOutro: {
    justifyContent: 'flex-start',
  },
  balao: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  balaoFundoMe: {
    backgroundColor: '#E5A00D',
    borderBottomRightRadius: 4,
  },
  balaoFundoOutro: {
    backgroundColor: '#262626',
    borderBottomLeftRadius: 4,
  },
  balaoTexto: {
    fontSize: 13,
    lineHeight: 18,
  },
  textoMe: {
    color: '#181818',
    fontWeight: '500',
  },
  textoOutro: {
    color: '#FAFAFA',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#181818',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#FFF',
    fontSize: 13,
  },
  enviarBtn: {
    paddingHorizontal: 10,
  },
  enviarBtnText: {
    color: '#E5A00D',
    fontWeight: '700',
    fontSize: 13,
  },
});