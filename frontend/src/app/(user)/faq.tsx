import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';

interface ItemFAQ {
  id: string;
  categoria: 'geral' | 'ia' | 'seguranca' | 'rotina';
  pergunta: string;
  resposta: string;
}

const FAQ_DATA: ItemFAQ[] = [
  {
    id: '1',
    categoria: 'ia',
    pergunta: 'A Vitta IA dá diagnósticos médicos ou substitui o médico?',
    resposta:
      'Não. A Vitta IA é estritamente uma assistente de apoio organizacional e educativo. Ela ajuda a explicar termos médicos difíceis e a cadastrar exames, consultas e medicamentos na rotina do seu filho, mas nunca altera tratamentos, não prescreve remédios e não faz diagnósticos.',
  },
  {
    id: '2',
    categoria: 'rotina',
    pergunta: 'Como funciona o agendamento automático de exames e remédios pelo chat?',
    resposta:
      'Basta digitar ou enviar uma mensagem de áudio falando sobre o exame ou receita (exemplo: "Marcar tomografia amanhã às 14h"). A IA identifica os horários, o hospital e o médico, gerando um card de confirmação para você salvar com um clique.',
  },
  {
    id: '3',
    categoria: 'seguranca',
    pergunta: 'Os dados de saúde do meu filho estão seguros e em sigilo?',
    resposta:
      'Sim. O aplicativo Vitta segue todas as diretrizes da LGPD (Lei Geral de Proteção de Dados). As informações são criptografadas, ficam restritas à sua conta e aos cuidadores autorizados por você, e nunca são comercializadas para terceiros.',
  },
  {
    id: '4',
    categoria: 'geral',
    pergunta: 'Posso cadastrar mais de um filho no mesmo aplicativo?',
    resposta:
      'Com certeza. Você pode alternar entre perfis de diferentes dependentes na barra superior ou menu lateral. Cada filho terá seu próprio histórico de consultas, medicações, relatórios e exames separados.',
  },
  {
    id: '5',
    categoria: 'rotina',
    pergunta: 'Outros familiares ou cuidadores podem acessar a conta?',
    resposta:
      'Sim! Você pode compartilhar o acompanhamento com avós, parceiros ou babás para que todos saibam exatamente os horários dos remédios e os próximos exames sem falhas de comunicação.',
  },
  {
    id: '6',
    categoria: 'ia',
    pergunta: 'Por quanto tempo as conversas do histórico da IA ficam salvas?',
    resposta:
      'Para proteger sua privacidade e manter o sistema leve, as conversas ficam guardadas por 3 dias a partir da última interação. Sempre que você envia uma nova mensagem no chat, esse prazo é reiniciado automaticamente.',
  },
  {
    id: '7',
    categoria: 'geral',
    pergunta: 'O aplicativo Vitta é gratuito?',
    resposta:
      'Sim! O aplicativo Vitta é uma plataforma pensada para apoiar famílias no momento em que mais precisam de organização e acolhimento.',
  },
];

