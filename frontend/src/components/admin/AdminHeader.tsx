import React from 'react';
import { usePathname } from 'expo-router';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/styles/colors';
import { tipografia } from '@/styles/tipografia';

import {
  useAdminNotificacoesController,
  type AdminNotificacaoItem,
  type TipoNotificacaoAdmin,
} from '@/controllers/useAdminNotificacoesController';

import {
  IconBell,
  IconDashboard,
  IconPersonalizar,
  IconSuporte,
  IconUsers,
} from '../Icons';

type IconeProps = { size?: number; color?: string };

const ROTAS: Record<string, { label: string; Icone: React.ComponentType<IconeProps> }> = {
  '/dashboard': { label: 'Dashboard', Icone: IconDashboard },
  '/usuarios': { label: 'Gerenciar Usuários', Icone: IconUsers },
  '/equipe': { label: 'Equipe de Admins', Icone: IconUsers },
  '/personalizar': { label: 'Personalização', Icone: IconPersonalizar },
  '/suporte': { label: 'Central de Suporte', Icone: IconSuporte },
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    notificacoes,
    naoLidas,
    totalNotificacoes,
    carregando,
    modalAberto,
    setModalAberto,
    filtroAba,
    setFiltroAba,
    marcarComoLida,
    marcarTodasComoLidas,
  } = useAdminNotificacoesController();

  const rotaAtual = Object.keys(ROTAS).find((r) => pathname === r || pathname.startsWith(r + '/'));
  const pagina = rotaAtual ? ROTAS[rotaAtual] : { label: 'Painel Vitta', Icone: IconDashboard };
  const { Icone } = pagina;

  const dataAtualFormatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.gray1,
        paddingHorizontal: isMobile ? 14 : 24,
        paddingVertical: isMobile ? 14 : 20,
        width: '100%',
        gap: 10,
      }}
    >
      {/* Esquerda: Identificação da página atual */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 10 : 14, flex: 1, minWidth: 0 }}>
        <View
          style={{
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: isMobile ? 12 : 14,
            backgroundColor: colors.yellow1,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icone size={isMobile ? 20 : 24} color="#8A5B00" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={[tipografia.h3, { fontSize: isMobile ? 16 : 20 }]}>
            {pagina.label}
          </Text>
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { fontSize: isMobile ? 11 : 13 }]}>
            {dataAtualFormatada} • Painel Administrativo
          </Text>
        </View>
      </View>

      {/* Direita: Botão de Notificações com Badge */}
      <TouchableOpacity
        onPress={() => setModalAberto(true)}
        accessibilityLabel="Notificações"
        activeOpacity={0.8}
        style={{
          width: isMobile ? 40 : 46,
          height: isMobile ? 40 : 46,
          borderRadius: isMobile ? 12 : 14,
          backgroundColor: '#F8F9FA',
          borderWidth: 1,
          borderColor: '#EFEFEF',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <IconBell color="#333333" />
        {naoLidas > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#D93025',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 3,
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
              {naoLidas > 9 ? '9+' : naoLidas}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal Centralizado / Dropdown de Notificações */}
      <Modal
        animationType="fade"
        transparent
        visible={modalAberto}
        onRequestClose={() => setModalAberto(false)}
      >
        <Pressable
          onPress={() => setModalAberto(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: 460,
              maxWidth: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: isMobile ? 18 : 22,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Topo do Modal */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: isMobile ? 16 : 18, fontWeight: '800', color: '#1A1A1A' }}>
                  Atividades Recentes
                </Text>
                {naoLidas > 0 && (
                  <View
                    style={{
                      backgroundColor: '#FDECEC',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#B00020' }}>
                      {naoLidas} novas
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                {naoLidas > 0 && (
                  <TouchableOpacity onPress={marcarTodasComoLidas}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.yellow9 }}>
                      Marcar lidas
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setModalAberto(false)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={20} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Separador de Abas */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                padding: 4,
                marginBottom: 16,
                gap: 4,
              }}
            >
              <TouchableOpacity
                onPress={() => setFiltroAba('todas')}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: filtroAba === 'todas' ? '#FFFFFF' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: filtroAba === 'todas' ? '700' : '500',
                    color: filtroAba === 'todas' ? '#111827' : '#6B7280',
                  }}
                >
                  Todas ({totalNotificacoes})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFiltroAba('nao_lidas')}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: filtroAba === 'nao_lidas' ? '#FFFFFF' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: filtroAba === 'nao_lidas' ? '700' : '500',
                    color: filtroAba === 'nao_lidas' ? '#111827' : '#6B7280',
                  }}
                >
                  Não lidas ({naoLidas})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista com Rolagem */}
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {carregando ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#F7B500" />
                </View>
              ) : notificacoes.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
                  <Ionicons name="notifications-off-outline" size={32} color="#AAA" />
                  <Text style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
                    Nenhuma notificação por ler no momento.
                  </Text>
                </View>
              ) : (
                notificacoes.map((item) => (
                  <ItemNotificacaoAdmin
                    key={item.id}
                    item={item}
                    onMarcarLida={() => marcarComoLida(item.id)}
                  />
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ItemNotificacaoAdmin({
  item,
  onMarcarLida,
}: {
  item: AdminNotificacaoItem;
  onMarcarLida: () => void;
}) {
  const config = obterEstiloTipo(item.tipo);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => !item.lida && onMarcarLida()}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 12,
        borderRadius: 14,
        backgroundColor: item.lida ? '#FAFAFA' : '#FFFDF7',
        borderWidth: 1,
        borderColor: item.lida ? '#F0F0F0' : '#FCE7B8',
        marginBottom: 8,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: config.bg,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 2,
          flexShrink: 0,
        }}
      >
        <Ionicons name={config.icone as any} size={18} color={config.cor} />
      </View>

      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              fontWeight: item.lida ? '600' : '800',
              color: item.lida ? '#555555' : '#1A1A1A',
              flex: 1,
            }}
          >
            {item.titulo}
          </Text>
          <Text style={{ fontSize: 11, color: '#A3A3A3', marginLeft: 6 }}>{item.horario}</Text>
        </View>

        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            color: item.lida ? '#737373' : '#404040',
            lineHeight: 16,
          }}
        >
          {item.descricao}
        </Text>
      </View>

      {!item.lida && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.yellow5,
            marginTop: 6,
            flexShrink: 0,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

function obterEstiloTipo(tipo: TipoNotificacaoAdmin) {
  switch (tipo) {
    case 'usuario':
      return {
        icone: 'person-add-outline',
        cor: '#2563EB',
        bg: '#EFF6FF',
      };
    case 'filho':
      return {
        icone: 'people-outline',
        cor: '#059669',
        bg: '#ECFDF5',
      };
    case 'perfil':
      return {
        icone: 'checkmark-circle-outline',
        cor: '#D97706',
        bg: '#FFFBEB',
      };
    default:
      return {
        icone: 'alert-circle-outline',
        cor: '#DC2626',
        bg: '#FEF2F2',
      };
  }
}