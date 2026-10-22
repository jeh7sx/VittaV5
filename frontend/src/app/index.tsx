import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
  Pressable,
  Animated,
  PanResponder,
  Platform,
  Easing,
} from 'react-native';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { tipografia } from '../styles/tipografia';
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonBlack from '@/components/Buttons/ButtonBlack';
import ButtonWhite from '@/components/Buttons/ButtonWhite';
import { VittaIADemoModal } from '../components/VittaIADemoModal';

const IMAGENS_CARROSSEL = [
  { id: 1, imagem: require('@/img/indexImg/visaogeral.png'), titulo: 'Dashboard & Visão Geral' },
  { id: 2, imagem: require('@/img/indexImg/calendario.png'), titulo: 'Gestão de Medicamentos' },
  { id: 3, imagem: require('@/img/indexImg/documentos.png'), titulo: 'Consultas & Retornos' },
  { id: 4, imagem: require('@/img/indexImg/criancaperfil.png'), titulo: 'Exames & Relatórios' },
  { id: 5, imagem: require('@/img/indexImg/vittaIA.png'), titulo: 'Histórico & Documentos' },
];

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [modalDemoAberto, setModalDemoAberto] = useState(false);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1080;
  const sidePadding = isMobile ? 16 : isTablet ? 32 : Math.max(32, Math.min((width - 1200) / 2, 120));

  const [menuAberto, setMenuAberto] = useState(false);

  const [passoAtual, setPassoAtual] = useState(0);
  const animPasso = useRef(new Animated.Value(0)).current;
  const animandoRef = useRef(false);
  const temporizadorRef = useRef<any>(null);

  const totalSlides = IMAGENS_CARROSSEL.length;
  const slideAtual = ((passoAtual % totalSlides) + totalSlides) % totalSlides;

  const mudarPasso = (delta: number) => {
    if (animandoRef.current) return;
    animandoRef.current = true;

    const proximoPasso = passoAtual + delta;
    setPassoAtual(proximoPasso);

    Animated.timing(animPasso, {
      toValue: proximoPasso,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      animandoRef.current = false;
    });
  };

  const irParaSlide = (indexAlvo: number) => {
    if (animandoRef.current || indexAlvo === slideAtual) return;
    animandoRef.current = true;

    let diff = (indexAlvo - slideAtual + totalSlides) % totalSlides;
    if (diff > totalSlides / 2) diff -= totalSlides;

    const proximoPasso = passoAtual + diff;
    setPassoAtual(proximoPasso);

    Animated.timing(animPasso, {
      toValue: proximoPasso,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      animandoRef.current = false;
    });
  };

  useEffect(() => {
    temporizadorRef.current = setInterval(() => {
      mudarPasso(1);
    }, 5000);

    return () => {
      if (temporizadorRef.current) clearInterval(temporizadorRef.current);
    };
  }, [passoAtual]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          mudarPasso(1);
        } else if (gestureState.dx > 50) {
          mudarPasso(-1);
        }
      },
    })
  ).current;

  const linksNavegacao = [
    { label: 'Início', rota: '/' },
    { label: 'Recursos', rota: '/recursos' },
    { label: 'FAQ', rota: '/faq' },
    { label: 'Suporte', rota: '/suporte' },
    { label: 'Termos', rota: '/termos' },
    { label: 'Privacidade', rota: '/privacidade' },
  ];

  const navegarPara = (rota: string) => {
    setMenuAberto(false);
    router.push(rota as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* ─── BOTÃO HAMBÚRGUER FIXO NO MOBILE ─── */}
      {isMobile && (
        <TouchableOpacity
          onPress={() => setMenuAberto(true)}
          style={{
            position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
            top: 18,
            right: 18,
            zIndex: 9999,
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E2EA',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 8,
          }}
          accessibilityLabel="Abrir menu"
          activeOpacity={0.8}
        >
          <View style={{ gap: 5, width: 20 }}>
            <View style={{ height: 2.5, backgroundColor: '#1A1A1E', borderRadius: 2 }} />
            <View style={{ height: 2.5, backgroundColor: '#1A1A1E', borderRadius: 2 }} />
            <View style={{ height: 2.5, backgroundColor: '#1A1A1E', borderRadius: 2 }} />
          </View>
        </TouchableOpacity>
      )}

      <ScrollView
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', paddingHorizontal: sidePadding }}>
          {/* ─── 1. NAVBAR ─── */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: isMobile ? 18 : 24,
              marginBottom: isMobile ? 16 : 36,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: isTablet ? 12 : 20 }}>
              <TouchableOpacity onPress={() => navegarPara('/')} activeOpacity={0.8}>
                <Image
                  source={require('@/img/logoVitta.svg')}
                  style={{ width: 38, height: 38 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {!isMobile && (
                <View style={{ flexDirection: 'row', gap: isTablet ? 12 : 18, alignItems: 'center' }}>
                  {linksNavegacao.map((link) => (
                    <TouchableOpacity key={link.rota} onPress={() => navegarPara(link.rota)}>
                      <Text style={[tipografia.body, { fontSize: isTablet ? 13.5 : 14.5 }]}>{link.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {!isMobile && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ButtonSecondary
                  texto="Entrar"
                  onPress={() => navegarPara('/login')}
                  icone={require('../img/icons/logIn.svg')}
                />
                <ButtonPrimary
                  texto="Cadastrar"
                  onPress={() => navegarPara('/cadastro')}
                  icone={require('../img/icons/setaDireita.svg')}
                />
              </View>
            )}
          </View>

          {/* ─── 2. HERO SECTION ─── */}
          <View
            style={{
              flexDirection: isMobile || isTablet ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 32 : 48,
              marginBottom: isMobile ? 50 : 90,
            }}
          >
            <View style={{ flex: 1, gap: 28, width: '100%', alignItems: isMobile || isTablet ? 'center' : 'flex-start' }}>
              <View style={{ gap: 14, width: '100%', maxWidth: 640 }}>
                <Text
                  style={[
                    tipografia.h1,
                    {
                      fontSize: isMobile ? 30 : isTablet ? 42 : 54,
                      lineHeight: isMobile ? 36 : isTablet ? 48 : 60,
                      textAlign: isMobile || isTablet ? 'center' : 'left',
                    },
                  ]}
                >
                  Organize sua rotina médica em{' '}
                  <Text style={tipografia.highlight}>um só lugar.</Text>
                </Text>

                <Text
                  style={[
                    tipografia.bodySecondary,
                    {
                      textAlign: isMobile || isTablet ? 'center' : 'left',
                      fontSize: isMobile ? 14 : 16,
                      lineHeight: isMobile ? 22 : 24,
                    },
                  ]}
                >
                  Registre consultas, exames, medicamentos e informações importantes para
                  acompanhar a jornada de tratamento com mais segurança e praticidade.
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  flexWrap: 'wrap',
                  justifyContent: isMobile || isTablet ? 'center' : 'flex-start',
                }}
              >
                <ButtonPrimary
                  texto="Cadastrar"
                  onPress={() => navegarPara('/cadastro')}
                  icone={require('../img/icons/setaDireita.svg')}
                />
                <ButtonSecondary
                  texto="Entrar"
                  onPress={() => navegarPara('/login')}
                  icone={require('../img/icons/logIn.svg')}
                />
              </View>
            </View>

            <View
              style={{
                flex: isMobile || isTablet ? undefined : 1,
                width: '100%',
                maxWidth: 480,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={require('../img/heroIllustration.svg')}
                style={{
                  width: '100%',
                  maxWidth: isMobile ? 300 : 440,
                  height: isMobile ? 240 : 340,
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* ─── 3. APRESENTAÇÃO DA PLATAFORMA (CARROSSEL) ─── */}
          <View style={{ marginBottom: isMobile ? 60 : 100, width: '100%', overflow: 'hidden' }}>
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 26 : 38,
                  marginBottom: 28,
                  letterSpacing: -0.5,
                  textAlign: isMobile ? 'center' : 'left',
                  lineHeight: isMobile ? 32 : 44,
                },
              ]}
            >
              Uma plataforma simples e intuitiva.
            </Text>

            <View
              {...panResponder.panHandlers}
              style={{
                position: 'relative',
                width: '100%',
                height: isMobile ? 280 : isTablet ? 420 : 560,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: 1200,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const passoRelativo = passoAtual + offset;
                  const indexFoto = ((passoRelativo % totalSlides) + totalSlides) % totalSlides;
                  const item = IMAGENS_CARROSSEL[indexFoto];

                  const cardLargura = isMobile ? width * 0.86 : Math.min(width * 0.65, 820);
                  const deslocamentoLateral = isMobile ? width * 0.6 : Math.min(width * 0.35, 420);

                  const translateX = animPasso.interpolate({
                    inputRange: [passoRelativo - 1, passoRelativo, passoRelativo + 1],
                    outputRange: [-deslocamentoLateral, 0, deslocamentoLateral],
                    extrapolate: 'clamp',
                  });

                  const scale = animPasso.interpolate({
                    inputRange: [passoRelativo - 1, passoRelativo, passoRelativo + 1],
                    outputRange: [0.85, 1, 0.85],
                    extrapolate: 'clamp',
                  });

                  const opacity = animPasso.interpolate({
                    inputRange: [
                      passoRelativo - 2,
                      passoRelativo - 1,
                      passoRelativo,
                      passoRelativo + 1,
                      passoRelativo + 2,
                    ],
                    outputRange: [0, 0.45, 1, 0.45, 0],
                    extrapolate: 'clamp',
                  });

                  const ehAtivo = offset === 0;

                  return (
                    <Animated.View
                      key={`${item.id}-${passoRelativo}`}
                      style={{
                        position: 'absolute',
                        width: cardLargura,
                        height: isMobile ? 230 : isTablet ? 360 : 480,
                        borderRadius: 20,
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: '#EFEFEF',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: ehAtivo ? 0.14 : 0.05,
                        shadowRadius: ehAtivo ? 24 : 10,
                        elevation: ehAtivo ? 8 : 2,
                        zIndex: 10 - Math.abs(offset),
                        transform: [{ translateX }, { scale }],
                        opacity,
                      }}
                    >
                      <Pressable
                        style={{ width: '100%', height: '100%' }}
                        onPress={() => !ehAtivo && mudarPasso(offset)}
                      >
                        <Image
                          source={item.imagem}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />

                        {!ehAtivo && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(255, 255, 255, 0.25)',
                            }}
                          />
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })}

                <TouchableOpacity
                  onPress={() => mudarPasso(-1)}
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: '50%',
                    marginTop: -22,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E2E2EA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.14,
                    shadowRadius: 8,
                    elevation: 10,
                    zIndex: 25,
                  }}
                  accessibilityLabel="Slide anterior"
                >
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1E' }}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => mudarPasso(1)}
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: '50%',
                    marginTop: -22,
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E2E2EA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.14,
                    shadowRadius: 8,
                    elevation: 10,
                    zIndex: 25,
                  }}
                  accessibilityLabel="Próximo slide"
                >
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A1A1E' }}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                marginTop: 18,
              }}
            >
              {IMAGENS_CARROSSEL.map((_, index) => {
                const ativo = index === slideAtual;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => irParaSlide(index)}
                    style={{
                      width: ativo ? 26 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: ativo ? colors.yellow6 : '#E2E2EA',
                    }}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* ─── 4. SEÇÃO BEGE ─── */}
        <View
          style={{
            width: '100%',
            backgroundColor: '#FFF8ED',
            paddingVertical: isMobile ? 44 : 56,
            alignItems: 'center',
          }}
        >
          <View style={{ width: '100%', paddingHorizontal: sidePadding }}>
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 26 : isTablet ? 34 : 40,
                  lineHeight: isMobile ? 32 : isTablet ? 40 : 46,
                  marginBottom: 36,
                  color: colors.yellow9,
                  maxWidth: 780,
                  textAlign: isMobile ? 'center' : 'left',
                },
              ]}
            >
              Tudo o que você precisa para acompanhar o tratamento do seu filho.
            </Text>

            <View
              style={{
                flexDirection: isMobile || isTablet ? 'column' : 'row',
                gap: 20,
                alignItems: 'stretch',
              }}
            >
              {/* Card Esquerdo Amarelo */}
              <View
                style={{
                  flex: isMobile || isTablet ? undefined : 1,
                  width: '100%',
                  backgroundColor: colors.yellow2,
                  borderRadius: 24,
                  paddingHorizontal: isMobile ? 22 : 36,
                  paddingVertical: isMobile ? 32 : 44,
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <View>
                  <Text
                    style={[
                      tipografia.h2,
                      {
                        lineHeight: isMobile ? 28 : 34,
                        textAlign: isMobile ? 'center' : 'left',
                        fontSize: isMobile ? 22 : 28,
                      },
                    ]}
                  >
                    Toda a rotina médica em{' '}
                    <Text style={[tipografia.highlight, { color: colors.yellow7 }]}>apenas um lugar</Text>
                  </Text>
                  <Text
                    style={[
                      tipografia.body,
                      {
                        marginTop: 10,
                        color: colors.yellow9,
                        textAlign: isMobile ? 'center' : 'left',
                        fontSize: isMobile ? 14 : 15,
                      },
                    ]}
                  >
                    Tenha sob controle toda a rotina médica do seu filho como exames, medicamentos e consultas!
                  </Text>
                </View>

                <Image
                  source={require('../img/medicosCard.svg')}
                  style={{ width: '100%', height: isMobile ? 200 : 250, alignSelf: 'center', marginVertical: 8 }}
                  resizeMode="contain"
                />

                <ButtonBlack
                  texto="Saiba mais"
                  onPress={() => navegarPara('/recursos')}
                  icone={require('../img/icons/setaDireita.svg')}
                />
              </View>

              {/* Coluna Direita (Escuro I.A + Logótipo) */}
              <View style={{ flex: isMobile || isTablet ? undefined : 1.3, width: '100%', gap: 20 }}>
                {/* ── CARD I.A COM OPÇÃO 2 (ESTILO BANNER COM MARCA D'ÁGUA) ── */}
                <View
                  style={{
                    backgroundColor: '#1E1E1E',
                    borderRadius: 24,
                    paddingVertical: isMobile ? 32 : 48,
                    paddingHorizontal: isMobile ? 24 : 40,
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: 289,
                    borderWidth: 1,
                    borderColor: '#2A2A2E',
                  }}
                >
                  {/* Estrela decorativa no fundo para ecrãs móveis */}
                  {isMobile && (
                    <Image
                      source={require('../img/estrelasIa.svg')}
                      style={{
                        position: 'absolute',
                        right: -12,
                        top: -12,
                        width: 125,
                        height: 125,
                        opacity: 0.16,
                      }}
                      resizeMode="contain"
                    />
                  )}

                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'column',
                      gap: isMobile ? 20 : 32,
                      alignItems: 'flex-start',
                      width: '100%',
                      zIndex: 2,
                    }}
                  >
                    <View style={{ gap: 8, maxWidth: isMobile ? 280 : 340 }}>
                      <Text
                        style={[
                          tipografia.h3,
                          {
                            color: colors.white,
                            fontSize: isMobile ? 22 : 26,
                            fontWeight: '700',
                            textAlign: 'left',
                          },
                        ]}
                      >
                        Teste nossa I.A
                      </Text>

                      <Text
                        style={[
                          tipografia.bodySecondary,
                          {
                            color: '#B3B3B3',
                            fontSize: isMobile ? 14 : 15,
                            lineHeight: 20,
                            textAlign: 'left',
                          },
                        ]}
                      >
                        Experimente nossa inteligência artificial para a organização da sua rotina!
                      </Text>
                    </View>

                    <View style={{ width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? 240 : undefined }}>
                      <ButtonWhite
                        texto="Quero experimentar"
                        onPress={() => setModalDemoAberto(true)}
                      />
                    </View>
                  </View>

                  {/* Estrela lateral em Desktop e Tablet */}
                  {!isMobile && (
                    <Image
                      source={require('../img/estrelasIa.svg')}
                      style={{ width: 130, height: 130 }}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* Card do Logótipo Branco */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 32,
                    minHeight: isMobile ? 160 : 200,
                    borderWidth: 1,
                    borderColor: '#F0F0F0',
                  }}
                >
                  <Image
                    source={require('@/img/logotipoVitta.svg')}
                    style={{ width: isMobile ? 140 : 180, height: 55 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─── 5. BANNER CTA ─── */}
        <View style={{ width: '100%', paddingHorizontal: sidePadding, paddingVertical: isMobile ? 36 : 56 }}>
          <View
            style={{
              backgroundColor: colors.yellow2,
              borderRadius: 28,
              paddingVertical: isMobile ? 36 : 60,
              paddingHorizontal: isMobile ? 20 : 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={[
                tipografia.h2,
                {
                  fontSize: isMobile ? 24 : isTablet ? 32 : 38,
                  textAlign: 'center',
                  letterSpacing: -0.5,
                  maxWidth: 620,
                  color: colors.yellow9,
                  lineHeight: isMobile ? 30 : 42,
                },
              ]}
            >
              Comece a se organizar conosco hoje mesmo.
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
              Tenha consultas, exames, medicamentos e informações importantes sempre ao seu alcance.
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ButtonSecondary
                texto="Entrar"
                onPress={() => navegarPara('/login')}
                icone={require('@/img/icons/logIn.svg')}
              />
              <ButtonPrimary
                texto="Cadastrar"
                onPress={() => navegarPara('/cadastro')}
                icone={require('../img/icons/setaDireita.svg')}
              />
            </View>
          </View>
        </View>

        {/* ─── 6. FOOTER ─── */}
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

      {/* ─── MODAL DO MENU HAMBÚRGUER MOBILE ─── */}
      <Modal
        animationType="fade"
        transparent
        visible={menuAberto}
        onRequestClose={() => setMenuAberto(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
          }}
          onPress={() => setMenuAberto(false)}
        >
          <View
            style={{
              width: '80%',
              maxWidth: 320,
              height: '100%',
              backgroundColor: '#FFFFFF',
              padding: 24,
              gap: 20,
              shadowColor: '#000',
              shadowOffset: { width: -4, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 20,
            }}
            onStartShouldSetResponder={() => true}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Image
                source={require('@/img/logoVitta.svg')}
                style={{ width: 34, height: 34 }}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => setMenuAberto(false)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1E' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 }}>
              {linksNavegacao.map((item) => (
                <TouchableOpacity
                  key={item.rota}
                  onPress={() => navegarPara(item.rota)}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                  }}
                >
                  <Text style={[tipografia.body, { fontSize: 16, fontWeight: '600', color: '#1A1A1E' }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 10, marginTop: 'auto', paddingTop: 20 }}>
              <ButtonPrimary
                texto="Cadastrar"
                onPress={() => navegarPara('/cadastro')}
                icone={require('../img/icons/setaDireita.svg')}
              />
              <ButtonSecondary
                texto="Entrar"
                onPress={() => navegarPara('/login')}
                icone={require('../img/icons/logIn.svg')}
              />
            </View>
          </View>
        </Pressable>
      </Modal>

      <VittaIADemoModal
        visivel={modalDemoAberto}
        onFechar={() => setModalDemoAberto(false)}
      />
    </View>
  );
}