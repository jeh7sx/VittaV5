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
import { tipografia } from '@/styles/tipografia';
import { colors } from '@/styles/colors';
import { PublicNavbar } from '@/components/PublicNavbar';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';

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
    descricao: 'Insira os dados essenciais da criança ou adolescente',
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

const FAQS = [
  {
    pergunta: 'O Vitta substitui a avaliação do médico ou pediatra?',
    resposta:
      'Não. O Vitta é uma ferramenta de gestão, suporte à organização e acompanhamento da rotina. Nenhuma informação fornecida pela aplicação ou pela IA substitui o diagnóstico e a conduta de profissionais de saúde.',
  },
  {
    pergunta: 'Os dados de saúde do meu filho estão protegidos?',
    resposta:
      'Sim. Levamos a privacidade a sério. Utilizamos práticas modernas de encriptação e base de dados segura para garantir que apenas os responsáveis autorizados tenham acesso ao histórico.',
  },
  {
    pergunta: 'Mais de uma pessoa pode aceder aos mesmos dados?',
    resposta:
      'Sim. Com o recurso Multi-Responsáveis, pais, avós ou cuidadores podem ligar-se ao mesmo perfil e receber alertas simultâneos.',
  },
  {
    pergunta: 'Preciso de pagar para testar a plataforma?',
    resposta:
      'Pode criar a sua conta gratuitamente para experimentar as principais ferramentas de organização e acompanhamento da Vitta.',
  },
];

