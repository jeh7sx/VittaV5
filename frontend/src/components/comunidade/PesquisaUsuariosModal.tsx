import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { UsuarioComunidade } from '../../types/comunidade';

interface PesquisaUsuariosModalProps {
  visivel: boolean;
  onFechar: () => void;
  usuarios: UsuarioComunidade[];
  onSelecionarUsuario: (usuario: UsuarioComunidade) => void;
}

export const PesquisaUsuariosModal: React.FC<PesquisaUsuariosModalProps> = ({
  visivel,
  onFechar,
  usuarios,
  onSelecionarUsuario,
}) => {
  const [busca, setBusca] = useState('');

  const filtrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Pesquisar Responsáveis</Text>
            <TouchableOpacity onPress={onFechar}>
              <Text style={styles.fecharText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Buscar por nome..."
            placeholderTextColor="#8E8E8E"
            value={busca}
            onChangeText={setBusca}
            autoFocus
          />

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {filtrados.length === 0 ? (
              <Text style={styles.vazioText}>Nenhum responsável encontrado.</Text>
            ) : (
              filtrados.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.itemUsuario}
                  onPress={() => {
                    onSelecionarUsuario(u);
                    onFechar();
                  }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{u.nome.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeText}>{u.nome}</Text>
                    <Text style={styles.subText}>Membro da Comunidade Vitta</Text>
                  </View>
                  <Text style={styles.conectarText}>Conversar ➔</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  fecharText: {
    color: '#8E8E8E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 14,
  },
  vazioText: {
    color: '#777',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13,
  },
  itemUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5A00D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#181818',
    fontWeight: '800',
    fontSize: 15,
  },
  nomeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subText: {
    color: '#8E8E8E',
    fontSize: 11.5,
  },
  conectarText: {
    color: '#E5A00D',
    fontSize: 12.5,
    fontWeight: '700',
  },
});