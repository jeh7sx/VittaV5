import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  Image,
  ImageProps,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';
export type TipoItemSucesso = 'medicamento' | 'exame' | 'consulta';

interface ModalSucessoProps {
  visivel: boolean;
  tipo: TipoItemSucesso;
  duracaoMs?: number;
  tituloPersonalizado?: string;
  mensagemPersonalizada?: string;
  onFechar: () => void;
  onVerMais?: () => void;
}

export default function ModalSucesso({
  visivel,
  tipo,
  duracaoMs = 10000,
  tituloPersonalizado,
  mensagemPersonalizada,
  onFechar,
  onVerMais,
}: ModalSucessoProps) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 768;
  const { theme, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onFecharRef = useRef(onFechar);
  const onVerMaisRef = useRef(onVerMais);

  useEffect(() => {
    onFecharRef.current = onFechar;
    onVerMaisRef.current = onVerMais;
  }, [onFechar, onVerMais]);

  const configuracoes: Record<
    TipoItemSucesso,
    { titulo: string; mensagem: string }
  > = {
    medicamento: {
      titulo: 'Medicamento adicionado\ncom sucesso',
      mensagem:
        'Seu medicamento foi cadastrado e os horários já foram programados.',
    },
    exame: {
      titulo: 'Exame adicionado\ncom sucesso',
      mensagem:
        'Seu exame foi cadastrado com sucesso e já está disponível para acompanhamento.',
    },
    consulta: {
      titulo: 'Consulta adicionada\ncom sucesso',
      mensagem:
        'Sua consulta foi agendada e adicionada à rotina com sucesso.',
    },
  };

  const configAtual = configuracoes[tipo] || configuracoes.medicamento;
  const textoTitulo = tituloPersonalizado || configAtual.titulo;
  const textoMensagem = mensagemPersonalizada || configAtual.mensagem;

  function fecharComAnimacao(callback?: () => void) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      if (callback) {
        callback();
      } else {
        onFecharRef.current();
      }
    });
  }

  useEffect(() => {
    if (visivel) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();

      timerRef.current = setTimeout(() => {
        fecharComAnimacao();
      }, duracaoMs);
    } else {
      fadeAnim.setValue(0);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visivel, duracaoMs]);

  if (!visivel) return null;

  return (
    <Modal
      transparent
      visible={visivel}
      animationType="none"
      onRequestClose={() => fecharComAnimacao()}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              maxWidth: isNarrow ? '90%' : 480,
              backgroundColor: isDark ? '#14301B' : '#2EA043',
              borderWidth: 1,
              borderColor: isDark ? '#22543D' : 'transparent',
            },
          ]}
        >
          <View style={styles.circuloExterno}>
            <View style={[styles.circuloInterno, { backgroundColor: isDark ? '#22543D' : '#6FCF42' }]}>
              {/* <Text style={styles.iconeCheck}>✓</Text> */}
              <Image source={require('@/img/icons/check.svg')} style={{ tintColor: '#fff', width: 48, height: 48 }}></Image>
            </View>
          </View>

          <Text style={[styles.titulo, tipografia.h2]}>{textoTitulo}</Text>
          <Text style={styles.mensagem}>{textoMensagem}</Text>

          <TouchableOpacity
            style={[styles.botaoEntendido, { backgroundColor: theme.cardBg }]}
            activeOpacity={0.85}
            onPress={() => fecharComAnimacao(onFecharRef.current)}
          >
            <Text style={[styles.textoEntendido, { color: isDark ? '#86EFAC' : '#2EA043' }]}>Entendido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoVerMais}
            activeOpacity={0.7}
            onPress={() =>
              fecharComAnimacao(() => {
                if (onVerMaisRef.current) {
                  onVerMaisRef.current();
                } else {
                  onFecharRef.current();
                }
              })
            }
          >
            <Text style={styles.textoVerMais}>Ver mais</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  circuloExterno: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  circuloInterno: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  iconeCheck: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 46,
  },
  titulo: {
    fontSize: 24,
    // fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  mensagem: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  botaoEntendido: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textoEntendido: {
    fontSize: 16,
    fontWeight: '600',
  },
  botaoVerMais: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  textoVerMais: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});