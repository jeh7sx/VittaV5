import React from 'react';
import {
  Modal,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';
import FilhoObrigatorio from '../../components/FilhoObrigatorio';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';

import {
  useVisaoGeralController,
  OPCOES_PERIODO,
  formatarDataExtenso,
} from '../../controllers/useVisaoGeralController';
import { styles } from '@/styles/app/(user)/visaoGeral';

import medicamentosIcon from '@/img/medicamentos.svg';
import consultasIcon from '@/img/consultas.svg';
import examesIcon from '@/img/exames.svg';

import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

export default function VisaoGeral() {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  const { theme, isDark } = useTheme();

  const {
    filhoAtual,
    carregando,
    periodoSelecionado,
    selecionarPeriodo,
    abaAdesao,
    setAbaAdesao,
    configAdesao,
    metricas,
    proximosEventos,
    modalDataPersonalizada,
    setModalDataPersonalizada,
    dataInicioStr,
    dataFimStr,
    modalCalendario,
    setModalCalendario,
    aplicarDataSelecionada,
    aplicarFiltroPersonalizado,
    carregarDashboardCompleto,
  } = useVisaoGeralController();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FilhoObrigatorio onFilhoCadastrado={carregarDashboardCompleto} />

      <ScrollView
        style={[styles.scrollContent, { backgroundColor: theme.bg }]}
        contentContainerStyle={{ padding: 16, gap: 16 }}
      >
        {/* Cabeçalho */}
        <View style={styles.secaoResumoHeader}>
          <View>
            <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Visão Geral</Text>
            {!carregando && filhoAtual && (
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                Veja as informações gerais de
                <Text style={{ fontWeight: '600', color: theme.yellow5 }}>
                  {' '}{filhoAtual.nome}
                </Text>
              </Text>
            )}
          </View>
        </View>

        {/* Chips de Período */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {OPCOES_PERIODO.map((opcao) => {
            const ativo = periodoSelecionado === opcao.id;
            return (
              <TouchableOpacity
                key={opcao.id}
                onPress={() => selecionarPeriodo(opcao.id)}
                style={[
                  styles.chipItem,
                  {
                    backgroundColor: ativo ? (isDark ? theme.yellow5 : theme.black) : theme.cardBg,
                    borderWidth: 1,
                    borderColor: ativo ? 'transparent' : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    tipografia.bodySecondary,
                    {
                      color: ativo ? (isDark ? '#000000' : '#FFFFFF') : theme.textSecondary,
                      fontWeight: ativo ? '500' : '400',
                    },
                  ]}
                >
                  {opcao.rotulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cards de Métricas */}
        <View style={[styles.cardsResumoLinha, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {/* Card Medicamentos */}
          <View style={[styles.cardStat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.cardStatHeader}>
              <View style={[styles.iconeBoxStat, { backgroundColor: theme.bgMed }]}>
                <Image source={medicamentosIcon} style={{ width: 24, height: 24, tintColor: theme.Med }} />
              </View>
              <Text style={[tipografia.h4, { color: theme.Med, }]}>
                Medicamentos
              </Text>
            </View>

            <View style={styles.cardStatFooter}>
              <View style={{ gap: 2 }}>
                <Text style={[tipografia.h2, styles.cardStatNumero, { color: theme.textPrimary }]}>
                  {String(metricas.totalMeds).padStart(2, '0')}
                </Text>
                <View style={styles.cardStatSubLinha}>
                  <Text style={[tipografia.caption, { color: theme.Med }]}>
                    {metricas.percMeds}%
                  </Text>
                  <Text style={[tipografia.caption, { color: theme.textSecondary }]}>concluídos</Text>
                </View>
              </View>
              <GraficoProgressoNativo
                porcentagem={metricas.percMeds}
                corFatia={theme.Med}
                corFundo={isDark ? '#332014' : '#F3E8FA'}
                corCentro={theme.cardBg}
              />
            </View>
          </View>

          {/* Card Consultas */}
          <View style={[styles.cardStat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.cardStatHeader}>
              <View style={[styles.iconeBoxStat, { backgroundColor: theme.bgConsul }]}>
                <Image source={consultasIcon} style={{ width: 24, height: 24, tintColor: theme.Consul }} />
              </View>
              <Text style={[tipografia.h4, { color: theme.Consul, }]}>
                Consultas
              </Text>
            </View>

            <View style={styles.cardStatFooter}>
              <View style={{ gap: 2 }}>
                <Text style={[tipografia.h2, styles.cardStatNumero, { color: theme.textPrimary }]}>
                  {String(metricas.totalCons).padStart(2, '0')}
                </Text>
                <View style={styles.cardStatSubLinha}>
                  <Text style={[tipografia.caption, { color: theme.Consul }]}>
                    {metricas.percCons}%
                  </Text>
                  <Text style={[tipografia.caption, { color: theme.textSecondary }]}>realizadas</Text>
                </View>
              </View>
              <GraficoProgressoNativo
                porcentagem={metricas.percCons}
                corFatia={theme.Consul}
                corFundo={isDark ? '#2B1638' : '#E0F2F1'}
                corCentro={theme.cardBg}
              />
            </View>
          </View>

          {/* Card Exames */}
          <View style={[styles.cardStat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={styles.cardStatHeader}>
              <View style={[styles.iconeBoxStat, { backgroundColor: theme.bgExame }]}>
                <Image source={examesIcon} style={{ width: 20, height: 20, tintColor: theme.Exame }} />
              </View>
              <Text style={[tipografia.h4, { color: theme.Exame }]}>
                Exames
              </Text>
            </View>

            <View style={styles.cardStatFooter}>
              <View style={{ gap: 2 }}>
                <Text style={[tipografia.h2, styles.cardStatNumero, { color: theme.textPrimary }]}>
                  {String(metricas.totalExams).padStart(2, '0')}
                </Text>
                <View style={styles.cardStatSubLinha}>
                  <Text style={[tipografia.caption, { color: theme.Exame }]}>
                    {metricas.percExams}%
                  </Text>
                  <Text style={[tipografia.caption, { color: theme.textSecondary }]}>concluídos</Text>
                </View>
              </View>
              <GraficoProgressoNativo
                porcentagem={metricas.percExams}
                corFatia={theme.Exame}
                corFundo={isDark ? '#332F12' : theme.bgExame}
                corCentro={theme.cardBg}
              />
            </View>
          </View>
        </View>

        {/* Seção Tratamento e Compromissos */}
        <View style={[styles.secaoTratamentoLinha, { flexDirection: isMobile ? 'column' : 'row', gap: 16 }]}>
          <View style={[styles.cardAdesao, { backgroundColor: theme.cardBg, borderColor: theme.border, minWidth: isMobile ? '100%' : 420 }]}>
            <View
              style={[
                styles.adesaoHeader,
                {
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: 12,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={require('@/img/icons/chart.svg')} style={{ width: 24, height: 24, tintColor: theme.yellow6 }} />
                <Text style={[tipografia.h4, { color: theme.textPrimary }]}>Tratamento</Text>
              </View>

              <View style={[styles.adesaoSegmented, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                {(['medicamentos', 'consultas', 'exames'] as const).map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    onPress={() => setAbaAdesao(tipo)}
                    style={[
                      styles.adesaoBtn,
                      abaAdesao === tipo && { backgroundColor: theme.yellow5 },
                    ]}
                  >
                    <Text
                      style={[
                        tipografia.bodySecondary,
                        {
                          textTransform: 'capitalize',
                          color: abaAdesao === tipo ? (isDark ? '#000' : '#FFF') : theme.textSecondary,
                          fontWeight: abaAdesao === tipo ? '700' : '500',
                          fontSize: 13,
                        },
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View
              style={[
                styles.adesaoCorpo,
                {
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  gap: 24,
                  width: '100%',
                },
              ]}
            >
              <GraficoProgressoNativo
                porcentagem={configAdesao.porcentagem}
                tamanho={160}
                espessura={10}
                corFatia={configAdesao.corFatia}
                corFundo={isDark ? '#2E2E2E' : '#EFEFEF'}
                corCentro={theme.cardBg}
              >
                <Text style={[tipografia.h2, { color: theme.textPrimary }]}>
                  {configAdesao.porcentagem}%
                </Text>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Concluído</Text>
              </GraficoProgressoNativo>

              <View style={{ flex: 1, minWidth: 200, width: '100%', gap: 16 }}>
                <View>
                  <Text style={[tipografia.h3, { color: theme.textPrimary }]}>
                    {configAdesao.concluidos} de {configAdesao.total} {abaAdesao}
                  </Text>
                  <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                    {configAdesao.total === 0
                      ? 'Nenhum registo encontrado para este período.'
                      : configAdesao.porcentagem >= 80
                        ? 'Excelente índice de conclusão!'
                        : 'Existem pendências para este período.'}
                  </Text>
                </View>

                <View style={{ gap: 8, width: '100%' }}>
                  <View style={[styles.cardStatus, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Image source={require('@/img/icons/check.svg')} />
                      <Text style={[tipografia.h4, { color: isDark ? '#86EFAC' : '#166534' }]}>Concluídos</Text>
                    </View>
                    <Text style={[tipografia.h4, { color: isDark ? '#4ADE80' : '#15803D' }]}>
                      {configAdesao.concluidos}
                    </Text>
                  </View>

                  <View style={[styles.cardStatus, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Image source={require('@/img/icons/atrasado.svg')} />
                      <Text style={[tipografia.h4, { color: isDark ? '#FCA5A5' : '#c68b01' }]}>Pendentes</Text>
                    </View>
                    <Text style={[tipografia.h4, { color: isDark ? '#F87171' : '#d19c0c' }]}>
                      {Math.max(0, configAdesao.total - configAdesao.concluidos)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Próximos Compromissos */}
          <View style={[styles.secaoProximos, { backgroundColor: theme.cardBg, borderColor: theme.border, flex: isMobile ? undefined : 1, width: isMobile ? '100%' : undefined }]}>
            <View style={styles.secaoProximosHeader}>
              <View style={[styles.iconeBoxStat, { backgroundColor: theme.bgCalendario }]}>
                <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 24, height: 24, tintColor: theme.Calendario }} />
              </View>
              <Text style={[tipografia.h4, { color: theme.textPrimary, }]}>Próximos compromissos</Text>
            </View>

            {proximosEventos.length === 0 ? (
              <View style={[styles.cardProximoItem, { backgroundColor: theme.cardBg, borderColor: theme.border, justifyContent: 'center', paddingVertical: 24 }]}>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, textAlign: 'center' }]}>
                  Nenhum compromisso agendado para os próximos dias.
                </Text>
              </View>
            ) : (
              proximosEventos.slice(0, 3).map((ev) => (
                <View key={ev.id} style={[styles.cardProximoItem, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                  <View
                    style={[
                      styles.proximoIconeBox,
                      {
                        backgroundColor:
                          ev.tipo === 'medicamento' ? theme.bgMed : ev.tipo === 'consulta' ? theme.bgConsul : theme.bgExame,
                      },
                    ]}
                  >
                    <Image
                      source={
                        ev.tipo === 'medicamento'
                          ? require('@/img/icons/medicamento.svg')
                          : ev.tipo === 'consulta'
                            ? consultasIcon
                            : examesIcon
                      }
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: ev.tipo === 'medicamento' ? theme.Med : ev.tipo === 'consulta' ? theme.Consul : theme.Exame,
                      }}
                    />
                  </View>

                  <View style={{ gap: 16 }}>
                    <View style={styles.proximoTextos}>
                      <Text style={[tipografia.body, { color: theme.textPrimary, }]}>
                        {ev.tipo === 'medicamento' ? 'Medicamento' : ev.tipo === 'consulta' ? 'Consulta' : 'Exame'}
                      </Text>
                      <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]} numberOfLines={1}>
                        {ev.titulo}
                      </Text>
                    </View>
                    <View style={styles.proximoMetaLinha}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Image source={require('@/img/icons/calendar-02.svg')} style={{ tintColor: theme.black, width: 24, height: 24 }} />
                        <Text style={[tipografia.body, { color: theme.textPrimary }]}>{formatarDataExtenso(ev.data)}</Text>
                      </View>
                      {ev.horario && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Image source={require('@/img/icons/alarm-clock.svg')} style={{ tintColor: theme.black, width: 24, height: 24 }} />
                          <Text style={[tipografia.body, { color: theme.textPrimary }]}>{ev.horario}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <BotaoVittaIA />

      {/* Modal Período Personalizado */}
      <Modal animationType="fade" transparent visible={modalDataPersonalizada} onRequestClose={() => setModalDataPersonalizada(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Período Personalizado</Text>
              <TouchableOpacity onPress={() => setModalDataPersonalizada(false)}>
                <Image source={require('@/img/icons/x.svg')} style={{ tintColor: theme.textPrimary }} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.label, { marginBottom: 6, color: theme.textPrimary }]}>Data de Início</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setModalCalendario({ visivel: true, campo: 'inicio' })}
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 }]}
              >
                <Text style={{ color: dataInicioStr ? theme.textPrimary : '#AAA', fontSize: 15 }}>{dataInicioStr}</Text>
                <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.label, { marginBottom: 6, color: theme.textPrimary }]}>Data de Término</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setModalCalendario({ visivel: true, campo: 'fim' })}
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 }]}
              >
                <Text style={{ color: dataFimStr ? theme.textPrimary : '#AAA', fontSize: 15 }}>{dataFimStr}</Text>
                <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <ButtonSecondary texto="Cancelar" onPress={() => setModalDataPersonalizada(false)} />
              <ButtonPrimary texto="Aplicar filtro" onPress={aplicarFiltroPersonalizado} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Seletor Calendário */}
      <ModalSeletorData
        visivel={modalCalendario.visivel}
        onFechar={() => setModalCalendario({ visivel: false, campo: null })}
        onConfirmar={aplicarDataSelecionada}
        titulo={modalCalendario.campo === 'inicio' ? 'Selecione a Data de Início' : 'Selecione a Data de Término'}
      />
    </View>
  );
}

function GraficoProgressoNativo({
  porcentagem,
  tamanho = 44,
  espessura = 4.5,
  corFatia = '#F59E0B',
  corFundo = '#F3F4F6',
  corCentro = '#FFFFFF',
  children,
}: {
  porcentagem: number;
  tamanho?: number;
  espessura?: number;
  corFatia?: string;
  corFundo?: string;
  corCentro?: string;
  children?: React.ReactNode;
}) {
  const p = Math.min(Math.max(porcentagem, 0), 100);
  const angulo = (p / 100) * 360;

  return (
    <View
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        // @ts-ignore
        background: `conic-gradient(${corFatia} 0deg ${angulo}deg, ${corFundo} ${angulo}deg 360deg)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: tamanho - espessura * 2,
          height: tamanho - espessura * 2,
          borderRadius: (tamanho - espessura * 2) / 2,
          backgroundColor: corCentro,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function ModalSeletorData({
  visivel,
  onFechar,
  onConfirmar,
  titulo,
}: {
  visivel: boolean;
  onFechar: () => void;
  onConfirmar: (data: string) => void;
  titulo: string;
}) {
  const { theme } = useTheme();
  const [dataAtual, setDataAtual] = React.useState(new Date());

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  function mudarMes(delta: number) {
    setDataAtual(new Date(ano, mes + delta, 1));
  }

  function selecionarDia(dia: number) {
    const d = dia < 10 ? `0${dia}` : `${dia}`;
    const m = mes + 1 < 10 ? `0${mes + 1}` : `${mes + 1}`;
    onConfirmar(`${d}/${m}/${ano}`);
  }

  const diasGrade: (number | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) diasGrade.push(null);
  for (let d = 1; d <= diasNoMes; d++) diasGrade.push(d);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxWidth: 360, backgroundColor: theme.cardBg }]}>
          <Text style={[tipografia.h3, { marginBottom: 16, textAlign: 'center', color: theme.textPrimary }]}>{titulo}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => mudarMes(-1)} style={{ padding: 8, borderRadius: 8, backgroundColor: theme.inputBg }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>◀</Text>
            </TouchableOpacity>
            <Text style={[tipografia.body, { fontWeight: '600', color: theme.textPrimary }]}>{nomesMeses[mes]} {ano}</Text>
            <TouchableOpacity onPress={() => mudarMes(1)} style={{ padding: 8, borderRadius: 8, backgroundColor: theme.inputBg }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => (
              <Text key={idx} style={{ width: 36, textAlign: 'center', fontWeight: 'bold', color: theme.gray4 }}>{dia}</Text>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {diasGrade.map((dia, idx) => {
              if (dia === null) return <View key={idx} style={{ width: `${100 / 7}%`, height: 38 }} />;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => selecionarDia(dia)}
                  style={{ width: `${100 / 7}%`, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 19 }}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: 14 }}>{dia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onFechar}
            style={{ marginTop: 16, alignItems: 'center', paddingVertical: 10, backgroundColor: theme.inputBg, borderRadius: 12 }}
          >
            <Text style={{ fontWeight: '600', color: theme.textSecondary }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}