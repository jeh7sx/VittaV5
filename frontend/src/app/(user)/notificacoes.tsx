import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { useNotificacoesController, NotificacaoItem } from '@/controllers/useNotificacoesController';
import { useTheme } from '@/context/ThemeContext';
import { styles } from '../../styles/app/(user)/notificacoes';

import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { tipografia } from '@/styles/tipografia';

export default function Notificacoes() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 768;

  const { theme } = useTheme();

  const {
    filhoSelecionado,
    loading,
    filtroLido,
    setFiltroLido,
    contadores,
    notificacoesExibidas,
    marcarComoLida,
    marcarTodasComoLidas,
  } = useNotificacoesController();

  return (
    <View style={[styles.pagina, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />

      <View style={{ flex: 1, minWidth: 0 }}>
        <ScrollView
          style={[styles.scrollContainer, { backgroundColor: theme.bg }]}
          contentContainerStyle={[styles.scrollContent, { padding: isNarrow ? 12 : 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View
            style={[
              styles.cabecalho,
              { flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'flex-start' : 'center' },
            ]}
          >
            <View>
              <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Notificações</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                {filhoSelecionado ? (
                  <>
                    Avisos e lembretes de
                    <Text style={{ fontWeight: '600', color: theme.textPrimary }}>
                      {' '}{filhoSelecionado.nome}
                    </Text>
                  </>
                ) : (
                  'Todos os avisos e agendamentos gerais.'
                )}
              </Text>
            </View>

            {contadores.naoLidas > 0 && (
              <ButtonSecondary
                texto="Marcar lidas"
                icone={require('@/img/icons/check.svg')}
                onPress={marcarTodasComoLidas}
                style={{ alignSelf: isNarrow ? 'stretch' : 'auto' }}
              />
            )}
          </View>

          {/* Chips de Filtro Rápido */}
          <View style={styles.linhaFiltros}>
            {(['todas', 'nao_lidas', 'lidas'] as const).map((tipo) => {
              const ativo = filtroLido === tipo;
              const rotulos = { todas: 'Todas', nao_lidas: 'Não lidas', lidas: 'Lidas' };
              const qtd = tipo === 'todas' ? contadores.todas : tipo === 'nao_lidas' ? contadores.naoLidas : null;

              return (
                <TouchableOpacity
                  key={tipo}
                  activeOpacity={0.8}
                  onPress={() => setFiltroLido(tipo)}
                  style={[
                    styles.chipFiltro,
                    {
                      backgroundColor: ativo ? theme.yellow1 : theme.cardBg,
                      borderColor: ativo ? theme.yellow5 : theme.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      tipografia.caption,
                      {
                        color: ativo ? (theme.id === 'dark' ? '#FFF' : theme.yellow9) : theme.textSecondary,
                        fontWeight: ativo ? '700' : '500',
                      },
                    ]}
                  >
                    {rotulos[tipo]}
                  </Text>
                  {qtd !== null && (
                    <View
                      style={[
                        styles.badgeContador,
                        { backgroundColor: ativo ? theme.yellow2 : theme.inputBg },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textPrimary }}>
                        {qtd}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Conteúdo Principal */}
          {loading ? (
            <ActivityIndicator size="large" color="#F0A900" style={{ marginTop: 40 }} />
          ) : notificacoesExibidas.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={[styles.emptyIconBox, { backgroundColor: theme.yellow1 }]}>
                <Image
                  source={require('@/img/icons/check.svg')}
                  style={{ width: 28, height: 28, tintColor: theme.yellow6 }}
                />
              </View>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Tudo em dia!</Text>
              <Text style={[tipografia.bodySecondary, { textAlign: 'center', maxWidth: 360, color: theme.textSecondary }]}>
                {filtroLido === 'nao_lidas'
                  ? 'Não tem nenhuma notificação pendente por ler.'
                  : 'Nenhum aviso encontrado para este filtro.'}
              </Text>
            </View>
          ) : (
            <View>
              {notificacoesExibidas.map(item => (
                <CardNotificacaoItem
                  key={item.id}
                  item={item}
                  theme={theme}
                  onMarcarComoLida={() => marcarComoLida(item.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function CardNotificacaoItem({
  item,
  theme,
  onMarcarComoLida,
}: {
  item: NotificacaoItem;
  theme: any;
  onMarcarComoLida: () => void;
}) {
  const { icone, cor, bg } = obterConfigIcone(item.titulo, theme);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => !item.lida && onMarcarComoLida()}
      style={[
        styles.cardNotificacao,
        { backgroundColor: theme.cardBg, borderColor: theme.border },
        !item.lida && { backgroundColor: theme.yellow1, borderColor: theme.yellow5 },
      ]}
    >
      <View style={[styles.iconeBox, { backgroundColor: bg }]}>
        <Image source={icone} style={{ width: 22, height: 22, tintColor: cor }} resizeMode="contain" />
      </View>

      <View style={styles.conteudoTexto}>
        <View style={styles.topoLinhaItem}>
          <Text
            numberOfLines={1}
            style={[
              tipografia.body,
              { fontWeight: item.lida ? '500' : '700', color: theme.textPrimary },
            ]}
          >
            {item.titulo}
          </Text>

          {!item.lida && <View style={[styles.pontoDestaqueNaoLido, { backgroundColor: theme.yellow5 }]} />}
        </View>

        <Text
          style={[
            tipografia.caption,
            { color: theme.textSecondary, lineHeight: 18 },
          ]}
        >
          {item.mensagem}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function obterConfigIcone(titulo: string, theme: any) {
  const t = (titulo || '').toLowerCase();

  if (t.includes('medicamento') || t.includes('remédio')) {
    return {
      icone: require('@/img/icons/medicamento.svg'),
      cor: theme.Med,
      bg: theme.bgMed,
    };
  }
  if (t.includes('consulta')) {
    return {
      icone: require('@/img/icons/stethoscope-02.svg'),
      cor: theme.Consul,
      bg: theme.bgConsul,
    };
  }
  if (t.includes('exame')) {
    return {
      icone: require('@/img/icons/microscope.svg'),
      cor: theme.Exame,
      bg: theme.bgExame,
    };
  }
  if (t.includes('filho') || t.includes('criança')) {
    return {
      icone: require('@/img/icons/user.svg'),
      cor: theme.yellow6,
      bg: theme.yellow1,
    };
  }

  return {
    icone: require('@/img/icons/clock-01.svg'),
    cor: theme.textSecondary,
    bg: theme.inputBg,
  };
}