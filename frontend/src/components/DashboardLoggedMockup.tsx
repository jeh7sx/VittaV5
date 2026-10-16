import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

export const DashboardLoggedMockup: React.FC = () => {
  const [etapa, setEtapa] = useState<number>(0);
  const [remedioTomado, setRemedioTomado] = useState<boolean>(false);

  // Animação cíclica contínua (estilo GIF)
  useEffect(() => {
    const timer = setInterval(() => {
      setEtapa((prev) => {
        const proxima = (prev + 1) % 3;
        if (proxima === 0) setRemedioTomado(false);
        if (proxima >= 1) setRemedioTomado(true);
        return proxima;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Moldura de Navegador / MacBook */}
      <View style={styles.browserFrame}>
        {/* Top Bar do Navegador */}
        <View style={styles.browserHeader}>
          <View style={styles.trafficLights}>
            <View style={[styles.dot, { backgroundColor: '#FF5F56' }]} />
            <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
            <View style={[styles.dot, { backgroundColor: '#27C93F' }]} />
          </View>
          <View style={styles.addressBar}>
            <Text style={styles.addressLock}>🔒</Text>
            <Text style={styles.addressText}>app.vitta.com.br/visaoGeral</Text>
          </View>
          <View style={{ width: 48 }} />
        </View>

        {/* Layout Interno do Sistema Logado */}
        <View style={styles.appContainer}>
          {/* Sidebar Esquerda */}
          <View style={styles.sidebar}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Text style={{ fontSize: 13 }}>💛</Text>
              </View>
              <Text style={styles.brandTitle}>Vitta</Text>
            </View>

            <View style={styles.navMenu}>
              <View style={[styles.navItem, styles.navItemActive]}>
                <Text style={styles.navItemIcon}>📊</Text>
                <Text style={[styles.navItemText, styles.navItemTextActive]}>Visão Geral</Text>
              </View>
              <View style={styles.navItem}>
                <Text style={styles.navItemIcon}>🧪</Text>
                <Text style={styles.navItemText}>Exames</Text>
              </View>
              <View style={styles.navItem}>
                <Text style={styles.navItemIcon}>💊</Text>
                <Text style={styles.navItemText}>Medicamentos</Text>
              </View>
              <View style={styles.navItem}>
                <Text style={styles.navItemIcon}>🩺</Text>
                <Text style={styles.navItemText}>Consultas</Text>
              </View>
            </View>

            {/* Perfil do Paciente no Rodapé da Sidebar */}
            <View style={styles.sidebarPerfil}>
              <View style={styles.avatarPaciente}>
                <Text style={{ fontSize: 12 }}>👧</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nomePaciente} numberOfLines={1}>Mavie (Filha)</Text>
                <Text style={styles.statusPaciente}>● Em tratamento</Text>
              </View>
            </View>
          </View>

          {/* Conteúdo Principal / Dashboard */}
          <View style={styles.mainContent}>
            {/* Topbar do Usuário Logado */}
            <View style={styles.topbar}>
              <View>
                <Text style={styles.boasVindas}>Olá, Carolina 👋</Text>
                <Text style={styles.dataHoje}>Domingo, 23 de Agosto • Ciclo 3</Text>
              </View>
              <View style={styles.userProfile}>
                <View style={styles.notifBtn}>
                  <Text style={{ fontSize: 13 }}>🔔</Text>
                  <View style={styles.notifBadge} />
                </View>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>C</Text>
                </View>
              </View>
            </View>

            {/* Cards de Métricas / Resumo */}
            <View style={styles.metricasRow}>
              <View style={styles.metricaCard}>
                <Text style={styles.metricaLabel}>Remédios Hoje</Text>
                <Text style={styles.metricaValor}>
                  {remedioTomado ? '1 de 3 tomados' : '0 de 3 tomados'}
                </Text>
                <View style={styles.barraProgressoBg}>
                  <View
                    style={[
                      styles.barraProgressoFill,
                      { width: remedioTomado ? '33%' : '0%' },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.metricaCard}>
                <Text style={styles.metricaLabel}>Próximo Exame</Text>
                <Text style={styles.metricaValor}>Hoje às 14:00</Text>
                <Text style={styles.metricaSub}>Hemograma Completo</Text>
              </View>

              <View style={[styles.metricaCard, styles.metricaCardDestaque]}>
                <Text style={styles.metricaLabelDestaque}>Temperatura Recente</Text>
                <Text style={styles.metricaValorDestaque}>36.6 °C</Text>
                <Text style={styles.metricaSubDestaque}>Sem sinais febris ✓</Text>
              </View>
            </View>

            {/* Lista de Rotina do Dia */}
            <View style={styles.rotinaSection}>
              <Text style={styles.secaoTitulo}>Rotina Médica de Hoje</Text>

              {/* Item 1: Remédio */}
              <View style={[styles.tarefaCard, remedioTomado && styles.tarefaConcluida]}>
                <View style={styles.tarefaIcone}>
                  <Text style={{ fontSize: 16 }}>💊</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tarefaNome, remedioTomado && styles.tarefaNomeConcluido]}>
                    Ondansetrona 4mg
                  </Text>
                  <Text style={styles.tarefaDetalhes}>Dose da manhã • 08:00 (após café)</Text>
                </View>
                <View style={[styles.checkBtn, remedioTomado && styles.checkBtnAtivo]}>
                  <Text style={styles.checkBtnTexto}>{remedioTomado ? '✓ Feito' : 'Tomar'}</Text>
                </View>
              </View>

              {/* Item 2: Exame */}
              <View style={styles.tarefaCard}>
                <View style={[styles.tarefaIcone, { backgroundColor: '#E0E7FF' }]}>
                  <Text style={{ fontSize: 16 }}>🧪</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tarefaNome}>Hemograma com Plaquetas</Text>
                  <Text style={styles.tarefaDetalhes}>Hospital Infantil • 14:00 (Dr. Carlos)</Text>
                </View>
                <View style={styles.tagExame}>
                  <Text style={styles.tagExameTexto}>Agendado</Text>
                </View>
              </View>
            </View>

            {/* Widget Flutuante da Vitta IA (Fase 2) */}
            {etapa === 2 && (
              <View style={styles.iaWidgetFloat}>
                <View style={styles.iaWidgetHeader}>
                  <View style={styles.iaWidgetAvatar}>
                    <Text style={{ fontSize: 11 }}>💛</Text>
                  </View>
                  <Text style={styles.iaWidgetTitulo}>Vitta IA Assistente</Text>
                  <Text style={styles.iaWidgetHora}>Agora</Text>
                </View>
                <Text style={styles.iaWidgetTexto}>
                  "Lembrete: o exame de sangue da Mavie é às 14h. Mantenha ela bem hidratada pela manhã!"
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Controles / Legenda da Demonstração */}
      <View style={styles.indicadores}>
        <TouchableOpacity
          onPress={() => setEtapa(0)}
          style={[styles.indicadorBtn, etapa === 0 && styles.indicadorBtnAtivo]}
        >
          <Text style={[styles.indicadorTexto, etapa === 0 && styles.indicadorTextoAtivo]}>
            1. Painel da Criança
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setEtapa(1)}
          style={[styles.indicadorBtn, etapa === 1 && styles.indicadorBtnAtivo]}
        >
          <Text style={[styles.indicadorTexto, etapa === 1 && styles.indicadorTextoAtivo]}>
            2. Confirmação de Doses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setEtapa(2)}
          style={[styles.indicadorBtn, etapa === 2 && styles.indicadorBtnAtivo]}
        >
          <Text style={[styles.indicadorTexto, etapa === 2 && styles.indicadorTextoAtivo]}>
            3. Alertas da Vitta IA
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  browserFrame: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
  },

  // --- Browser Header ---
  browserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDF2',
  },
  trafficLights: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E2EA',
    gap: 6,
    maxWidth: 320,
    width: '100%',
    justifyContent: 'center',
  },
  addressLock: {
    fontSize: 10,
  },
  addressText: {
    fontSize: 11,
    color: '#6B6B7B',
    fontWeight: '500',
  },

  // --- Layout Interno ---
  appContainer: {
    flexDirection: 'row',
    minHeight: 460,
    backgroundColor: '#FAFAFC',
  },

  // --- Sidebar ---
  sidebar: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EDEDF2',
    padding: 16,
    justifyContent: 'space-between',
    ...(Platform.OS !== 'web' && screenWidth < 700 ? { display: 'none' } : {}),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFF4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1E',
  },
  navMenu: {
    gap: 4,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#FFF9E6',
  },
  navItemIcon: {
    fontSize: 14,
  },
  navItemText: {
    fontSize: 12.5,
    color: '#6B6B7B',
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#9C6E00',
    fontWeight: '700',
  },
  sidebarPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDEDF2',
  },
  avatarPaciente: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nomePaciente: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A1A1E',
  },
  statusPaciente: {
    fontSize: 9.5,
    color: '#10B981',
    fontWeight: '600',
  },

  // --- Main Content ---
  mainContent: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  boasVindas: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1E',
    letterSpacing: -0.3,
  },
  dataHoje: {
    fontSize: 11.5,
    color: '#8E8E9E',
    marginTop: 2,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2EA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifBadge: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    position: 'absolute',
    top: 6,
    right: 6,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // --- Cards de Métricas ---
  metricasRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metricaCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDF2',
  },
  metricaLabel: {
    fontSize: 11,
    color: '#6B6B7B',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricaValor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1E',
    marginBottom: 6,
  },
  barraProgressoBg: {
    width: '100%',
    height: 5,
    backgroundColor: '#F0F0F4',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barraProgressoFill: {
    height: '100%',
    backgroundColor: '#F7B500',
  },
  metricaSub: {
    fontSize: 10.5,
    color: '#8E8E9E',
  },
  metricaCardDestaque: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  metricaLabelDestaque: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricaValorDestaque: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  metricaSubDestaque: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },

  // --- Rotina ---
  rotinaSection: {
    gap: 10,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1E',
    marginBottom: 4,
  },
  tarefaCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDEDF2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tarefaConcluida: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  tarefaIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarefaNome: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1E',
  },
  tarefaNomeConcluido: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  tarefaDetalhes: {
    fontSize: 11,
    color: '#6B6B7B',
    marginTop: 2,
  },
  checkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F7B500',
  },
  checkBtnAtivo: {
    backgroundColor: '#DCFCE7',
  },
  checkBtnTexto: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A1A1E',
  },
  tagExame: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  tagExameTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },

  // --- IA Widget Flutuante ---
  iaWidgetFloat: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    maxWidth: 300,
    backgroundColor: '#1E1E24',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    gap: 6,
  },
  iaWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iaWidgetAvatar: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#FFF4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iaWidgetTitulo: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F7B500',
    flex: 1,
  },
  iaWidgetHora: {
    fontSize: 9.5,
    color: '#8E8E9E',
  },
  iaWidgetTexto: {
    fontSize: 11.5,
    color: '#E0E0EC',
    lineHeight: 16,
  },

  // --- Controles / Legenda ---
  indicadores: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  indicadorBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2EA',
  },
  indicadorBtnAtivo: {
    backgroundColor: '#1E1E24',
    borderColor: '#1E1E24',
  },
  indicadorTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6B7B',
  },
  indicadorTextoAtivo: {
    color: '#FFFFFF',
  },
});