import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';

import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import BotaoVittaIA from '@/components/BotaoFlutuanteVittaIA';

interface RecursoItem {
  id: string;
  titulo: string;
  descricaoCurta: string;
  icone: any;
  destaque?: boolean;
  detalhesAprofundados: {
    resumo: string;
    itens: string[];
    beneficio: string;
  };
}

const IMAGENS = [
  { id: 1, imagem: require('@/img/indexImg/visaogeral.png'), titulo: 'Visão Geral', icone: require('@/img/icons/dashboard.svg') },
  { id: 2, imagem: require('@/img/indexImg/calendario.png'), titulo: 'Calendário', icone: require('@/img/icons/calendar-02.svg') },
  { id: 3, imagem: require('@/img/indexImg/criancaperfil.png'), titulo: 'Crianças e adolescentes', icone: require('@/img/icons/userGroup.svg') },
  { id: 4, imagem: require('@/img/indexImg/documentos.png'), titulo: 'Documentos', icone: require('@/img/icons/document.svg') },
  { id: 5, imagem: require('@/img/indexImg/vittaIA.png'), titulo: 'Vitta IA', icone: require("@/img/estrelasIa.svg") },
];

const RECURSOS: RecursoItem[] = [
  {
    id: '1',
    titulo: 'Gestão de Medicamentos',
    descricaoCurta:
      'Controle dosagens, horários, notificações e histórico de uso diário de forma simples e intuitiva.',
    icone: require('@/img/icons/medicamento.svg'),
    detalhesAprofundados: {
      resumo:
        'Elimine a dúvida sobre a última dose ministrada e mantenha o cronograma do tratamento rigorosamente em dia.',
      itens: [
        'Alertas automáticos para cada dose programada',
        'Registo de dosagem e via de administração',
        'Controlo de stock para reposição a tempo',
        'Histórico diário de medicamentos tomados e pulados',
      ],
      beneficio: 'Evita superdosagens ou esquecimentos acidentais durante o tratamento.',
    },
  },
  {
    id: '2',
    titulo: 'Consultas & Retornos',
    descricaoCurta:
      'Organize consultas médicas com especialistas, anotações clínicas, datas de retorno e orientações recebidas.',
    icone: require('@/img/icons/stethoscope-02.svg'),
    detalhesAprofundados: {
      resumo:
        'Mantenha todas as informações do médico organizadas num só lugar, antes, durante e após a consulta.',
      itens: [
        'Anotação de dúvidas para não esquecer nada no momento',
        'Registo das orientações e condutas pós-consulta',
        'Controlo de prazos de retorno e agendamento futuro',
        'Histórico de profissionais e clínicas atendidas',
      ],
      beneficio: 'Mais clareza para seguir com precisão o que o especialista recomendou.',
    },
  },
  {
    id: '3',
    titulo: 'Controlo de Exames',
    descricaoCurta:
      'Mantenha exames laboratoriais e de imagem catalogados com histórico evolutivo e comparativo.',
    icone: require('@/img/icons/microscope.svg'),
    detalhesAprofundados: {
      resumo:
        'Acompanhe a evolução de parâmetros laboratoriais e mantenha resultados antigos sempre à mão para comparação.',
      itens: [
        'Upload de laudos em PDF e fotos de exames',
        'Classificação por tipo (sangue, imagem, urina, etc.)',
        'Anotações de valores de referência e conclusões',
        'Acesso imediato para mostrar ao médico durante a consulta',
      ],
      beneficio: 'Facilidade para comparar exames antigos sem perder laudos físicos em papel.',
    },
  },
  {
    id: '4',
    titulo: 'Documentos e Receitas',
    descricaoCurta:
      'Armazene atestados, prescrições e laudos num ambiente seguro para aceder sempre que precisar.',
    icone: require('@/img/icons/document.svg'),
    detalhesAprofundados: {
      resumo:
        'Diga adeus a pastas de papel amarrotadas ou receitas perdidas quando mais precisa delas.',
      itens: [
        'Digitalização simples de receitas médicas',
        'Armazenamento seguro de atestados para a escola ou trabalho',
        'Partilha rápida em PDF por WhatsApp ou e-mail',
        'Pesquisa rápida por data ou palavra-chave',
      ],
      beneficio: 'Documentos vitais sempre acessíveis de qualquer lugar, mesmo em emergências.',
    },
  },
  {
    id: '5',
    titulo: 'Inteligência Artificial (Vitta IA)',
    descricaoCurta:
      'Tire dúvidas sobre receitas, receba resumos práticos de relatórios e organize lembretes inteligentes.',
    icone: require('@/img/estrelasIa.svg'),
    destaque: true,
    detalhesAprofundados: {
      resumo:
        'Um assistente dedicado para simplificar termos médicos complexos e apoiar a rotina da família.',
      itens: [
        'Explicação em linguagem clara de termos médicos e laudos',
        'Resumo inteligente de receitas e orientações médicas',
        'Sugestões de perguntas pertinentes para colocar ao médico',
        'Apoio na organização do calendário de cuidados diários',
      ],
      beneficio: 'Menos ansiedade e mais segurança ao interpretar as orientações médicas.',
    },
  },
  {
    id: '6',
    titulo: 'Multi-Responsáveis',
    descricaoCurta:
      'Partilhe o acompanhamento do tratamento com o pai, mãe, avós ou cuidadores em tempo real.',
    icone: require('@/img/icons/userGroup.svg'),
    detalhesAprofundados: {
      resumo:
        'Toda a rede de apoio conectada na mesma aplicação para cuidar com total sincronização.',
      itens: [
        'Sincronização em tempo real entre telemóveis diferentes',
        'Notificação instantânea quando outro responsável der um remédio',
        'Gestão de níveis de acesso (quem pode editar ou apenas visualizar)',
        'Ideal para famílias com guarda partilhada, amas e avós',
      ],
      beneficio: 'Ninguém fica sem saber se a dose foi ministrada ou qual a próxima consulta.',
    },
  },
];

