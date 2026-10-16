import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';

import { VittaIADemoModal } from '../components/VittaIADemoModal';
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';

export default function Index() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  const [modalDemoAberto, setModalDemoAberto] = useState(false);

  return (
	  <ScrollView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center' }}
	  >
	  <PublicNavbar />

      <View style={{ width: '100%', maxWidth: 1240, paddingHorizontal: isMobile ? 20 : 40 }}>

        {/* ─── 1. HEADER ──────────────────────────────────────────────
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 24,
            marginBottom: isMobile ? 20 : 40,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
            <Image
              source={require('../img/logoVitta.svg')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />

            {!isMobile && (
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#1A1A1A', fontWeight: '700' }}>Início</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>Recursos</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>Vitta I.A</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#666', fontWeight: '500' }}>FAQ</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                paddingHorizontal: isMobile ? 14 : 20,
                paddingVertical: 10,
                backgroundColor: '#FFF',
              }}
            >
              <Text style={{ fontSize: 13.5, color: '#1A1A1A', fontWeight: '600' }}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/cadastro')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F7B500',
                borderRadius: 12,
                paddingHorizontal: isMobile ? 14 : 20,
                paddingVertical: 11,
              }}
            >
              <Text style={{ fontSize: 13.5, color: '#1A1A1A', fontWeight: '700' }}>Quero conhecer</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* ─── 2. HERO SECTION ──────────────────────────────────────── */}
        <View
          style={{
            flexDirection: isTablet ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMobile ? 60 : 100,
            gap: 40,
          }}
        >
          <View style={{ flex: 1, maxWidth: isTablet ? '100%' : 540 }}>
            {/* Tag Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#FFF8E1',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                alignSelf: 'flex-start',
                marginBottom: 18,
                borderWidth: 1,
                borderColor: '#FDE68A',
              }}
            >
              <Text style={{ fontSize: 12 }}>✨</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#B45309' }}>
                Gestão médica pediátrica completa
              </Text>
            </View>

            <Text
              style={{
                fontSize: isMobile ? 36 : 52,
                lineHeight: isMobile ? 42 : 58,
                fontWeight: '900',
                color: '#181818',
                letterSpacing: -0.5,
              }}
            >
              Organize sua rotina médica em{' '}
              <Text style={{ color: '#F7B500' }}>um só lugar.</Text>
            </Text>

            <Text
              style={{
                color: '#6C6C6C',
                marginTop: 18,
                fontSize: 15,
                lineHeight: 24,
              }}
            >
              Registre consultas, exames, medicamentos com lembretes e acompanhe a
              jornada de saúde do seu filho com inteligência e tranquilidade.
            </Text>

            <View style={{ flexDirection: 'row', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
              <TouchableOpacity
                onPress={() => router.push('/cadastro')}
                style={{
                  backgroundColor: '#F7B500',
                  borderRadius: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>
                  Criar conta gratuita
                </Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>➔</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/login')}
                style={{
                  borderWidth: 1,
                  borderColor: '#222',
                  borderRadius: 12,
                  paddingHorizontal: 22,
                  paddingVertical: 14,
                  backgroundColor: '#FFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>Fazer login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('../img/heroIllustration.svg')}
              style={{ width: isMobile ? 300 : 460, height: isMobile ? 260 : 380 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ─── 3. APRESENTAÇÃO DA PLATAFORMA COM CARDS DE DESTAQUE ─── */}
        <View style={{ marginBottom: isMobile ? 70 : 120 }}>
          <View style={{ textAlign: 'center', alignItems: 'center', marginBottom: 40 }}>
            <Text
              style={{
                fontSize: isMobile ? 28 : 40,
                fontWeight: '900',
                color: '#181818',
                textAlign: 'center',
                letterSpacing: -0.5,
              }}
            >
              Uma plataforma simples e intuitiva.
            </Text>
            <Text style={{ fontSize: 15, color: '#666', marginTop: 8, textAlign: 'center' }}>
              Painel sincronizado em tempo real para pais e cuidadores
            </Text>
          </View>

          <View
            style={{
              flexDirection: isTablet ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Card Flutuante 1: Lembrete de Medicamento */}
            {!isTablet && (
              <View
                style={{
                  width: 170,
                  backgroundColor: '#FFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#F0F0F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  elevation: 4,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#EAF4FF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>💊</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1A1A1A' }}>
                  Próxima Dose
                </Text>
                <Text style={{ fontSize: 11.5, color: '#666' }}>Dipirona • 5 gotas</Text>
                <View
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#1A73E8' }}>
                    ⏰ 14:00 (Tarde)
                  </Text>
                </View>
              </View>
            )}

            {/* Mockup Central do Painel */}
            <View
              style={{
                flex: 1,
                maxWidth: 880,
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: '#FFF',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.1,
                shadowRadius: 30,
                elevation: 8,
              }}
            >
              <Image
                source={require('../img/mockupPlataforma.png')}
                style={{ width: '100%', height: isMobile ? 240 : 460 }}
                resizeMode="cover"
              />
            </View>

            {/* Card Flutuante 2: Consulta & Alerta */}
            {!isTablet && (
              <View
                style={{
                  width: 170,
                  backgroundColor: '#FFF',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#F0F0F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  elevation: 4,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E6F9EE',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16 }}>🩺</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1A1A1A' }}>
                  Consulta Marcada
                </Text>
                <Text style={{ fontSize: 11.5, color: '#666' }}>Dr(a). Cláudio Silva</Text>
                <View
                  style={{
                    backgroundColor: '#E6F9EE',
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#1E8C45' }}>
                    ✓ Confirmada
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ─── 4. SEÇÃO BEGE: RECURSOS E FUNCIONALIDADES ──────────────── */}
      <View
        style={{
          width: '100%',
          backgroundColor: '#FFF8ED',
          paddingVertical: isMobile ? 50 : 90,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: 1240, paddingHorizontal: isMobile ? 20 : 40 }}>
          <Text
            style={{
              fontSize: isMobile ? 28 : 42,
              lineHeight: isMobile ? 32 : 48,
              fontWeight: '900',
              color: '#342109',
              marginBottom: 40,
              maxWidth: 700,
              letterSpacing: -0.5,
            }}
          >
            Tudo o que você precisa para acompanhar o tratamento do seu filho.
          </Text>

          <View
            style={{
              flexDirection: isTablet ? 'column' : 'row',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            {/* Card Amarelo Principal (Rotina Médica) */}
            <View
              style={{
                flex: 1,
                backgroundColor: '#ECC87C',
                borderRadius: 28,
                padding: 32,
                justifyContent: 'space-between',
                minHeight: 520,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: '900',
                    color: '#222',
                    lineHeight: 32,
                  }}
                >
                  Toda a rotina médica em{' '}
                  <Text style={{ color: '#A06800' }}>apenas um lugar</Text>
                </Text>
                <Text style={{ marginTop: 10, color: '#444', fontSize: 14, lineHeight: 20 }}>
                  Tenha total controle dos exames, receitas, medicamentos e consultas de todos os seus filhos de forma centralizada.
                </Text>
              </View>

              <Image
                source={require('../img/medicosCard.svg')}
                style={{ width: '100%', height: 250, alignSelf: 'center', marginVertical: 10 }}
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={() => router.push('/cadastro')}
                style={{
                  backgroundColor: '#181818',
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Começar agora</Text>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>➔</Text>
              </TouchableOpacity>
            </View>

            {/* Coluna Direita (Dois Cards) */}
            <View style={{ flex: 1.4, gap: 24 }}>
              {/* Card 1: Assistente I.A */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 28,
                  padding: 32,
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 240,
                }}
              >
                <View style={{ flex: 1, minWidth: 200 }}>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFF' }}>
                    Conheça a Vitta I.A
                  </Text>
                  <Text style={{ color: '#A5A5A5', marginTop: 8, fontSize: 13, lineHeight: 19 }}>
                    Tire dúvidas, organize posologias e resuma relatórios médicos com nossa assistente inteligente.
                  </Text>

                  <TouchableOpacity
                    onPress={() => setModalDemoAberto(true)}
                    style={{
                      backgroundColor: '#F7B500',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 18,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 18,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: '#1A1A1A', fontWeight: '700', fontSize: 13 }}>
                      Testar demonstração
                    </Text>
                    <Text style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 'bold' }}>➔</Text>
                  </TouchableOpacity>
                </View>

                <Image
                  source={require('../img/estrelasIa.svg')}
                  style={{ width: 130, height: 130, marginTop: isMobile ? 18 : 0 }}
                  resizeMode="contain"
                />
              </View>

              {/* Card 2: Geolocalização & Rotas (Substituindo o card vazio) */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 28,
                  padding: 32,
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  minHeight: 240,
                  borderWidth: 1,
                  borderColor: '#EFEFEF',
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: '#FFF8E1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🗺️</Text>
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A' }}>
                    Hospitais & Rotas Integradas
                  </Text>
                  <Text style={{ color: '#666', marginTop: 6, fontSize: 13, lineHeight: 19 }}>
                    Encontre hospitais, clínicas e trace rotas diretas no Google Maps para nunca se atrasar.
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#F9FAFB',
                    padding: 16,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    marginTop: isMobile ? 16 : 0,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A' }}>
                    📍 Google Maps / Waze
                  </Text>
                  <Text style={{ fontSize: 11, color: '#1E8C45', fontWeight: '600', marginTop: 2 }}>
                    ✓ Rotas em 1 clique
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ─── 5. PILARES DE CONFIANÇA & SEGURANÇA ───────────────────── */}
      <View style={{ width: '100%', maxWidth: 1240, paddingHorizontal: isMobile ? 20 : 40, paddingVertical: isMobile ? 50 : 80 }}>
        <View
          style={{
            flexDirection: isTablet ? 'column' : 'row',
            gap: 24,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 28, marginBottom: 10 }}>🔒</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 }}>
              Privacidade Blindada
            </Text>
            <Text style={{ fontSize: 13.5, color: '#666', lineHeight: 20 }}>
              Dados de saúde do seu filho protegidos com criptografia e regras estritas de segurança.
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 28, marginBottom: 10 }}>🔔</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 }}>
              Lembretes Automáticos
            </Text>
            <Text style={{ fontSize: 13.5, color: '#666', lineHeight: 20 }}>
              Receba avisos pontuais de dosagens e consultas diretamente na sua conta.
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#F0F0F0' }}>
            <Text style={{ fontSize: 28, marginBottom: 10 }}>📸</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 }}>
              Fotos & Anexos de Exames
            </Text>
            <Text style={{ fontSize: 13.5, color: '#666', lineHeight: 20 }}>
              Guarde receitas e laudos em fotos com zoom e opção de download a qualquer momento.
            </Text>
          </View>
        </View>
      </View>

      {/* ─── 6. BANNER CTA FINAL ──────────────────────────────────── */}
      <View style={{ width: '100%', maxWidth: 1240, paddingHorizontal: isMobile ? 20 : 40, marginBottom: isMobile ? 40 : 70 }}>
        <View
          style={{
            backgroundColor: '#F3DFC0',
            borderRadius: 32,
            paddingVertical: isMobile ? 40 : 60,
            paddingHorizontal: isMobile ? 24 : 50,
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Círculos decorativos */}
          <View
            style={{
              position: 'absolute',
              bottom: -60,
              left: -40,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: '#DE9E12',
            }}
          />

          <View
            style={{
              position: 'absolute',
              top: -50,
              right: -30,
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: '#EDCD9F',
            }}
          />

          <Text
            style={{
              fontSize: isMobile ? 28 : 42,
              textAlign: 'center',
              fontWeight: '900',
              color: '#181818',
              letterSpacing: -0.5,
              maxWidth: 620,
            }}
          >
            Comece a se organizar conosco hoje mesmo.
          </Text>

          <Text
            style={{
              color: '#666',
              textAlign: 'center',
              marginTop: 14,
              fontSize: 14,
              maxWidth: 480,
            }}
          >
            Tenha consultas, exames, medicamentos e informações importantes sempre ao seu alcance.
          </Text>

          <View style={{ flexDirection: 'row', gap: 14, marginTop: 28 }}>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              style={{
                borderWidth: 1,
                borderColor: '#222',
                borderRadius: 12,
                paddingHorizontal: 22,
                paddingVertical: 12,
                backgroundColor: '#FFF',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontWeight: '600', color: '#1A1A1A', fontSize: 13.5 }}>➔ Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/cadastro')}
              style={{
                backgroundColor: '#DE9E12',
                borderRadius: 12,
                paddingHorizontal: 22,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text style={{ fontWeight: '700', color: '#1A1A1A', fontSize: 13.5 }}>➔ Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── 7. FOOTER ───────────────────────────────────── */}
      {/* <View
        style={{
          width: '100%',
          backgroundColor: '#181818',
          paddingVertical: 45,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 1240,
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={require('../img/logoVitta.svg')}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#FFF' }}>
              Vitta<Text style={{ color: '#F7B500' }}>.</Text>
            </Text>
          </View>

          <Text style={{ color: '#888', fontSize: 13 }}>
            © {new Date().getFullYear()} Vitta — Cuidado e saúde infantil. Todos os direitos reservados.
          </Text>

          <View style={{ flexDirection: 'row', gap: 18 }}>
            <TouchableOpacity>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Privacidade</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Termos de Uso</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={{ color: '#AAA', fontSize: 12 }}>Suporte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View> */}

      {/* Modal Demo Vitta IA */}
      <VittaIADemoModal
        visivel={modalDemoAberto}
        onFechar={() => setModalDemoAberto(false)}
      />
	  	<PublicFooter />
    </ScrollView>
  );
}