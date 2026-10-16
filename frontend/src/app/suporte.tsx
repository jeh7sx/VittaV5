import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';

export default function SuporteScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [emailRemetente, setEmailRemetente] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoAjuda, setTipoAjuda] = useState('Dúvida Geral');

  const emailDestino = 'vittaetec@gmail.com';

  const tiposDisponiveis = [
    'Dúvida Geral',
    'Problema com a Vitta IA',
    'Exames ou Medicamentos',
    'Sugestão de Melhoria',
    'Outro Assunto',
  ];

  const handleEnviarEmail = async () => {
    if (!assunto.trim() || !mensagem.trim()) {
      const msgAlerta = 'Por favor, preencha o assunto e a mensagem antes de enviar.';
      if (Platform.OS === 'web') {
        window.alert(msgAlerta);
      } else {
        Alert.alert('Campos obrigatórios', msgAlerta);
      }
      return;
    }

    const assuntoFormatado = `[Suporte Vitta - ${tipoAjuda}] ${assunto.trim()}`;
    const corpoFormatado = `Olá, equipa Vitta!

Meu nome: ${nome.trim() || 'Não informado'}
Meu e-mail de contacto: ${emailRemetente.trim() || 'Não informado'}
Tipo de solicitação: ${tipoAjuda}

----------------------------------------
MENSAGEM:
${mensagem.trim()}
----------------------------------------

Enviado através do site Vitta.`;

    // 1. Web: Abre diretamente o formulário do Gmail
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlGmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        emailDestino
      )}&su=${encodeURIComponent(assuntoFormatado)}&body=${encodeURIComponent(
        corpoFormatado
      )}`;
      window.open(urlGmailWeb, '_blank');
      return;
    }

    // 2. Mobile: Abre a aplicação padrão de e-mail
    const urlMailto = `mailto:${emailDestino}?subject=${encodeURIComponent(
      assuntoFormatado
    )}&body=${encodeURIComponent(corpoFormatado)}`;

    try {
      const suportaMailto = await Linking.canOpenURL(urlMailto);
      if (suportaMailto) {
        await Linking.openURL(urlMailto);
      } else {
        Alert.alert('Aviso', `Envie um e-mail para: ${emailDestino}`);
      }
    } catch {
      Alert.alert('Erro', `Envie a sua mensagem para: ${emailDestino}`);
    }
  };

  return (
    <View style={styles.container}>
      <PublicNavbar />
      <ScrollView>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
              <Text style={styles.textoVoltar}>← Voltar</Text>
            </TouchableOpacity>

            <View style={styles.tagHeader}>
              <Text style={styles.tagTexto}>Atendimento & Ajuda</Text>
            </View>
            <Text style={styles.titulo}>Fale com o Suporte Vitta</Text>
            <Text style={styles.subtitulo}>
              Estamos aqui para apoiar sua família. Preencha os campos abaixo para nos enviar uma mensagem diretamente.
            </Text>
          </View>

          {/* Card do Formulário */}
          <View style={styles.cardForm}>
            {/* Destinatário Fixo */}
            <View style={styles.destinatarioBox}>
              <Text style={styles.destinatarioLabel}>Para:</Text>
              <Text style={styles.destinatarioEmail}>{emailDestino}</Text>
            </View>

            {/* Motivo do Contacto */}
            <Text style={styles.label}>Motivo do Contato</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <View style={styles.chipsRow}>
                {tiposDisponiveis.map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[styles.chip, tipoAjuda === tipo && styles.chipAtivo]}
                    onPress={() => setTipoAjuda(tipo)}
                  >
                    <Text style={[styles.chipTexto, tipoAjuda === tipo && styles.chipTextoAtivo]}>
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Seu Nome (opcional)</Text>
            <TextInput
              placeholder="Como prefere ser chamado(a)?"
              placeholderTextColor="#9E9EAC"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />

            <Text style={styles.label}>Seu E-mail para retorno (opcional)</Text>
            <TextInput
              placeholder="exemplo@email.com"
              placeholderTextColor="#9E9EAC"
              value={emailRemetente}
              onChangeText={setEmailRemetente}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Assunto *</Text>
            <TextInput
              placeholder="Resumo da sua dúvida ou solicitação"
              placeholderTextColor="#9E9EAC"
              value={assunto}
              onChangeText={setAssunto}
              style={styles.input}
            />

            <Text style={styles.label}>Mensagem *</Text>
            <TextInput
              placeholder="Escreva detalhadamente o que você precisa..."
              placeholderTextColor="#9E9EAC"
              value={mensagem}
              onChangeText={setMensagem}
              multiline
              numberOfLines={6}
              style={[styles.input, styles.inputMultiline]}
            />

            <TouchableOpacity style={styles.botaoEnviar} onPress={handleEnviarEmail} activeOpacity={0.85}>
              <Text style={styles.textoBotaoEnviar}>Enviar E-mail para {emailDestino} ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitulo}>🕒 Tempo de Resposta</Text>
            <Text style={styles.infoTexto}>
              Nossa equipe responde a todas as mensagens em até 24 a 48 horas úteis. Em casos de urgência médica com seu filho, procure sempre o pronto-atendimento oncológico de referência.
            </Text>
          </View>
        </ScrollView>
        <PublicFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 18,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 40,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  botaoVoltar: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2EA',
  },
  textoVoltar: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B4B58',
  },
  tagHeader: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4D6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9C6E00',
    textTransform: 'uppercase',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1E',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B6B7B',
    lineHeight: 22,
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBEBF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  destinatarioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7FA',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  destinatarioLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B6B7B',
  },
  destinatarioEmail: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1A1A1E',
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#3B3B48',
    marginBottom: 6,
    marginTop: 12,
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F4F4F8',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2EA',
  },
  chipAtivo: {
    backgroundColor: '#1E1E24',
    borderColor: '#1E1E24',
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B4B58',
  },
  chipTextoAtivo: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E2EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FAFAFC',
    fontSize: 14,
    color: '#1A1A1E',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  botaoEnviar: {
    backgroundColor: '#F7B500',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  textoBotaoEnviar: {
    color: '#1A1A1E',
    fontWeight: '700',
    fontSize: 14.5,
  },
  infoBox: {
    marginTop: 20,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoTexto: {
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
  },
});