const PASSOS_COMO_FUNCIONA = [
  {
    numero: '01',
    titulo: 'Cadastre o perfil',
    descricao: 'Insira os dados essenciais da criança ou adolescente.',
  },
  {
    numero: '02',
    titulo: 'Monte a rotina de cuidados',
    descricao: 'Adicione os medicamentos em uso, horários das doses e as próximas consultas médicas agendadas.',
  },
  {
    numero: '03',
    titulo: 'Sincronize com a família',
    descricao: 'Convide outros familiares ou cuidadores para que todos acompanhem as notificações em tempo real.',
  },
];

const COMPARATIVO = [
  {
    semVitta: 'Receitas amarrotadas em carteiras ou perdidas em gavetas',
    comVitta: 'Documentos e prescrições digitalizados e pesquisáveis em segundos',
  },
  {
    semVitta: 'Dúvidas e desencontros sobre se o outro responsável já deu o remédio',
    comVitta: 'Notificação imediata e histórico em tempo real entre todos os cuidadores',
  },
  {
    semVitta: 'Esquecimento de datas de retorno ou exames antigos para comparação',
    comVitta: 'Linha do tempo médica completa com histórico evolutivo organizado',
  },
  {
    semVitta: 'Insegurança com termos técnicos de laudos e dosagens',
    comVitta: 'Vitta IA a explicar termos complexos em linguagem simples e acolhedora',
  },
];