export default function FaqUserScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [itemAberto, setItemAberto] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setItemAberto(itemAberto === id ? null : id);
  };

  const itensFiltrados = FAQ_DATA.filter((item) => {
    const bateCategoria = categoriaFiltro === 'todos' || item.categoria === categoriaFiltro;
    const bateBusca =
      item.pergunta.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.resposta.toLowerCase().includes(termoBusca.toLowerCase());
    return bateCategoria && bateBusca;
  });

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
            <Text style={[styles.tagTexto, { color: theme.yellow9 }]}>Tire suas dúvidas</Text>
          </View>
          <Text style={[tipografia.h2, { color: theme.textPrimary, marginBottom: 8 }]}>
            Perguntas Frequentes (FAQ)
          </Text>
          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            Tudo o que você precisa saber sobre o aplicativo Vitta, a assistente IA e a gestão de rotina.
          </Text>
        </View>

        {/* Input de Busca */}
        <View
          style={[
            styles.buscaContainer,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <TextInput
            placeholder="Pesquise por sua dúvida..."
            placeholderTextColor={theme.gray4}
            value={termoBusca}
            onChangeText={setTermoBusca}
            style={[styles.buscaInput, { color: theme.textPrimary }]}
          />
          {termoBusca.length > 0 && (
            <TouchableOpacity onPress={() => setTermoBusca('')}>
              <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtro por Categorias */}
        <View style={styles.filtrosRow}>
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'ia', label: '💛 Vitta IA' },
            { id: 'rotina', label: '📅 Rotina & Exames' },
            { id: 'seguranca', label: '🔒 Segurança & LGPD' },
            { id: 'geral', label: '📱 Geral' },
          ].map((cat) => {
            const ativo = categoriaFiltro === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filtroBtn,
                  {
                    backgroundColor: ativo ? theme.yellow5 : theme.cardBg,
                    borderColor: ativo ? 'transparent' : theme.border,
                  },
                ]}
                onPress={() => setCategoriaFiltro(cat.id)}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    {
                      color: ativo ? (isDark ? '#000000' : theme.yellow9) : theme.textSecondary,
                      fontWeight: ativo ? '700' : '500',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Acordeão de Perguntas */}
        <View style={styles.faqList}>
          {itensFiltrados.length === 0 ? (
            <View style={styles.vazioBox}>
              <Text style={styles.vazioEmoji}>❓</Text>
              <Text style={[styles.vazioTexto, { color: theme.textSecondary }]}>
                Nenhuma pergunta encontrada com este termo.
              </Text>
            </View>
          ) : (
            itensFiltrados.map((faq) => {
              const estaAberto = itemAberto === faq.id;
              return (
                <View
                  key={faq.id}
                  style={[
                    styles.faqCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: estaAberto ? theme.yellow5 : theme.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.perguntaBtn}
                    onPress={() => toggleItem(faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.perguntaTexto,
                        { color: estaAberto ? theme.yellow6 : theme.textPrimary },
                      ]}
                    >
                      {faq.pergunta}
                    </Text>
                    <Text style={[styles.setaIndicador, { color: theme.textSecondary }]}>
                      {estaAberto ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {estaAberto && (
                    <View style={styles.respostaBox}>
                      <Text style={[styles.respostaTexto, { color: theme.textSecondary }]}>
                        {faq.resposta}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* Card para falar com suporte */}
        <View
          style={[
            styles.suporteCard,
            {
              backgroundColor: isDark ? '#2B1F0A' : '#FFFBEB',
              borderColor: isDark ? '#5E410E' : '#FDE68A',
            },
          ]}
        >
          <Text style={[styles.suporteTitulo, { color: isDark ? '#FCD34D' : '#92400E' }]}>
            Não encontrou o que procurava?
          </Text>
          <Text style={[styles.suporteDesc, { color: isDark ? '#FDE68A' : '#78350F' }]}>
            Nossa equipe de suporte e a comunidade Vitta estão prontas para ajudar você e sua família.
          </Text>
          <TouchableOpacity
            style={[styles.suporteBtn, { backgroundColor: theme.yellow5 }]}
            onPress={() => router.push('/(user)/suporte')}
          >
            <Text style={[styles.suporteBtnTexto, { color: isDark ? '#000000' : theme.yellow9 }]}>
              Falar com o Suporte
            </Text>
          </TouchableOpacity>
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
    maxWidth: 860,
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
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  buscaInput: {
    flex: 1,
    fontSize: 14,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  filtrosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filtroBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filtroTexto: {
    fontSize: 12.5,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  perguntaBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  perguntaTexto: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    lineHeight: 21,
  },
  setaIndicador: {
    fontSize: 12,
  },
  respostaBox: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 0,
  },
  respostaTexto: {
    fontSize: 13.5,
    lineHeight: 22,
  },
  vazioBox: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  vazioEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  vazioTexto: {
    fontSize: 13.5,
  },
  suporteCard: {
    marginTop: 32,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    textAlign: 'center',
  },
  suporteTitulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  suporteDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  suporteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  suporteBtnTexto: {
    fontWeight: '700',
    fontSize: 13,
  },
});