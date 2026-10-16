import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { useTheme } from '@/context/ThemeContext';
import { gerarTema } from '@/styles/themes';
import { tipografia } from '@/styles/tipografia';

const defaultTheme = gerarTema('ouro', 'claro');

export default function PrivacidadeScreen() {
  const router = useRouter();

  // Fallback seguro caso o ThemeProvider ainda não tenha montado
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;
  const isDark = themeContext?.isDark ?? false;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PublicNavbar />

      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: theme.bg }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MIOLO CENTRALIZADO COM LARGURA MÁXIMA */}
        <View style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                alignSelf: 'flex-start',
                marginBottom: 16,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: theme.cardBg,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary }}>← Voltar</Text>
            </TouchableOpacity>

            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: theme.yellow1,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: theme.yellow5,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FFF' : theme.yellow9, textTransform: 'uppercase' }}>
                Privacidade & LGPD
              </Text>
            </View>
            <Text style={[tipografia.h2, { color: theme.textPrimary, marginBottom: 8 }]}>
              Política de Privacidade
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
              Como tratamos, protegemos e armazenamos com rigor ético os dados de saúde da sua família.
            </Text>
          </View>

          {/* Conteúdo */}
          <View
            style={{
              backgroundColor: theme.cardBg,
              padding: 24,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 20,
            }}
          >
            <View style={{ gap: 8 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>1. Compromisso com a Proteção de Dados</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
                O Vitta tem como prioridade máxima o sigilo, a segurança e a conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), em especial no que tange a dados sensíveis de saúde de crianças e adolescentes.
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>2. Dados Coletados</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
                Coletamos apenas as informações estritamente necessárias para o funcionamento da plataforma:
              </Text>
              <Text style={{ fontSize: 13.5, color: theme.textSecondary, lineHeight: 20, marginLeft: 6 }}>
                • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Dados do Responsável:</Text> Nome, e-mail e identificador de autenticação.
              </Text>
              <Text style={{ fontSize: 13.5, color: theme.textSecondary, lineHeight: 20, marginLeft: 6 }}>
                • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Dados do Paciente:</Text> Nome/apelido do dependente e histórico de exames, medicamentos, receitas e consultas cadastrados por você.
              </Text>
              <Text style={{ fontSize: 13.5, color: theme.textSecondary, lineHeight: 20, marginLeft: 6 }}>
                • <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Conversas com a IA:</Text> Mensagens enviadas temporariamente para processamento de agendamentos e esclarecimento de dúvidas.
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>3. Política de Retenção e Expiração (3 Dias)</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
                Para minimizar o armazenamento desnecessário de dados, as conversas interativas com a Vitta IA permanecem ativas por um ciclo de 3 dias de inatividade, sendo descartadas automaticamente caso não haja novas mensagens no chat.
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>4. Não Comercialização de Informações</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
                Os dados de saúde cadastrados no Vitta <Text style={{ fontWeight: '700', color: theme.textPrimary }}>NUNCA</Text> são vendidos, alugados ou compartilhados com corretoras de seguro, laboratórios farmacêuticos ou empresas de publicidade.
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>5. Direitos do Titular (Exclusão e Portabilidade)</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
                Você tem o direito de solicitar a qualquer momento a exclusão completa da sua conta e de todos os registros de exames e dependentes associados. Basta entrar em contato pelo suporte oficial: <Text style={{ fontWeight: '700', color: theme.yellow6 }}>vittaetec@gmail.com</Text>.
              </Text>
            </View>
          </View>
        </View>

        {/* ESPAÇADOR E FOOTER EM LARGURA TOTAL (100%) */}
        <View style={{ height: 40 }} />
        <PublicFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 18,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
});