export default function RecursosUsuarioLogado() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1080;

  const { theme, isDark } = useTheme();

  const [cardHoverId, setCardHoverId] = useState<string | null>(null);
  const [cardModal, setCardModal] = useState<RecursoItem | null>(null);
  const [slideMockupAtivo, setSlideMockupAtivo] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <BotaoVittaIA />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── CABEÇALHO DA PÁGINA ─── */}
        <View
          style={{
            paddingHorizontal: isMobile ? 16 : 32,
            paddingTop: isMobile ? 20 : 32,
            paddingBottom: 20,
            maxWidth: 1100,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 16, color: theme.yellow6 }}>←</Text>
            <Text style={[tipografia.body, { color: theme.yellow6, fontWeight: '600' }]}>
              Voltar às Configurações
            </Text>
          </TouchableOpacity>

          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>
            Recursos da Plataforma Vitta
          </Text>

          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, marginTop: 4, maxWidth: 720 }]}>
            Guia prático de funcionalidades para ajudar você a explorar ao máximo o acompanhamento de saúde da sua família.
          </Text>
        </View>

        {/* ─── 1. HERO BANNER DA SESSÃO ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 32,
            marginBottom: 32,
            maxWidth: 1100,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: theme.cardBg,
              borderRadius: 24,
              padding: isMobile ? 20 : 32,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 16,
            }}
          >
            <Text
              style={[
                tipografia.caption,
                {
                  color: theme.yellow6,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                },
              ]}
            >
              Guia do Usuário
            </Text>

            <Text
              style={[
                tipografia.h1,
                {
                  fontSize: isMobile ? 24 : 32,
                  lineHeight: isMobile ? 30 : 38,
                  color: theme.textPrimary,
                },
              ]}
            >
              Tudo o que precisa para cuidar da saúde do seu filho com{' '}
              <Text style={{ color: theme.yellow6 }}>tranquilidade.</Text>
            </Text>

            <Text
              style={[
                tipografia.bodySecondary,
                {
                  color: theme.textSecondary,
                  fontSize: 15,
                  lineHeight: 22,
                  maxWidth: 720,
                },
              ]}
            >
              O Vitta foi pensado para apoiar famílias no acompanhamento contínuo de tratamentos,
              centralizando informações médicas e reduzindo a sobrecarga do dia a dia.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <ButtonPrimary
                texto="Ir para Visão Geral"
                onPress={() => router.push('/visaoGeral')}
                icone={require('@/img/icons/setaDireita.svg')}
              />
            </View>
          </View>
        </View>

        {/* ─── 2. GRELHA DE FUNCIONALIDADES COM HOVER E MODAL ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 32,
            paddingVertical: 24,
            maxWidth: 1100,
            alignSelf: 'center',
          }}
        >
          <View style={{ marginBottom: 24 }}>
            <Text style={[tipografia.h3, { color: theme.textPrimary, marginBottom: 4 }]}>
              Ferramentas Disponíveis na sua Conta
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: 14 }]}>
              Toque ou passe o cursor sobre qualquer recurso para entender como ele funciona na sua rotina.
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'space-between',
            }}
          >
            {RECURSOS.map((item) => {
              const larguraCard = isMobile ? '100%' : isTablet ? '48%' : '31.8%';
              const isHover = cardHoverId === item.id;

              return (
                <Pressable
                  key={item.id}
                  onHoverIn={() => setCardHoverId(item.id)}
                  onHoverOut={() => setCardHoverId(null)}
                  onPress={() => setCardModal(item)}
                  style={({ pressed }) => [
                    {
                      width: larguraCard,
                      backgroundColor: item.destaque
                        ? theme.yellow1
                        : theme.cardBg,
                      borderWidth: 1.5,
                      borderColor: isHover
                        ? theme.yellow6
                        : item.destaque
                          ? theme.yellow5
                          : theme.border,
                      borderRadius: 20,
                      padding: 20,
                      gap: 14,
                      justifyContent: 'space-between',
                      opacity: pressed ? 0.88 : 1,
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.2s ease' } as any),
                  ]}
                >
                  <View style={{ gap: 12 }}>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isHover || item.destaque ? theme.yellow2 : theme.inputBg,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        source={item.icone}
                        style={{
                          width: 22,
                          height: 22,
                          tintColor: isHover || item.destaque ? theme.yellow9 : theme.textPrimary,
                        }}
                        resizeMode="contain"
                      />
                    </View>

                    <Text
                      style={[
                        tipografia.h4,
                        {
                          fontSize: 17,
                          fontWeight: '700',
                          color: isHover ? theme.yellow6 : theme.textPrimary,
                        },
                      ]}
                    >
                      {item.titulo}
                    </Text>

                    <Text
                      style={[
                        tipografia.bodySecondary,
                        {
                          fontSize: 13.5,
                          lineHeight: 19,
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      {item.descricaoCurta}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: isHover ? theme.yellow6 : theme.textSecondary,
                      }}
                    >
                      {isHover ? 'Clique para ver detalhes' : 'Ver detalhes'}
                    </Text>
                    <Text style={{ fontSize: 13, color: isHover ? theme.yellow6 : theme.textSecondary }}>
                      →
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ─── 3. COMO FUNCIONA (PASSO A PASSO) ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 32,
            paddingVertical: 24,
            maxWidth: 1100,
            alignSelf: 'center',
          }}
        >
          <View style={{ marginBottom: 20 }}>
            <Text style={[tipografia.h3, { color: theme.textPrimary, marginBottom: 4 }]}>
              Simples de usar, do primeiro ao último dia
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: 14 }]}>
              Em apenas três passos você tem total tranquilidade no acompanhamento do tratamento.
            </Text>
          </View>

          <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            {PASSOS_COMO_FUNCIONA.map((passo, idx) => (
              <View
                key={idx}
                style={{
                  flex: isMobile ? undefined : 1,
                  backgroundColor: theme.cardBg,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 20,
                  padding: 20,
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 26, fontWeight: '800', color: theme.yellow6 }}>
                  {passo.numero}
                </Text>
                <Text style={[tipografia.h4, { fontSize: 16, fontWeight: '700', color: theme.textPrimary }]}>
                  {passo.titulo}
                </Text>
                <Text style={[tipografia.bodySecondary, { fontSize: 13.5, lineHeight: 20, color: theme.textSecondary }]}>
                  {passo.descricao}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 4. GALERIA VISUAL DA PLATAFORMA ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 32,
            paddingVertical: 24,
            maxWidth: 1100,
            alignSelf: 'center',
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={[tipografia.h3, { color: theme.textPrimary, textAlign: 'center', marginBottom: 4 }]}>
              Veja o Vitta por dentro
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, textAlign: 'center', fontSize: 14 }]}>
              Navegue pelas abas e veja como cada tela foi desenhada para facilitar a sua rotina.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 10,
              paddingHorizontal: 4,
              marginBottom: 20,
              alignSelf: isMobile ? 'flex-start' : 'center',
            }}
          >
            {IMAGENS.map((item, index) => {
              const ativo = slideMockupAtivo === index;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSlideMockupAtivo(index)}
                  activeOpacity={0.8}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 999,
                      backgroundColor: ativo ? theme.yellow5 : theme.inputBg,
                      borderWidth: 1,
                      borderColor: ativo ? theme.yellow6 : theme.border,
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                >
                  <Image
                    source={item.icone}
                    style={{
                      width: 16,
                      height: 16,
                      tintColor: ativo ? (isDark ? '#FFFFFF' : '#1A1A1E') : theme.textSecondary,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: ativo ? '700' : '500',
                      color: ativo ? (isDark ? '#FFFFFF' : '#1A1A1E') : theme.textPrimary,
                    }}
                  >
                    {item.titulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View
            style={{
              width: '100%',
              backgroundColor: theme.cardBg,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Image
              source={IMAGENS[slideMockupAtivo].imagem}
              style={{
                width: '100%',
                height: isMobile ? 200 : isTablet ? 360 : 500,
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ─── 5. TABELA COMPARATIVA ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 32,
            paddingVertical: 24,
            maxWidth: 1100,
            alignSelf: 'center',
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={[tipografia.h3, { color: theme.textPrimary, textAlign: 'center', marginBottom: 4 }]}>
              A diferença real no seu dia a dia
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, textAlign: 'center', fontSize: 14 }]}>
              Veja como a plataforma substitui a sobrecarga por controle e clareza.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {COMPARATIVO.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: isMobile ? 'column' : 'row',
                  backgroundColor: theme.cardBg,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    backgroundColor: isDark ? '#321414' : '#FFF7F7',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#DC2626' }}>✕</Text>
                  <Text style={{ fontSize: 13.5, color: theme.textSecondary, flex: 1 }}>
                    {item.semVitta}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    padding: 16,
                    backgroundColor: isDark ? '#142A16' : '#FAFCF8',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#16A34A', fontWeight: 'bold' }}>✓</Text>
                  <Text style={{ fontSize: 13.5, color: theme.textPrimary, fontWeight: '600', flex: 1 }}>
                    {item.comVitta}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 6. BADGES DE SEGURANÇA ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 32,
            paddingVertical: 20,
            maxWidth: 1100,
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: isMobile ? 12 : 28,
              paddingVertical: 16,
              paddingHorizontal: 20,
              backgroundColor: theme.yellow1,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.yellow5,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image
                source={require('@/img/icons/cadeado.svg')}
                style={{ width: 20, height: 20, tintColor: theme.yellow9 }}
              />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.yellow9 }}>
                Criptografia ponta a ponta
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image
                source={require('@/img/icons/nuvem.svg')}
                style={{ width: 20, height: 20, tintColor: theme.yellow9 }}
              />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.yellow9 }}>
                Backup automático em nuvem
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image
                source={require('@/img/icons/multiplataforma.svg')}
                style={{ width: 20, height: 20, tintColor: theme.yellow9 }}
              />
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.yellow9 }}>
                Multiplataforma (Web & Mobile)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── MODAL DA EXPLICAÇÃO DETALHADA DOS CARDS ─── */}
      <Modal
        visible={!!cardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCardModal(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          onPress={() => setCardModal(null)}
        >
          {cardModal && (
            <View
              onStartShouldSetResponder={() => true}
              style={{
                width: '100%',
                maxWidth: 480,
                backgroundColor: theme.cardBg,
                borderRadius: 24,
                padding: 24,
                gap: 18,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: theme.yellow2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={cardModal.icone}
                      style={{ width: 20, height: 20, tintColor: theme.yellow9 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[tipografia.h3, { fontSize: 18, fontWeight: '700', color: theme.textPrimary }]}>
                    {cardModal.titulo}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCardModal(null)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: theme.inputBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.textPrimary }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[tipografia.body, { fontSize: 14, lineHeight: 20, color: theme.textSecondary }]}>
                {cardModal.detalhesAprofundados.resumo}
              </Text>

              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: theme.textPrimary,
                    textTransform: 'uppercase',
                  }}
                >
                  O que pode fazer:
                </Text>
                {cardModal.detalhesAprofundados.itens.map((ponto, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                    <Text style={{ color: theme.yellow6, fontSize: 14 }}>✔</Text>
                    <Text style={[tipografia.bodySecondary, { fontSize: 13, color: theme.textSecondary, flex: 1 }]}>
                      {ponto}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={{
                  backgroundColor: theme.yellow1,
                  borderWidth: 1,
                  borderColor: theme.yellow5,
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.yellow9, marginBottom: 2 }}>
                  💡 Por que faz a diferença?
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
                  {cardModal.detalhesAprofundados.beneficio}
                </Text>
              </View>

              <ButtonSecondary
                texto="Entendi"
                onPress={() => setCardModal(null)}
                style={{ width: '100%' }}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}