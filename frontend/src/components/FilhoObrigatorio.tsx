import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import CadastroFilho from './CadastroFilho';
import { auth, db } from '../services/firebase';

type CadastroFilhoObrigatorioModalProps = {
  onFilhoCadastrado?: (
    filhosIds: string[],
  ) => void | Promise<void>;
};

/**
 * Verifica em tempo real se o responsável autenticado possui algum filho,
 * checando tanto por 'responsaveisIds' (múltiplos responsáveis) quanto por 'responsavelId' (legado).
 */
export default function CadastroFilhoObrigatorioModal({
  onFilhoCadastrado,
}: CadastroFilhoObrigatorioModalProps) {
  const [verificando, setVerificando] = useState(true);
  const [deveCadastrar, setDeveCadastrar] = useState(false);

  useEffect(() => {
    let cancelar1: undefined | (() => void);
    let cancelar2: undefined | (() => void);

    const cancelarAuth = onAuthStateChanged(auth, usuario => {
      cancelar1?.();
      cancelar2?.();
      cancelar1 = undefined;
      cancelar2 = undefined;

      if (!usuario) {
        setDeveCadastrar(false);
        setVerificando(false);
        return;
      }

      setVerificando(true);

      let temFilhoNovo = false;
      let temFilhoLegado = false;

      const verificarStatus = () => {
        setDeveCadastrar(!temFilhoNovo && !temFilhoLegado);
        setVerificando(false);
      };

      // 1. Consulta no array responsaveisIds
      const consultaArray = query(
        collection(db, 'filhos'),
        where('responsaveisIds', 'array-contains', usuario.uid),
        limit(1)
      );

      // 2. Consulta no campo legado responsavelId
      const consultaLegado = query(
        collection(db, 'filhos'),
        where('responsavelId', '==', usuario.uid),
        limit(1)
      );

      cancelar1 = onSnapshot(
        consultaArray,
        snapshot => {
          temFilhoNovo = !snapshot.empty;
          verificarStatus();
        },
        erro => {
          console.error('Erro ao verificar filhos no array:', erro);
          verificarStatus();
        }
      );

      cancelar2 = onSnapshot(
        consultaLegado,
        snapshot => {
          temFilhoLegado = !snapshot.empty;
          verificarStatus();
        },
        erro => {
          console.error('Erro ao verificar filhos legados:', erro);
          verificarStatus();
        }
      );
    });

    return () => {
      cancelar1?.();
      cancelar2?.();
      cancelarAuth();
    };
  }, []);

  async function concluirCadastro(filhosIds: string[]) {
    setDeveCadastrar(false);

    try {
      await onFilhoCadastrado?.(filhosIds);
    } catch (erro) {
      console.error('Erro ao concluir o cadastro do filho:', erro);
    }
  }

  if (verificando) {
    return (
      <View style={styles.verificacao} pointerEvents="none">
        <ActivityIndicator size="small" color="#F7B500" />
        <Text style={styles.textoVerificacao}>Verificando dependentes...</Text>
      </View>
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={deveCadastrar}
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <CadastroFilho
        onConcluir={concluirCadastro}
        mostrarCancelar={false}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  verificacao: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 9999,
    elevation: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },

  textoVerificacao: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
});