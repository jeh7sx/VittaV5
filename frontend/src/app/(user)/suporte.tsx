import React, { useState, useEffect } from 'react';
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
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/services/firebase';
import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';

export default function SuporteUserScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  // Estados dos inputs
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

  // Puxa automaticamente o nome e e-mail do usuário autenticado
  useEffect(() => {
    async function carregarDadosUsuario() {
      const usuario = auth.currentUser;
      if (!usuario) return;

      // 1. Preenchimento padrão imediato via Auth
      if (usuario.email) {
        setEmailRemetente(usuario.email);
      }
      if (usuario.displayName) {
        setNome(usuario.displayName);
      }

      // 2. Busca o nome cadastrado no Firestore (coleção 'usuarios')
      try {
        const snap = await getDoc(doc(db, 'usuarios', usuario.uid));
        if (snap.exists() && snap.data().nome) {
          setNome(snap.data().nome);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do perfil para suporte:', err);
      }
    }

    carregarDadosUsuario();
  }, []);

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
    const corpoFormatado = `Olá, equipe Vitta!

Meu nome: ${nome.trim() || 'Não informado'}
Meu e-mail de contato: ${emailRemetente.trim() || 'Não informado'}
Tipo de solicitação: ${tipoAjuda}

----------------------------------------
MENSAGEM:
${mensagem.trim()}
----------------------------------------

Enviado através da plataforma Vitta.`;

    // 1. Tratamento específico para Web: abre o Gmail web diretamente
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlGmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        emailDestino
      )}&su=${encodeURIComponent(assuntoFormatado)}&body=${encodeURIComponent(
        corpoFormatado
      )}`;

      window.open(urlGmailWeb, '_blank');
      return;
    }

    // 2. Tratamento para Dispositivos Móveis (Android/iOS): abre o app nativo de e-mail
    const urlMailto = `mailto:${emailDestino}?subject=${encodeURIComponent(
      assuntoFormatado
    )}&body=${encodeURIComponent(corpoFormatado)}`;

    try {
      const suportaMailto = await Linking.canOpenURL(urlMailto);
      if (suportaMailto) {
        await Linking.openURL(urlMailto);
      } else {
        Alert.alert(
          'Aviso',
          `Não foi possível abrir o aplicativo de e-mail. Por favor, envie diretamente para ${emailDestino}`
        );
      }
    } catch (err) {
      console.error('Erro ao abrir mailto:', err);
      Alert.alert('Erro', `Envie a sua mensagem para: ${emailDestino}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.botaoVoltar,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.textoVoltar, { color: theme.textPrimary }]}>← Voltar</Text>
          </TouchableOpacity>

          <View
            style={[
              styles.tagHeader,
              { backgroundColor: theme.yellow1 },
            ]}
          >
            <Text style={[styles.tagTexto, { color: theme.yellow9 }]}>
              Atendimento & Ajuda
            </Text>
          </View>
          <Text style={[tipografia.h2, { color: theme.textPrimary, marginBottom: 8 }]}>
            Fale com o Suporte Vitta
          </Text>
          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            Estamos aqui para apoiar sua família. Preencha os campos abaixo para nos enviar uma mensagem diretamente.
          </Text>
        </View>

        {/* Card do Formulário */}
        <View
          style={[
            styles.cardForm,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          {/* Destinatário Fixo */}
          <View style={[styles.destinatarioBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Text style={[styles.destinatarioLabel, { color: theme.textSecondary }]}>Para:</Text>
            <Text style={[styles.destinatarioEmail, { color: theme.textPrimary }]}>{emailDestino}</Text>
          </View>

          {/* Seleção do Tipo de Solicitação */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Motivo do Contato</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {tiposDisponiveis.map((tipo) => {
                const ativo = tipoAjuda === tipo;
                return (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: ativo ? theme.yellow5 : theme.inputBg,
                        borderColor: ativo ? 'transparent' : theme.border,
                      },
                    ]}
                    onPress={() => setTipoAjuda(tipo)}
                  >
                    <Text
                      style={[
                        styles.chipTexto,
                        {
                          color: ativo ? (isDark ? '#000000' : theme.yellow9) : theme.textSecondary,
                          fontWeight: ativo ? '700' : '500',
                        },
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Nome */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Seu Nome</Text>
          <TextInput
            placeholder="Como prefere ser chamado(a)?"
            placeholderTextColor={theme.gray4}
            value={nome}
            onChangeText={setNome}
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary },
            ]}
          />

          {/* E-mail para resposta */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Seu E-mail para retorno</Text>
          <TextInput
            placeholder="exemplo@email.com"
            placeholderTextColor={theme.gray4}
            value={emailRemetente}
            onChangeText={setEmailRemetente}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary },
            ]}
          />

          {/* Assunto */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Assunto *</Text>
          <TextInput
            placeholder="Resumo da sua dúvida ou solicitação"
            placeholderTextColor={theme.gray4}
            value={assunto}
            onChangeText={setAssunto}
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary },
            ]}
          />

          {/* Mensagem */}
          <Text style={[styles.label, { color: theme.textPrimary }]}>Mensagem *</Text>
          <TextInput
            placeholder="Escreva detalhadamente o que você precisa..."
            placeholderTextColor={theme.gray4}
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            numberOfLines={5}
            style={[
              styles.input,
              styles.inputMultiline,
              { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary },
            ]}
          />

          {/* Botão de Enviar */}
          <View style={{ marginTop: 16 }}>
            <ButtonPrimary
              texto={`Enviar E-mail para ${emailDestino} ➔`}
              onPress={handleEnviarEmail}
            />
          </View>
        </View>

        {/* Informações Adicionais */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark ? '#2B1F0A' : '#FFFBEB',
              borderColor: isDark ? '#5E410E' : '#FDE68A',
            },
          ]}
        >
          <Text style={[styles.infoTitulo, { color: isDark ? '#FCD34D' : '#92400E' }]}>
            🕒 Tempo de Resposta
          </Text>
          <Text style={[styles.infoTexto, { color: isDark ? '#FDE68A' : '#78350F' }]}>
            Nossa equipe responde a todas as mensagens em até 24 a 48 horas úteis. Em casos de urgência médica com seu filho, procure sempre o pronto-atendimento oncológico de referência.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 18,
    paddingTop: Platform.OS === 'web' ? 36 : 20,
    paddingBottom: 40,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
  botaoVoltar: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  textoVoltar: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagHeader: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  tagTexto: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardForm: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
  },
  destinatarioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  destinatarioLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  destinatarioEmail: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  chipsScroll: {
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipTexto: {
    fontSize: 12.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  infoBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoTexto: {
    fontSize: 12.5,
    lineHeight: 19,
  },
});