import { router, usePathname } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Notificacoes from '../app/(user)/notificacoes';
import { auth, db } from '../services/firebase';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

export type TipoOrdenacao = 'recentes' | 'antigos' | 'az' | 'za';

export interface HeaderProps {
  termoBusca?: string;
  setTermoBusca?: (termo: string) => void;
  ordenacao?: TipoOrdenacao;
  setOrdenacao?: (ordem: TipoOrdenacao) => void;
}

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  criadoEm?: any;
  lida?: boolean;
}

function obterDadosPagina(path: string) {
  const p = (path || '').toLowerCase();
  if (p.includes('medicamento')) {
    return {
      label: 'Medicamentos',
      placeholder: 'Pesquisar medicamentos',
    };
  }
  if (p.includes('consulta')) {
    return {
      label: 'Consultas',
      placeholder: 'Pesquisar consultas',
    };
  }
  if (p.includes('exame')) {
    return {
      label: 'Exames',
      placeholder: 'Pesquisar exames',
    };
  }
  if (p.includes('filho')) {
    return { label: 'Filhos', placeholder: '' };
  }
  if (p.includes('perfil')) {
    return { label: 'Perfil', placeholder: '' };
  }
  if (p.includes('notificac')) {
    return {
      label: 'Notificações',
      placeholder: '',
    };
  }
  return { label: 'Bem vindo ', placeholder: '' };
}

export default function Header({
  termoBusca = '',
  setTermoBusca,
  ordenacao = 'recentes',
  setOrdenacao,
}: HeaderProps) {
  const pathname = usePathname() || '';
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { theme } = useTheme();

  const [buscaInterna, setBuscaInterna] = useState(termoBusca);
  const [ordemInterna, setOrdemInterna] = useState<TipoOrdenacao>(ordenacao);

  const valorBusca = setTermoBusca ? termoBusca : buscaInterna;
  const atualizarBusca = setTermoBusca || setBuscaInterna;

  const valorOrdem = setOrdenacao ? ordenacao : ordemInterna;
  const atualizarOrdem = setOrdenacao || setOrdemInterna;

  const [modalNotif, setModalNotif] = useState(false);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const pathLower = pathname.toLowerCase();
  const exibirBarraPesquisa =
    pathLower.includes('exame') ||
    pathLower.includes('consulta') ||
    pathLower.includes('medicamento');

  const pagina = obterDadosPagina(pathname);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'notificacoes'), where('responsavelId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const lista: Notificacao[] = snap.docs.map((d) => ({
        id: d.id,
        titulo: d.data().titulo ?? '',
        mensagem: d.data().mensagem ?? '',
        criadoEm: d.data().criadoEm,
        lida: d.data().lida ?? false,
      }));
      lista.sort((a, b) => (b.criadoEm?.seconds ?? 0) - (a.criadoEm?.seconds ?? 0));
      setNotificacoes(lista);
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  return (
    <>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          minWidth: 0,
        }}
      >
        {exibirBarraPesquisa ? (
          <View
            style={{
              flex: 1,
              minHeight: 48,
              height: 48,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.cardBg,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 16,
            }}
          >
            {/* Lupa */}
            <View style={{ marginRight: isMobile ? 6 : 12, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={require('@/img/icons/search-01.svg')}
                style={{ width: 18, height: 18, tintColor: theme.gray4 }}
              />
            </View>

            {/* Input */}
            <TextInput
              value={valorBusca}
              onChangeText={(txt) => atualizarBusca(txt)}
              placeholder={isMobile ? 'Pesquisar...' : pagina.placeholder}
              placeholderTextColor={theme.gray4}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                fontSize: 16,
                color: theme.textPrimary,
                // @ts-ignore
                outline: 'none',
                minWidth: 0,
              }}
            />

            {/* Limpar */}
            {Boolean(valorBusca && valorBusca.length > 0) && (
              <TouchableOpacity
                onPress={() => atualizarBusca('')}
                style={{ cursor: 'pointer' as any }}
              >
                <Image
                  source={require('@/img/icons/x.svg')}
                  style={{ marginHorizontal: 16, width: 20, height: 20, tintColor: theme.textSecondary }}
                />
              </TouchableOpacity>
            )}

            {/* Filtro */}
            <TouchableOpacity
              onPress={() => setModalFiltroAberto(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                borderRadius: 8,
                backgroundColor: valorOrdem !== 'recentes' ? theme.yellow1 : 'transparent',
                paddingHorizontal: 8,
                paddingVertical: 4,
                cursor: 'pointer' as any,
                flexShrink: 0,
              }}
            >
              <Image
                source={require('@/img/icons/filter-horizontal.svg')}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: valorOrdem !== 'recentes' ? theme.yellow6 : theme.textSecondary,
                }}
              />
              {!isMobile && (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: valorOrdem !== 'recentes' ? '700' : '500',
                    color: valorOrdem !== 'recentes' ? theme.yellow6 : theme.textSecondary,
                  }}
                >
                  Filtrar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: isMobile ? 48 : 0 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.textPrimary }}>{pagina.label}</Text>
          </View>
        )}
      </View>

      {/* MODAL DE FILTRO */}
      <Modal
        animationType="fade"
        transparent
        visible={modalFiltroAberto}
        onRequestClose={() => setModalFiltroAberto(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            zIndex: 999,
          }}
          activeOpacity={1}
          onPress={() => setModalFiltroAberto(false)}
        >
          <View
            style={{
              width: 310,
              backgroundColor: theme.cardBg,
              borderRadius: 20,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.border,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 18,
              elevation: 6,
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[tipografia.h3, { color: theme.textPrimary, marginBottom: 14 }]}>
              Ordenar e Filtrar
            </Text>

            {[
              { id: 'recentes' as TipoOrdenacao, label: 'Mais recentes primeiro' },
              { id: 'antigos' as TipoOrdenacao, label: 'Mais antigos primeiro' },
              { id: 'az' as TipoOrdenacao, label: 'De A a Z (Título / Nome)' },
              { id: 'za' as TipoOrdenacao, label: 'De Z a A (Título / Nome)' },
            ].map((opcao) => {
              const ativo = valorOrdem === opcao.id;
              return (
                <TouchableOpacity
                  key={opcao.id}
                  onPress={() => {
                    atualizarOrdem(opcao.id);
                    setModalFiltroAberto(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: ativo ? theme.yellow1 : theme.inputBg,
                    borderWidth: 1,
                    borderColor: ativo ? theme.yellow5 : theme.border,
                    marginBottom: 8,
                    cursor: 'pointer' as any,
                  }}
                >
                  <Text
                    style={[
                      tipografia.body,
                      {
                        fontWeight: ativo ? '700' : '500',
                        color: ativo ? (theme.id === 'dark' ? '#FFF' : theme.yellow9) : theme.textPrimary,
                      },
                    ]}
                  >
                    {opcao.label}
                  </Text>
                  {ativo && <Text style={{ color: theme.yellow6, fontWeight: 'bold', fontSize: 15 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL NOTIFICAÇÕES */}
      <Modal
        animationType="fade"
        transparent
        visible={modalNotif}
        onRequestClose={() => setModalNotif(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: isMobile ? '90%' : 460,
              height: '75%',
              backgroundColor: theme.cardBg,
              borderRadius: 20,
              overflow: 'hidden',
              elevation: 5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textPrimary }}>
                Notificações
              </Text>
              <TouchableOpacity
                onPress={() => setModalNotif(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.inputBg,
                  cursor: 'pointer' as any,
                }}
              >
                <Text style={{ fontSize: 14, color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <Notificacoes />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}