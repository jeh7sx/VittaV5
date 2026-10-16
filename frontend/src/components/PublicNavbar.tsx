import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';

interface PublicNavbarProps {
  sidePadding?: number;
}

export function PublicNavbar({ sidePadding }: PublicNavbarProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const pathname = usePathname();

  const [menuAberto, setMenuAberto] = useState(false);

  const paddingHorizontal =
    sidePadding !== undefined ? sidePadding : isMobile ? 20 : width < 1200 ? 48 : 280;

  const links = [
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
    <>
      {/* ─── BOTÃO HAMBÚRGUER FLUTUANTE FIXO NO MOBILE ─── */}
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
            elevation: 10,
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

      {/* ─── NAVBAR PRINCIPAL ─── */}
      <View
        style={{
          width: '100%',
          paddingHorizontal,
          paddingVertical: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          {/* Logótipo */}
          <TouchableOpacity onPress={() => router.push('/')} activeOpacity={0.8}>
            <Image
              source={require('@/img/logoVitta.svg')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Links Desktop */}
          {!isMobile && (
            <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
              {links.map((item) => {
                const ativo =
                  pathname === item.rota ||
                  (item.rota !== '/' && pathname.startsWith(item.rota));
                return (
                  <TouchableOpacity
                    key={item.rota}
                    onPress={() => router.push(item.rota as any)}
                  >
                    <Text
                      style={[
                        tipografia.body,
                        {
                          fontSize: 14.5,
                          fontWeight: ativo ? '700' : '400',
                          color: ativo ? '#F7B500' : '#1A1A1E',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Botões Entrar / Cadastrar Desktop */}
        {!isMobile && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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
        )}
      </View>

      {/* ─── MODAL DA GAVETA LATERAL MOBILE ─── */}
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
              width: '78%',
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Image
                source={require('@/img/logoVitta.svg')}
                style={{ width: 34, height: 34 }}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => setMenuAberto(false)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1E' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14 }}>
              {links.map((item) => {
                const ativo =
                  pathname === item.rota ||
                  (item.rota !== '/' && pathname.startsWith(item.rota));
                return (
                  <TouchableOpacity
                    key={item.rota}
                    onPress={() => navegarPara(item.rota)}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F0F0F0',
                    }}
                  >
                    <Text
                      style={[
                        tipografia.body,
                        {
                          fontSize: 16,
                          fontWeight: ativo ? '700' : '600',
                          color: ativo ? '#F7B500' : '#1A1A1E',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ gap: 10, marginTop: 'auto', paddingTop: 20 }}>
              <ButtonPrimary
                texto="Cadastrar"
                onPress={() => navegarPara('/cadastro')}
                icone={require('@/img/icons/setaDireita.svg')}
              />
              <ButtonSecondary
                texto="Entrar"
                onPress={() => navegarPara('/login')}
                icone={require('@/img/icons/logIn.svg')}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}