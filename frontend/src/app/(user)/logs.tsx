import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLogsController, LogItem } from '@/controllers/useLogsController';
import { styles } from '../../styles/app/(user)/logs';

import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';
import { colors } from '@/styles/colors';
import { tipografia } from '@/styles/tipografia';

export default function Logs() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 768;

  const {
    logsFiltrados,
    carregando,
    termoBusca,
    setTermoBusca,
    filtroCategoria,
    setFiltroCategoria,
    contadores,
    recarregar,
  } = useLogsController();

  return (
    <View style={styles.pagina}>
      <BotaoVittaIA />

      <View style={{ flex: 1, minWidth: 0 }}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent, { padding: isNarrow ? 12 : 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={[styles.cabecalho, isNarrow && { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View>
              <Text style={tipografia.h2}>Logs do Sistema</Text>
              <Text style={tipografia.bodySecondary}>
                Registo de auditoria, ações de utilizadores e eventos da plataforma.
              </Text>
            </View>
          </View>

          {/* Barra de Busca + Botão Recarregar */}
          <View style={styles.linhaAcoes}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput
                style={styles.inputBusca}
                placeholder="Pesquisar por nome, CPF, tipo ou mensagem..."
                placeholderTextColor="#9CA3AF"
                value={termoBusca}
                onChangeText={setTermoBusca}
              />
              {termoBusca.length > 0 && (
                <TouchableOpacity onPress={() => setTermoBusca('')}>
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={recarregar}
              style={styles.btnRecarregar}
              accessibilityLabel="Recarregar logs"
            >
              <Ionicons name="reload" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Filtros por Categorias */}
          <View style={styles.linhaFiltros}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFiltroCategoria('todos')}
              style={[
                styles.chipFiltro,
                {
                  backgroundColor: filtroCategoria === 'todos' ? colors.yellow1 : '#FFFFFF',
                  borderColor: filtroCategoria === 'todos' ? colors.yellow5 : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  tipografia.caption,
                  {
                    color: filtroCategoria === 'todos' ? '#5B4511' : '#777',
                    fontWeight: filtroCategoria === 'todos' ? '700' : '500',
                  },
                ]}
              >
                Todos
              </Text>
              <View
                style={[
                  styles.badgeContador,
                  { backgroundColor: filtroCategoria === 'todos' ? colors.yellow2 : '#F0F0F0' },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#555' }}>
                  {contadores.todos}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFiltroCategoria('cadastros')}
              style={[
                styles.chipFiltro,
                {
                  backgroundColor: filtroCategoria === 'cadastros' ? '#DCFCE7' : '#FFFFFF',
                  borderColor: filtroCategoria === 'cadastros' ? '#22C55E' : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  tipografia.caption,
                  {
                    color: filtroCategoria === 'cadastros' ? '#15803D' : '#777',
                    fontWeight: filtroCategoria === 'cadastros' ? '700' : '500',
                  },
                ]}
              >
                Cadastros
              </Text>
              <View
                style={[
                  styles.badgeContador,
                  { backgroundColor: filtroCategoria === 'cadastros' ? '#BBF7D0' : '#F0F0F0' },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D' }}>
                  {contadores.cadastros}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFiltroCategoria('edicoes')}
              style={[
                styles.chipFiltro,
                {
                  backgroundColor: filtroCategoria === 'edicoes' ? '#FEF3C7' : '#FFFFFF',
                  borderColor: filtroCategoria === 'edicoes' ? '#F59E0B' : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  tipografia.caption,
                  {
                    color: filtroCategoria === 'edicoes' ? '#B45309' : '#777',
                    fontWeight: filtroCategoria === 'edicoes' ? '700' : '500',
                  },
                ]}
              >
                Edições
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFiltroCategoria('erros')}
              style={[
                styles.chipFiltro,
                {
                  backgroundColor: filtroCategoria === 'erros' ? '#FEE2E2' : '#FFFFFF',
                  borderColor: filtroCategoria === 'erros' ? '#EF4444' : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  tipografia.caption,
                  {
                    color: filtroCategoria === 'erros' ? '#B91C1C' : '#777',
                    fontWeight: filtroCategoria === 'erros' ? '700' : '500',
                  },
                ]}
              >
                Erros
              </Text>
              <View
                style={[
                  styles.badgeContador,
                  { backgroundColor: filtroCategoria === 'erros' ? '#FECACA' : '#F0F0F0' },
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#B91C1C' }}>
                  {contadores.erros}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Listagem de Logs */}
          {carregando ? (
            <ActivityIndicator size="large" color="#F0A900" style={{ marginTop: 40 }} />
          ) : logsFiltrados.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="document-text-outline" size={28} color="#888" />
              </View>
              <Text style={tipografia.h3}>Nenhum registo encontrado</Text>
              <Text style={[tipografia.bodySecondary, { textAlign: 'center', maxWidth: 360 }]}>
                Não há logs correspondentes aos filtros ou dados de pesquisa informados.
              </Text>
            </View>
          ) : (
            <View>
              {logsFiltrados.map((item: LogItem) => (
                <CardLogItem key={item.id} log={item} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE DO CARD DE LOG COM NOME E CPF
// ─────────────────────────────────────────────────────────────

function CardLogItem({ log }: { log: LogItem }) {
  const { corFundo, corTexto } = obterEstiloTipo(log.tipo, log.mensagem);

  return (
    <View style={styles.cardLog}>
      <View style={styles.cardLogHeader}>
        <View style={[styles.badgeTipo, { backgroundColor: corFundo }]}>
          <Text style={[styles.badgeTipoTexto, { color: corTexto }]}>
            {log.tipo.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.horaLog}>{log.dataHoraFormatada}</Text>
      </View>

      <View style={styles.cardLogCorpo}>
        <Text style={styles.mensagemTexto}>{log.mensagem}</Text>
      </View>

      {/* Exibição do Nome e CPF no rodapé do Card */}
      <View style={styles.usuarioDadosLinha}>
        <View style={styles.usuarioInfoItem}>
          <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.usuarioTextoValor}>{log.nomeUsuario}</Text>
        </View>

        <View style={styles.usuarioInfoItem}>
          <Ionicons name="card-outline" size={15} color="#6B7280" />
          <Text style={styles.usuarioTextoValor}>CPF: {log.cpfUsuario || '—'}</Text>
        </View>
      </View>
    </View>
  );
}

function obterEstiloTipo(tipo: string, mensagem: string) {
  const t = (tipo || '').toLowerCase();
  const m = (mensagem || '').toLowerCase();

  if (t.includes('erro') || m.includes('erro') || t.includes('falha')) {
    return {
      corFundo: '#FEE2E2',
      corTexto: '#B91C1C',
    };
  }

  if (t.includes('cadastro') || t.includes('novo') || t.includes('criado')) {
    return {
      corFundo: '#DCFCE7',
      corTexto: '#15803D',
    };
  }

  if (t.includes('edicao') || t.includes('update')) {
    return {
      corFundo: '#FEF3C7',
      corTexto: '#B45309',
    };
  }

  return {
    corFundo: '#E0F2FE',
    corTexto: '#0369A1',
  };
}