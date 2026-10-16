import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';

export const AppDemoMockup: React.FC = () => {
  const [fase, setFase] = useState<number>(0);

  // Ciclo da animação interativa (0 = mensagem, 1 = IA responde + card, 2 = notificação surge)
  useEffect(() => {
    const timer = setInterval(() => {
      setFase((prev) => (prev >= 2 ? 0 : prev + 1));
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Moldura do Smartphone */}
      <View style={styles.phoneFrame}>
        {/* Dynamic Island / Notch */}
        <View style={styles.notch}>
          <View style={styles.cameraDot} />
        </View>

        {/* Notificação Push Flutuante (Fase 2) */}
        {fase === 2 && (
          <View style={styles.pushNotification}>
            <View style={styles.pushIcone}>
              <Text style={{ fontSize: 13 }}>💊</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.pushHeader}>
                <Text style={styles.pushTitulo}>Lembrete Vitta</Text>
                <Text style={styles.pushHora}>Agora</Text>
              </View>
              <Text style={styles.pushCorpo}>
                Hora de dar <Text style={{ fontWeight: '700' }}>Ondansetrona 4mg</Text> para a Mavie.
              </Text>
            </View>
          </View>
        )}

        {/* Header do App dentro da tela */}
        <View style={styles.appHeader}>
          <View style={styles.appHeaderInfo}>
            <View style={styles.appAvatar}>
              <Text style={{ fontSize: 13 }}>💛</Text>
            </View>
            <View>
              <Text style={styles.appNome}>Vitta IA</Text>
              <Text style={styles.appSub}>Rotina de Mavie</Text>
            </View>
          </View>
          <View style={styles.badgeAtivo}>
            <Text style={styles.badgeAtivoTexto}>● Ativa</Text>
          </View>
        </View>

        {/* Conteúdo do Chat no Celular */}
        <View style={styles.appBody}>
          {/* Mensagem 1: Mãe/Pai envia */}
          <View style={styles.balaoUsuario}>
            <Text style={styles.textoUsuario}>
              "O médico receitou Ondansetrona 4mg de 8 em 8 horas para enjoo"
            </Text>
            <Text style={styles.horaUsuario}>08:30 ✓✓</Text>
          </View>

          {/* Mensagem 2 & Card da IA (Fase 1 e 2) */}
          {fase >= 1 && (
            <View style={styles.balaoIA}>
              <Text style={styles.textoIA}>
                Perfeito! Já organizei os horários das doses na rotina:
              </Text>

              {/* Card Estruturado de Remédio */}
              <View style={styles.cardRemedio}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardRemedioTitulo}>💊 Ondansetrona</Text>
                  <Text style={styles.cardDosagem}>4mg</Text>
                </View>
                <Text style={styles.cardFrequencia}>A cada 8 horas (08h • 16h • 00h)</Text>

                <View style={styles.cardStatusRow}>
                  <View style={styles.badgeSalvo}>
                    <Text style={styles.badgeSalvoTexto}>✓ Agendado na rotina</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Input Bar Simulado */}
        <View style={styles.appInputBar}>
          <View style={styles.fakeInput}>
            <Text style={styles.fakeInputTexto}>Pergunte ou agende algo...</Text>
          </View>
          <View style={styles.fakeBtnSend}>
            <Text style={{ color: '#111', fontWeight: 'bold' }}>➜</Text>
          </View>
        </View>
      </View>

      {/* Indicador de Passos / Timeline abaixo do Celular */}
      <View style={styles.timeline}>
        <TouchableOpacity
          onPress={() => setFase(0)}
          style={[styles.stepItem, fase === 0 && styles.stepItemAtivo]}
        >
          <Text style={[styles.stepTexto, fase === 0 && styles.stepTextoAtivo]}>1. Envie uma mensagem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFase(1)}
          style={[styles.stepItem, fase === 1 && styles.stepItemAtivo]}
        >
          <Text style={[styles.stepTexto, fase === 1 && styles.stepTextoAtivo]}>2. IA gera o horário</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFase(2)}
          style={[styles.stepItem, fase === 2 && styles.stepItemAtivo]}
        >
          <Text style={[styles.stepTexto, fase === 2 && styles.stepTextoAtivo]}>3. Lembrete automático</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },

  // --- Frame do Celular ---
  phoneFrame: {
    width: 320,
    height: 520,
    backgroundColor: '#FAFAFC',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#1E1E24',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    flexDirection: 'column',
  },

  notch: {
    width: 90,
    height: 18,
    backgroundColor: '#1E1E24',
    alignSelf: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  cameraDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D0D11',
  },

  // --- Push Notification ---
  pushNotification: {
    position: 'absolute',
    top: 26,
    left: 12,
    right: 12,
    backgroundColor: '#1E1E24',
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  pushIcone: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFF4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pushHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  pushTitulo: {
    color: '#F7B500',
    fontSize: 11,
    fontWeight: '700',
  },
  pushHora: {
    color: '#8E8E9E',
    fontSize: 10,
  },
  pushCorpo: {
    color: '#FFFFFF',
    fontSize: 11.5,
    lineHeight: 15,
  },

  // --- Header do App ---
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  appHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appNome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1E',
  },
  appSub: {
    fontSize: 10,
    color: '#6B6B7B',
  },
  badgeAtivo: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAtivoTexto: {
    color: '#166534',
    fontSize: 9.5,
    fontWeight: '700',
  },

  // --- Corpo do Chat ---
  appBody: {
    flex: 1,
    padding: 12,
    gap: 10,
    justifyContent: 'flex-start',
  },
  balaoUsuario: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E1E24',
    padding: 10,
    borderRadius: 14,
    borderTopRightRadius: 2,
    maxWidth: '85%',
  },
  textoUsuario: {
    color: '#FFFFFF',
    fontSize: 11.5,
    lineHeight: 16,
  },
  horaUsuario: {
    color: '#8E8E9E',
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  balaoIA: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 14,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#EBEBF2',
    maxWidth: '92%',
  },
  textoIA: {
    color: '#272730',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },

  // --- Card do Remédio ---
  cardRemedio: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardRemedioTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  cardDosagem: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    color: '#78350F',
  },
  cardFrequencia: {
    fontSize: 10.5,
    color: '#78350F',
    marginBottom: 6,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeSalvo: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSalvoTexto: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#166534',
  },

  // --- Input Simulado ---
  appInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEDF2',
    gap: 6,
  },
  fakeInput: {
    flex: 1,
    backgroundColor: '#F4F4F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  fakeInputTexto: {
    fontSize: 10.5,
    color: '#9E9EAC',
  },
  fakeBtnSend: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F7B500',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Timeline Inferior ---
  timeline: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stepItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2EA',
  },
  stepItemAtivo: {
    backgroundColor: '#1E1E24',
    borderColor: '#1E1E24',
  },
  stepTexto: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B6B7B',
  },
  stepTextoAtivo: {
    color: '#FFFFFF',
  },
});