export default function Recursos() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1080;
  const sidePadding = isMobile ? 18 : isTablet ? 36 : Math.max(36, Math.min((width - 1200) / 2, 120));

  const [cardHoverId, setCardHoverId] = useState<string | null>(null);
  const [cardModal, setCardModal] = useState<RecursoItem | null>(null);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [slideMockupAtivo, setSlideMockupAtivo] = useState(0);

  const toggleFaq = (index: number) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* ─── NAVBAR PÚBLICA ─── */}
      <PublicNavbar sidePadding={sidePadding} />

      <ScrollView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. HERO SECTION ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: sidePadding,
            paddingTop: isMobile ? 36 : 60,
            paddingBottom: isMobile ? 36 : 56,
          }}
        >
          <View style={{ maxWidth: 840, alignSelf: isMobile ? 'center' : 'flex-start' }}>
            <Text
              style={[
                tipografia.caption,
                {
                  color: colors.yellow6,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 10,
                  textAlign: isMobile ? 'center' : 'left',
                },
              ]}
            >
              Conheça a Plataforma Vitta
            </Text>

            <Text
              style={[
                tipografia.h1,
                {
                  fontSize: isMobile ? 28 : isTablet ? 38 : 50,
                  lineHeight: isMobile ? 34 : isTablet ? 46 : 58,
                  color: '#1A1A1E',
                  textAlign: isMobile ? 'center' : 'left',
                  marginBottom: 16,
                },
              ]}
            >
              Tudo o que precisa para cuidar da saúde do seu filho com{' '}
              <Text style={{ color: colors.yellow6 }}>tranquilidade.</Text>
            </Text>

            <Text
              style={[
                tipografia.bodySecondary,
                {
                  fontSize: isMobile ? 15 : 17,
                  lineHeight: isMobile ? 22 : 26,
                  color: '#555555',
                  textAlign: isMobile ? 'center' : 'left',
                  marginBottom: 28,
                  maxWidth: 720,
                },
              ]}
            >
              O Vitta foi pensado para apoiar famílias no acompanhamento contínuo de tratamentos,
              centralizando informações médicas e reduzindo a sobrecarga do dia a dia.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <ButtonPrimary
                texto="Cadastrar"
                onPress={() => router.push('/cadastro')}
                icone={require('@/img/icons/setaDireita.svg')}
              />
              <ButtonSecondary
                texto="Entrar"
                onPress={() => router.push('/login')}
                icone={require('@/img/icons/logIn.svg')}
              />
            </View>
          </View>
        </View>

        {/* ─── 2. GRELHA DE FUNCIONALIDADES COM HOVER E MODAL ─── */}
        <View
          style={{
            width: '100%',
            backgroundColor: '#FAFAFA',
            paddingVertical: isMobile ? 48 : 72,
            paddingHorizontal: sidePadding,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#EEEEEE',
          }}
        >
          <View style={{ alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 36 }}>
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 24 : 34,
                  color: '#1A1A1E',
                  textAlign: isMobile ? 'center' : 'left',
                  marginBottom: 8,
                  letterSpacing: -0.5,
                },
              ]}
            >
              Recursos completos e pensados para si
            </Text>
            <Text
              style={[
                tipografia.bodySecondary,
                {
                  color: '#666666',
                  textAlign: isMobile ? 'center' : 'left',
                  maxWidth: 640,
                  fontSize: 15,
                  lineHeight: 22,
                },
              ]}
            >
              Explore as ferramentas desenhadas para transformar a rotina médica em algo simples
              e sem esforço. Passe o cursor ou toque no cartão para ler a explicação detalhada.
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
                        ? '#FFFDF5'
                        : isHover
                          ? '#FFFFFF'
                          : '#FFFFFF',
                      borderWidth: 1.5,
                      borderColor: isHover
                        ? colors.yellow6
                        : item.destaque
                          ? colors.yellow5
                          : '#EBEBEB',
                      borderRadius: 24,
                      padding: 24,
                      gap: 14,
                      justifyContent: 'space-between',
                      transform: [{ translateY: isHover ? -4 : 0 }],
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: isHover ? 10 : 2 },
                      shadowOpacity: isHover ? 0.08 : 0.03,
                      shadowRadius: isHover ? 16 : 6,
                      elevation: isHover ? 6 : 1,
                      opacity: pressed ? 0.88 : 1,
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.2s ease' } as any),
                  ]}
                >
                  <View style={{ gap: 12 }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        backgroundColor: isHover || item.destaque ? colors.yellow2 : '#F4F4F6',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        source={item.icone}
                        style={{
                          width: 22,
                          height: 22,
                          tintColor: isHover || item.destaque ? colors.yellow9 : '#1A1A1E',
                        }}
                        resizeMode="contain"
                      />
                    </View>

                    <Text
                      style={[
                        tipografia.h4,
                        {
                          fontSize: 18,
                          fontWeight: '700',
                          color: isHover ? colors.yellow9 : '#1A1A1E',
                        },
                      ]}
                    >
                      {item.titulo}
                    </Text>

                    <Text
                      style={[
                        tipografia.bodySecondary,
                        {
                          fontSize: 14,
                          lineHeight: 20,
                          color: '#555555',
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
                      borderColor: '#F0F0F0',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12.5,
                        fontWeight: '700',
                        color: isHover ? colors.yellow7 : '#888888',
                      }}
                    >
                      {isHover ? 'Clique para ver detalhes' : 'Ver detalhes'}
                    </Text>
                    <Text style={{ fontSize: 13, color: isHover ? colors.yellow7 : '#888888' }}>
                      →
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ─── 3. COMO FUNCIONA (PASSO A PASSO) ─── */}
        <View style={{ width: '100%', paddingHorizontal: sidePadding, paddingVertical: isMobile ? 48 : 72 }}>
          <View style={{ alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 36 }}>
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 24 : 34,
                  color: '#1A1A1E',
                  textAlign: isMobile ? 'center' : 'left',
                  marginBottom: 8,
                },
              ]}
            >
              Simples de usar, do primeiro ao último dia
            </Text>
            <Text
              style={[
                tipografia.bodySecondary,
                {
                  color: '#666666',
                  textAlign: isMobile ? 'center' : 'left',
                  maxWidth: 640,
                },
              ]}
            >
              Em apenas três passos você tem total tranquilidade no acompanhamento do tratamento.
            </Text>
          </View>

          <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
            {PASSOS_COMO_FUNCIONA.map((passo, idx) => (
              <View
                key={idx}
                style={{
                  flex: isMobile ? undefined : 1,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#EFEFEF',
                  borderRadius: 24,
                  padding: 28,
                  gap: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 8,
                  elevation: 1,
                }}
              >
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.yellow6 }}>
                  {passo.numero}
                </Text>
                <Text style={[tipografia.h4, { fontSize: 18, fontWeight: '700', color: '#1A1A1E' }]}>
                  {passo.titulo}
                </Text>
                <Text style={[tipografia.bodySecondary, { fontSize: 14, lineHeight: 22, color: '#555555' }]}>
                  {passo.descricao}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 4. SECÇÃO DAS IMAGENS REAIS DA PLATAFORMA ─── */}
        <View style={{ width: '100%', paddingHorizontal: sidePadding, paddingBottom: 64 }}>
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 24 : 34,
                  color: '#1A1A1E',
                  textAlign: 'center',
                  marginBottom: 8,
                },
              ]}
            >
              Veja o Vitta por dentro
            </Text>
            <Text
              style={[
                tipografia.bodySecondary,
                {
                  color: '#666666',
                  textAlign: 'center',
                  maxWidth: 620,
                },
              ]}
            >
              Navegue pelas abas e descubra como cada tela foi desenhada para facilitar a rotina médica da sua família.
            </Text>
          </View>

          {/* Abas com a nova ordenação solicitada */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 10,
              paddingHorizontal: 8,
              marginBottom: 24,
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
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      borderRadius: 999,
                      backgroundColor: ativo ? colors.yellow5 : '#F4F4F6',
                      borderWidth: 1,
                      borderColor: ativo ? colors.yellow6 : '#E5E7EB',
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ]}
                >
                  {typeof item.icone === 'string' ? (
                    <Text style={{ fontSize: 14 }}>{item.icone}</Text>
                  ) : (
                    <Image
                      source={item.icone}
                      style={{
                        width: 16,
                        height: 16,
                        tintColor: ativo ? '#1A1A1E' : '#64748B',
                      }}
                      resizeMode="contain"
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: ativo ? '700' : '500',
                      color: ativo ? '#1A1A1E' : '#64748B',
                    }}
                  >
                    {item.titulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Imagem com Cantos Arredondados e Sombra Suave (sem barra e sem espaço branco) */}
          <View
            style={{
              width: '100%',
              maxWidth: 1100,
              alignSelf: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#EFEFEF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Image
              source={IMAGENS[slideMockupAtivo].imagem}
              style={{
                width: '100%',
                height: isMobile ? 220 : isTablet ? 380 : 560,
              }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ─── 5. TABELA COMPARATIVA (SEM O VITTA vs COM O VITTA) ─── */}
        <View
          style={{
            width: '100%',
            backgroundColor: '#FFFDF9',
            paddingVertical: isMobile ? 48 : 72,
            paddingHorizontal: sidePadding,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#F5ECE0',
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 24 : 34,
                  color: colors.yellow9,
                  textAlign: 'center',
                  marginBottom: 8,
                },
              ]}
            >
              A diferença real no dia a dia
            </Text>
            <Text
              style={[
                tipografia.bodySecondary,
                {
                  color: '#777777',
                  textAlign: 'center',
                  maxWidth: 580,
                },
              ]}
            >
              Veja como o Vitta substitui a sobrecarga e o estresse por controle e clareza.
            </Text>
          </View>

          <View style={{ gap: 14, maxWidth: 900, alignSelf: 'center', width: '100%' }}>
            {COMPARATIVO.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: isMobile ? 'column' : 'row',
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#EAEAEA',
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
              >
                {/* Lado Sem o Vitta */}
                <View
                  style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: '#FFF7F7',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    borderBottomWidth: isMobile ? 1 : 0,
                    borderRightWidth: isMobile ? 0 : 1,
                    borderColor: '#F3E5E5',
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#DC2626' }}>✕</Text>
                  <Text style={{ fontSize: 14, color: '#555555', flex: 1, lineHeight: 20 }}>
                    {item.semVitta}
                  </Text>
                </View>

                {/* Lado Com o Vitta */}
                <View
                  style={{
                    flex: 1,
                    padding: 20,
                    backgroundColor: '#FAFCF8',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Text style={{ fontSize: 18, color: '#16A34A', fontWeight: 'bold' }}>✓</Text>
                  <Text style={{ fontSize: 14, color: '#1A1A1E', fontWeight: '600', flex: 1, lineHeight: 20 }}>
                    {item.comVitta}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>



        {/* ─── 7. BADGES DE SEGURANÇA E CONFIANÇA ─── */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: sidePadding,
            paddingTop: 40,
            paddingBottom: 40,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: isMobile ? 14 : 32,
              paddingVertical: 18,
              paddingHorizontal: 24, 
              backgroundColor: colors.yellow2,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#EEEEEE',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image
                source={require('@/img/icons/cadeado.svg')}
                style={{ width: 25, height: 25,tintColor: '#000' }}></Image>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#000' }}>Criptografia ponta a ponta</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <Image
                source={require('@/img/icons/nuvem.svg')}
                style={{ width: 25, height: 25,tintColor: '#000' }}></Image>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#000' }}>Backup automático em nuvem</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
               <Image
                source={require('@/img/icons/multiplataforma.svg')}
                style={{ width: 25, height: 25,tintColor: '#000'}}></Image>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#000'}}>Multiplataforma (Web & Mobile)</Text>
            </View>
          </View>
        </View>

        {/* ─── 8. BANNER FINAL CTA ─── */}
        <View style={{ width: '100%', paddingHorizontal: sidePadding, paddingBottom: 64 }}>
          <View
            style={{
              backgroundColor: colors.yellow2,
              borderRadius: 28,
              paddingVertical: isMobile ? 36 : 56,
              paddingHorizontal: isMobile ? 20 : 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 24 : isTablet ? 30 : 36,
                  textAlign: 'center',
                  maxWidth: 620,
                  color: colors.yellow9,
                  lineHeight: isMobile ? 30 : 42,
                },
              ]}
            >
              Pronto para transformar a organização médica da sua família?
            </Text>

            <Text
              style={[
                tipografia.caption,
                {
                  textAlign: 'center',
                  marginTop: 12,
                  maxWidth: 500,
                  color: colors.yellow9,
                  fontSize: isMobile ? 13 : 14.5,
                  lineHeight: 20,
                },
              ]}
            >
              Crie a sua conta em menos de 2 minutos e comece a registar hoje mesmo.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ButtonSecondary
                texto="Entrar"
                onPress={() => router.push('/login')}
                icone={require('@/img/icons/logIn.svg')}
              />
              <ButtonPrimary
                texto="Cadastrar"
                onPress={() => router.push('/cadastro')}
                icone={require('@/img/icons/setaDireita.svg')}
              />
            </View>
          </View>
        </View>

        {/* ─── 9. FOOTER ─── */}
        <View
          style={{
            width: '100%',
            backgroundColor: '#1E1E1E',
            paddingVertical: 36,
            paddingHorizontal: sidePadding,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[tipografia.captionInverse, { textAlign: 'center', fontSize: 13 }]}>
            © Elaborado pelos autores • vittaetec@gmail.com
          </Text>
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
            backgroundColor: 'rgba(0,0,0,0.45)',
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
                maxWidth: 520,
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 28,
                gap: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.18,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: colors.yellow2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={cardModal.icone}
                      style={{ width: 22, height: 22, tintColor: colors.yellow9 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      tipografia.h3,
                      { fontSize: 20, fontWeight: '700', color: '#1A1A1E' },
                    ]}
                  >
                    {cardModal.titulo}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setCardModal(null)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: '#F3F4F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#666' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  tipografia.body,
                  { fontSize: 15, lineHeight: 22, color: '#444444' },
                ]}
              >
                {cardModal.detalhesAprofundados.resumo}
              </Text>

              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#1A1A1E',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  O que pode fazer:
                </Text>
                {cardModal.detalhesAprofundados.itens.map((ponto, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <Text style={{ color: colors.yellow6, fontSize: 16, lineHeight: 20 }}>✔</Text>
                    <Text
                      style={[
                        tipografia.bodySecondary,
                        { fontSize: 14, lineHeight: 20, color: '#555555', flex: 1 },
                      ]}
                    >
                      {ponto}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={{
                  backgroundColor: '#FFFDF5',
                  borderWidth: 1,
                  borderColor: colors.yellow5,
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.yellow9, marginBottom: 2 }}>
                  💡 Por que faz a diferença?
                </Text>
                <Text style={{ fontSize: 13.5, color: '#666666', lineHeight: 18 }}>
                  {cardModal.detalhesAprofundados.beneficio}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setCardModal(null)}
                style={{
                  backgroundColor: '#1E1E1E',
                  borderRadius: 999,
                  paddingVertical: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                  Entendi
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}