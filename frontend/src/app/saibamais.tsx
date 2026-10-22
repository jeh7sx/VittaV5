import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
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
  descricao: string;
  icone: any;
  destaque?: boolean;
}

const RECURSOS: RecursoItem[] = [
  {
    id: '1',
    titulo: 'Gestão de Medicamentos',
    descricao:
      'Controle dosagens, horários, notificações e histórico de uso diário de forma simples e intuitiva.',
    icone: require('@/img/icons/medicamento.svg'),
  },
  {
    id: '2',
    titulo: 'Consultas & Retornos',
    descricao:
      'Organize consultas médicas com especialistas, anotações clínicas, datas de retorno e orientações recebidas.',
    icone: require('@/img/icons/stethoscope-02.svg'),
  },
  {
    id: '3',
    titulo: 'Controle de Exames',
    descricao:
      'Mantenha exames laboratoriais e de imagem catalogados com histórico evolutivo e comparativo.',
    icone: require('@/img/icons/microscope.svg'),
  },
  {
    id: '4',
    titulo: 'Documentos e Receitas',
    descricao:
      'Armazene atestados, prescrições e laudos num ambiente seguro para aceder sempre que precisar.',
    icone: require('@/img/icons/document.svg'),
  },
  {
    id: '5',
    titulo: 'Inteligência Artificial (Vitta IA)',
    descricao:
      'Tire dúvidas sobre receitas, receba resumos práticos de relatórios e organize lembretes inteligentes.',
    icone: require('@/img/icons/vittaIA.svg'),
    destaque: true,
  },
  {
    id: '6',
    titulo: 'Multi-Responsáveis',
    descricao:
      'Partilhe o acompanhamento do tratamento com o pai, mãe, avós ou cuidadores em tempo real.',
    icone: require('@/img/icons/userGroup.svg'),
  },
];

const BENEFICIOS = [
  {
    titulo: 'Segurança Total',
    descricao: 'Os dados de saúde do seu filho são protegidos com padrões modernos de criptografia.',
  },
  {
    titulo: 'Acesso Rápido',
    descricao: 'Tudo ao alcance de poucos toques no telemóvel ou pelo navegador no computador.',
  },
  {
    titulo: 'Menos Stress na Rotina',
    descricao: 'Lembretes automáticos para que nenhum medicamento ou consulta seja esquecido.',
  },
];

export default function SaibaMais() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1080;
  const sidePadding = isMobile ? 18 : isTablet ? 36 : Math.max(36, Math.min((width - 1200) / 2, 120));

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
        <View style={{ width: '100%', paddingHorizontal: sidePadding, paddingTop: isMobile ? 36 : 60, paddingBottom: isMobile ? 40 : 64 }}>
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

        {/* ─── 2. GRELHA DE FUNCIONALIDADES ─── */}
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
                },
              ]}
            >
              Explore as ferramentas desenhadas para transformar a rotina médica em algo simples e sem esforço.
            </Text>
          </View>

          {/* Cards em Grelha Flexível */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'space-between',
            }}
          >
            {RECURSOS.map((item) => {
              const larguraCard = isMobile
                ? '100%'
                : isTablet
                ? '48%'
                : '31.8%';

              return (
                <View
                  key={item.id}
                  style={{
                    width: larguraCard,
                    backgroundColor: item.destaque ? '#FFFDF5' : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: item.destaque ? colors.yellow5 : '#EBEBEB',
                    borderRadius: 20,
                    padding: 24,
                    gap: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: item.destaque ? colors.yellow2 : '#F4F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={item.icone}
                      style={{
                        width: 22,
                        height: 22,
                        tintColor: item.destaque ? colors.yellow9 : '#1A1A1E',
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
                        color: '#1A1A1E',
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
                    {item.descricao}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ─── 3. PORQUÊ ESCOLHER O VITTA? ─── */}
        <View style={{ width: '100%', paddingHorizontal: sidePadding, paddingVertical: isMobile ? 48 : 72 }}>
          <Text
            style={[
              tipografia.h2,
              {
                fontSize: isMobile ? 24 : 34,
                color: '#1A1A1E',
                textAlign: 'center',
                marginBottom: 36,
              },
            ]}
          >
            Porquê escolher o Vitta?
          </Text>

          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              gap: 20,
              justifyContent: 'center',
            }}
          >
            {BENEFICIOS.map((b, idx) => (
              <View
                key={idx}
                style={{
                  flex: isMobile ? undefined : 1,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#EFEFEF',
                  borderRadius: 20,
                  padding: 24,
                  alignItems: 'center',
                //   textAlign: 'center',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.yellow2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ fontWeight: '800', color: colors.yellow9, fontSize: 16 }}>
                    {idx + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    tipografia.h4,
                    {
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#1A1A1E',
                      marginBottom: 8,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {b.titulo}
                </Text>

                <Text
                  style={[
                    tipografia.bodySecondary,
                    {
                      fontSize: 14,
                      lineHeight: 20,
                      color: '#666666',
                      textAlign: 'center',
                    },
                  ]}
                >
                  {b.descricao}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 4. BANNER FINAL CTA ─── */}
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

        {/* ─── 5. FOOTER ─── */}
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
    </View>
  );
}