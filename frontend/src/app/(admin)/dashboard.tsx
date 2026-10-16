import { ActivityIndicator, Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Badge from '../../components/admin/Badge';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import Card from '../../components/admin/Card';
import ErrorState from '../../components/admin/ErrorState';
import { IconUsers } from '../../components/Icons';
import LineChart from '../../components/admin/LineChart';
import SegmentedControl from '../../components/admin/SegmentedControl';
import StatCard from '../../components/admin/StatCard';
import { useAdminDashboard, PeriodoEstendido } from '../../hooks/useAdminDashboard';
import { styles } from '../../styles/app/(admin)/dashboard';
import { tipografia } from '@/styles/tipografia';

const OPCOES_PERIODO: { valor: PeriodoEstendido; rotulo: string }[] = [
  { valor: '24horas', rotulo: '24h' },
  { valor: '7dias', rotulo: '7 dias' },
  { valor: '30dias', rotulo: '30 dias' },
  { valor: '6meses', rotulo: '6 meses' },
  { valor: '1ano', rotulo: '1 ano' },
];

export default function DashboardAdmin() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  const {
    periodo,
    setPeriodo,
    metricaGrafico,
    setMetricaGrafico,
    indicadores,
    ultimosUsuarios,
    serie,
    carregando,
    carregandoSerie,
    erro,
    recarregar,
    exportarRelatorioCSV,
  } = useAdminDashboard();

  // Cálculos de Proporção para Filhos
  const totalFilhosFaixas =
    (indicadores?.faixaEtaria.bebes || 0) +
    (indicadores?.faixaEtaria.criancas || 0) +
    (indicadores?.faixaEtaria.maiores || 0) || 1;

  const pctBebes = Math.round(((indicadores?.faixaEtaria.bebes || 0) / totalFilhosFaixas) * 100);
  const pctCriancas = Math.round(((indicadores?.faixaEtaria.criancas || 0) / totalFilhosFaixas) * 100);
  const pctMaiores = Math.max(0, 100 - pctBebes - pctCriancas);

  // Cálculos de Proporção para Pais
  const totalPaisFaixas =
    (indicadores?.faixaEtariaPais?.jovens || 0) +
    (indicadores?.faixaEtariaPais?.adultos || 0) +
    (indicadores?.faixaEtariaPais?.maduros || 0) +
    (indicadores?.faixaEtariaPais?.seniors || 0) || 1;

  const pctPaisJovens = Math.round(((indicadores?.faixaEtariaPais?.jovens || 0) / totalPaisFaixas) * 100);
  const pctPaisAdultos = Math.round(((indicadores?.faixaEtariaPais?.adultos || 0) / totalPaisFaixas) * 100);
  const pctPaisMaduros = Math.round(((indicadores?.faixaEtariaPais?.maduros || 0) / totalPaisFaixas) * 100);
  const pctPaisSeniors = Math.max(0, 100 - pctPaisJovens - pctPaisAdultos - pctPaisMaduros);

  return (
    <View style={styles.container}>
      <AdminSidebar />

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{
          padding: isMobile ? 12 : 24,
          paddingTop: isMobile ? 60 : 24,
          gap: 16,
          width: '100%',
        }}
      >
        <View style={styles.headerContainer}>
          <AdminHeader />
        </View>

        {erro ? (
          <Card>
            <ErrorState mensagem={erro} aoTentarNovamente={recarregar} />
          </Card>
        ) : (
          <>
            {/* Linha 1 de Indicadores */}
            <View style={[styles.cardsContainer, { flexDirection: isTablet ? 'column' : 'row' }]}>
              {carregando || !indicadores ? (
                <CardsCarregando quantidade={4} isTablet={isTablet} />
              ) : (
                <>
                  <StatCard
                    icone={<Image source={require('@/img/icons/userGroup.svg')} />}
                    corIcone="#FCE7B8"
                    rotulo="Usuários cadastrados"
                    valor={indicadores.usuariosCadastrados}
                  />
                  <StatCard
                    icone={<Image source={require('@/img/icons/baby.svg')} />}
                    corIcone="#DCEBFF"
                    rotulo="Crianças cadastradas"
                    valor={indicadores.criancasCadastradas}
                  />
                  <StatCard
                    icone={<IconUsers color="#1B8A3B" />}
                    corIcone="#DCF3E2"
                    rotulo="Média Filhos / Usuário"
                    valor={`${indicadores.mediaFilhosPorUsuario}`}
                  />
                  <StatCard
                    icone={<Text style={{ fontSize: 18 }}>🎂</Text>}
                    corIcone="#F3E5F5"
                    rotulo="Idade Média Pais"
                    valor={indicadores.mediaIdadePais > 0 ? `${indicadores.mediaIdadePais} anos` : '—'}
                  />
                </>
              )}
            </View>

            {/* Linha 2 de Ações Rápidas */}
            <View style={{ width: '100%', marginBottom: 4 }}>
              {carregando || !indicadores ? (
                <CardsCarregando quantidade={1} isTablet={isTablet} />
              ) : (
                <ButtonSecondary
                  texto="Exportar CSV Completo"
                  onPress={exportarRelatorioCSV}
                  style={isMobile ? { width: '100%' } : undefined}
                />
              )}
            </View>

            {/* Gráfico Analítico */}
            <Card padding={isMobile ? 12 : 20} style={{ width: '100%' }}>
              <View
                style={[
                  styles.graficoHeader,
                  {
                    flexDirection: isTablet ? 'column' : 'row',
                    alignItems: isTablet ? 'stretch' : 'center',
                  },
                ]}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
                  <View style={styles.abasMetricaContainer}>
                    <ButtonSecondary
                      texto="Novos Usuários"
                      onPress={() => setMetricaGrafico('usuarios')}
                      style={[styles.abaMetrica, metricaGrafico === 'usuarios' && styles.abaMetricaAtiva]}
                    />
                    <ButtonSecondary
                      texto="Criação de Filhos"
                      onPress={() => setMetricaGrafico('filhos')}
                      style={[styles.abaMetrica, metricaGrafico === 'filhos' && styles.abaMetricaAtiva]}
                    />
                    <ButtonSecondary
                      texto="Medicamentos"
                      onPress={() => setMetricaGrafico('medicamentos')}
                      style={[styles.abaMetrica, metricaGrafico === 'medicamentos' && styles.abaMetricaAtiva]}
                    />
                    <ButtonSecondary
                      texto="Consultas"
                      onPress={() => setMetricaGrafico('consultas')}
                      style={[styles.abaMetrica, metricaGrafico === 'consultas' && styles.abaMetricaAtiva]}
                    />
                    <ButtonSecondary
                      texto="Exames"
                      onPress={() => setMetricaGrafico('exames')}
                      style={[styles.abaMetrica, metricaGrafico === 'exames' && styles.abaMetricaAtiva]}
                    />
                  </View>
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%', marginTop: isTablet ? 8 : 0 }}>
                  <SegmentedControl
                    opcoes={OPCOES_PERIODO as any}
                    selecionado={periodo as any}
                    onSelecionar={(v) => setPeriodo(v as PeriodoEstendido)}
                  />
                </ScrollView>
              </View>

              {carregandoSerie ? (
                <View style={styles.graficoCarregando}>
                  <ActivityIndicator size="large" color="#F7B500" />
                </View>
              ) : (
                <LineChart dados={serie} altura={isMobile ? 200 : 280} />
              )}
            </Card>

            {/* Seções Analíticas: Faixas Etárias e Últimos Usuários */}
            <View style={{ flexDirection: isTablet ? 'column' : 'row', gap: 16, width: '100%' }}>
              {/* Coluna Esquerda: Distribuição de Idades (Filhos + Pais) */}
              <View style={{ flex: 1.1, gap: 16, width: '100%' }}>
                
                {/* 1. DISTRIBUIÇÃO POR IDADE DOS FILHOS */}
                <Card style={{ padding: isMobile ? 14 : 18, width: '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={tipografia.h3} numberOfLines={1}>Distribuição por Idade</Text>
                      <Text style={tipografia.bodySecondary} numberOfLines={1}>Faixa etária dos dependentes</Text>
                    </View>
                    {indicadores?.mediaIdadeFilhos ? (
                      <View style={styles.chipMedia}>
                        <Text style={styles.chipMediaTexto}>Média: {indicadores.mediaIdadeFilhos} anos</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Barra Progressiva Segmentada */}
                  <View style={styles.barraEtariaContainer}>
                    <View style={{ width: `${pctBebes}%`, backgroundColor: '#FFA726' }} />
                    <View style={{ width: `${pctCriancas}%`, backgroundColor: '#29B6F6' }} />
                    <View style={{ width: `${pctMaiores}%`, backgroundColor: '#66BB6A' }} />
                  </View>

                  {/* Cards Modernos de Legenda com Contadores */}
                  <View style={styles.cardsFaixaContainer}>
                    <View style={[styles.cardFaixaItem, { borderColor: '#FFE0B2', backgroundColor: '#FFFDF9' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#FFA726' }]} />
                        <Text style={styles.cardFaixaLabel}>0–2 anos</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtaria.bebes || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctBebes}%</Text>
                    </View>

                    <View style={[styles.cardFaixaItem, { borderColor: '#B3E5FC', backgroundColor: '#F9FDFF' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#29B6F6' }]} />
                        <Text style={styles.cardFaixaLabel}>3–6 anos</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtaria.criancas || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctCriancas}%</Text>
                    </View>

                    <View style={[styles.cardFaixaItem, { borderColor: '#C8E6C9', backgroundColor: '#FAFFFA' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#66BB6A' }]} />
                        <Text style={styles.cardFaixaLabel}>7+ anos</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtaria.maiores || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctMaiores}%</Text>
                    </View>
                  </View>
                </Card>

                {/* 2. DISTRIBUIÇÃO POR IDADE DOS PAIS / RESPONSÁVEIS */}
                <Card style={{ padding: isMobile ? 14 : 18, width: '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={tipografia.h3} numberOfLines={1}>Faixa Etária dos Pais</Text>
                      <Text style={tipografia.bodySecondary} numberOfLines={1}>Idade dos responsáveis</Text>
                    </View>
                    <View style={[styles.chipMedia, { backgroundColor: '#EDE7F6' }]}>
                      <Text style={[styles.chipMediaTexto, { color: '#512DA8' }]}>
                        {indicadores?.usuariosCadastrados || 0} pais
                      </Text>
                    </View>
                  </View>

                  {/* Barra Progressiva Segmentada */}
                  <View style={styles.barraEtariaContainer}>
                    <View style={{ width: `${pctPaisJovens}%`, backgroundColor: '#AB47BC' }} />
                    <View style={{ width: `${pctPaisAdultos}%`, backgroundColor: '#5C6BC0' }} />
                    <View style={{ width: `${pctPaisMaduros}%`, backgroundColor: '#26A69A' }} />
                    <View style={{ width: `${pctPaisSeniors}%`, backgroundColor: '#FFA726' }} />
                  </View>

                  {/* Cards Modernos com Grupos de Pais */}
                  <View style={styles.cardsFaixaContainer}>
                    <View style={[styles.cardFaixaItem, { borderColor: '#E1BEE7' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#AB47BC' }]} />
                        <Text style={styles.cardFaixaLabel}>18–25</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtariaPais.jovens || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctPaisJovens}%</Text>
                    </View>

                    <View style={[styles.cardFaixaItem, { borderColor: '#C5CAE9' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#5C6BC0' }]} />
                        <Text style={styles.cardFaixaLabel}>26–35</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtariaPais.adultos || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctPaisAdultos}%</Text>
                    </View>

                    <View style={[styles.cardFaixaItem, { borderColor: '#B2DFDB' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#26A69A' }]} />
                        <Text style={styles.cardFaixaLabel}>36–45</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtariaPais.maduros || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctPaisMaduros}%</Text>
                    </View>

                    <View style={[styles.cardFaixaItem, { borderColor: '#FFE0B2' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.legendaDot, { backgroundColor: '#FFA726' }]} />
                        <Text style={styles.cardFaixaLabel}>46+</Text>
                      </View>
                      <Text style={styles.cardFaixaValor}>{indicadores?.faixaEtariaPais.seniors || 0}</Text>
                      <Text style={styles.cardFaixaPct}>{pctPaisSeniors}%</Text>
                    </View>
                  </View>
                </Card>

              </View>

              {/* Coluna Direita: ÚLTIMOS USUÁRIOS CADASTRADOS */}
              <Card style={{ flex: 1.1, padding: isMobile ? 14 : 18, width: '100%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View>
                    <Text style={tipografia.h3}>Últimos Cadastros</Text>
                    <Text style={tipografia.bodySecondary}>Registrados recentemente</Text>
                  </View>
                  <View style={[styles.chipMedia, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.chipMediaTexto, { color: '#2E7D32' }]}>Tempo Real</Text>
                  </View>
                </View>

                {ultimosUsuarios.length === 0 ? (
                  <Text style={tipografia.bodySecondary}>Nenhum usuário recente encontrado.</Text>
                ) : (
                  ultimosUsuarios.map((u) => (
                    <View key={u.id} style={styles.tabelaLinha}>
                      {u.fotoUri ? (
                        <Image
                          source={{ uri: u.fotoUri }}
                          style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }}
                        />
                      ) : (
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#F3F4F6',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                          }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#4B5563' }}>
                            {u.nome ? u.nome.charAt(0).toUpperCase() : 'U'}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                        <Text style={[tipografia.body, { fontWeight: '700', fontSize: 13 }]} numberOfLines={1}>
                          {u.nome}
                        </Text>
                        <Text style={[tipografia.bodySecondary, { fontSize: 11 }]} numberOfLines={1}>
                          {u.email}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280' }}>
                          {u.criadoEm}
                        </Text>
                        <Badge status={u.status} />
                      </View>
                    </View>
                  ))
                )}
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function CardsCarregando({ quantidade, isTablet }: { quantidade: number; isTablet: boolean }) {
  return (
    <>
      {Array.from({ length: quantidade }).map((_, i) => (
        <Card key={i} style={[styles.cardCarregando, { minWidth: isTablet ? '100%' : 160 }]}>
          <ActivityIndicator size="small" color="#F7B500" />
        </Card>
      ))}
    </>
  );
}