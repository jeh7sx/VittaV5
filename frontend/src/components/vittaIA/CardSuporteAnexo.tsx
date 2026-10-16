import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tipografia } from '@/styles/tipografia';
import { SuporteData } from '@/types/vittaIa';

interface Props {
  dados: SuporteData;
  onFechar?: () => void;
}

export const CardSuporteAnexo: React.FC<Props> = ({ dados, onFechar }) => {
  const emailDestino = 'vittaetec@gmail.com';

  const [assunto, setAssunto] = useState(
    dados.assunto || 'Solicitação de Suporte Vitta - Dúvidas'
  );
  const [corpo, setCorpo] = useState(
    dados.corpo ||
      `Olá equipe Vitta,\n\nPreciso de suporte com a seguinte questão:\n[Descreva sua dúvida aqui]\n`
  );

  const handleEnviarEmail = () => {
    const assuntoCodificado = encodeURIComponent(assunto.trim());
    const corpoCodificado = encodeURIComponent(corpo.trim());

    if (Platform.OS === 'web') {
      // Abre direto na tela de novo e-mail do Gmail Web para não dar tela em branco
      const urlGmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailDestino}&su=${assuntoCodificado}&body=${corpoCodificado}`;
      
      try {
        window.open(urlGmailWeb, '_blank', 'noopener,noreferrer');
      } catch (err) {
        window.location.href = urlGmailWeb;
      }

      // Fecha o card para voltar ao chat normal
      if (onFechar) {
        onFechar();
      }
      return;
    }

    // Para Mobile (Android / iOS)
    const mailtoUrl = `mailto:${emailDestino}?subject=${assuntoCodificado}&body=${corpoCodificado}`;
    Linking.openURL(mailtoUrl)
      .then(() => {
        if (onFechar) onFechar();
      })
      .catch(() => {
        Alert.alert(
          'Atenção',
          `Não foi possível abrir o aplicativo de e-mail. Por favor, envie diretamente para: ${emailDestino}`
        );
      });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.iconeWrapper}>
          <Ionicons name="mail-unread-outline" size={24} color="#D97706" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={tipografia.h3}>Solicitação de Suporte Humano</Text>
          <Text style={tipografia.caption}>Canal direto com a equipe Vitta</Text>
        </View>

        {onFechar && (
          <TouchableOpacity
            onPress={onFechar}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.botaoFecharIcone}
          >
            <Ionicons name="close" size={20} color="#71717A" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.destinatarioBox}>
        <Text style={styles.label}>Destinatário:</Text>
        <Text style={styles.emailTexto}>{emailDestino}</Text>
      </View>

      <View style={styles.grupoInput}>
        <Text style={styles.labelCampo}>Assunto</Text>
        <TextInput
          value={assunto}
          onChangeText={setAssunto}
          placeholder="Assunto do e-mail"
          placeholderTextColor="#9CA3AF"
          style={styles.inputAssunto}
        />
      </View>

      <View style={styles.grupoInput}>
        <Text style={styles.labelCampo}>Mensagem / Descrição</Text>
        <TextInput
          value={corpo}
          onChangeText={setCorpo}
          multiline
          numberOfLines={4}
          placeholder="Descreva a sua dúvida para o suporte..."
          placeholderTextColor="#9CA3AF"
          style={styles.inputCorpo}
        />
      </View>

      <View style={styles.acoesContainer}>
        {onFechar && (
          <TouchableOpacity
            style={styles.botaoCancelar}
            activeOpacity={0.7}
            onPress={onFechar}
          >
            <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botaoEnviar}
          activeOpacity={0.85}
          onPress={handleEnviarEmail}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
          <Text style={styles.textoBotao}>Abrir e-mail para enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconeWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoFecharIcone: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  destinatarioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emailTexto: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  grupoInput: {
    marginBottom: 14,
  },
  labelCampo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputAssunto: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    color: '#1F2937',
  },
  inputCorpo: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 90,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  acoesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBotaoCancelar: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  botaoEnviar: {
    flex: 2,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});