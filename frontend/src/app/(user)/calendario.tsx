import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import ButtonBlack from '@/components/Buttons/ButtonBlack';
import ButtonTertiary from '@/components/Buttons/ButtonTertiary';
import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';

import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';

import {
  useCalendarioController,
  CORES_CATEGORIA,
  CORES_STATUS,
  obterConfigTipo,
  obterStatusVisual,
} from '@/controllers/useCalendarioController';
import { getStyles } from '../../styles/app/(user)/calendario';

export default function Calendario() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktopLargo = width >= 1024;

  const { theme } = useTheme();
  const styles = getStyles(theme);

  const {
    mesAtual,
    diaSelecionado,
    hoje,
    dataSelecionada,
    atividadesAgrupadas,
    modalFiltroVisivel,
    listaFilhos,
    filhosFiltradosIds,
    setModalFiltroVisivel,
    alternarFiltroFilho,
    obterNomeMes,
    mesAnterior,
    proximoMes,
    gerarDiasCalendario,
    temEventoNoDia,
    selecionarDia,
    obterTiposNoDiaSimplificado,
  } = useCalendarioController();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.bg }]}
        contentContainerStyle={{
          padding: isMobile ? 12 : 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tituloPagina}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Calendário</Text>
          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            Acompanhe e organize a rotina de vocês através do calendário.
          </Text>
        </View>

        {/* Conteúdo Principal */}
        <View
          style={[
            styles.conteudoPrincipal,
            {
              flexDirection: isDesktopLargo ? 'row' : 'column',
              alignItems: isDesktopLargo ? 'flex-start' : 'stretch',
            },
          ]}
        >
          {/* Bloco do Calendário */}
          <View
            style={[
              styles.calendario,
              {
                flex: isDesktopLargo ? 1.3 : undefined,
                padding: isMobile ? 14 : 24,
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Cabeçalho */}
            <View
              style={[
                styles.calendarioHeader,
                {
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: isMobile ? 12 : 16,
                },
              ]}
            >
              <View
                style={[
                  styles.navegacaoMes,
                  {
                    justifyContent: isMobile ? 'space-between' : 'flex-start',
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={mesAnterior}
                  style={[styles.botaoSeta, { backgroundColor: theme.inputBg }]}
                  activeOpacity={0.7}
                  accessibilityLabel="Mês anterior"
                >
                  <Image
                    source={require('@/img/icons/setaEsquerda.svg')}
                    style={[styles.iconeSeta, { tintColor: theme.textPrimary }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <Text style={[tipografia.h3, { textTransform: 'capitalize', textAlign: 'center', color: theme.textPrimary }]}>
                  {obterNomeMes(mesAtual)}
                </Text>

                <TouchableOpacity
                  onPress={proximoMes}
                  style={[styles.botaoSeta, { backgroundColor: theme.inputBg }]}
                  activeOpacity={0.7}
                  accessibilityLabel="Próximo mês"
                >
                  <Image
                    source={require('@/img/icons/setaDireita.svg')}
                    style={[styles.iconeSeta, { tintColor: theme.textPrimary }]}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={{ alignSelf: isMobile ? 'stretch' : 'auto', flexDirection: 'row-reverse' }}>
                <ButtonTertiary
                  texto="Filtrar"
                  onPress={() => setModalFiltroVisivel(true)}
                  icone={require('@/img/icons/filter-horizontal.svg')}
                />
              </View>
            </View>

            {/* Dias da Semana */}
            <View style={styles.diasSemanaContainer}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((dia) => (
                <View key={dia} style={styles.diaSemanaColuna}>
                  <Text style={[tipografia.caption, { fontSize: isMobile ? 11 : 13, color: theme.textSecondary }]}>
                    {dia}
                  </Text>
                </View>
              ))}
            </View>

            {/* Grade de Dias */}
            <View style={styles.gridDias}>
              {gerarDiasCalendario(mesAtual).map((dia, index) => {
                const info = dia ? obterTiposNoDiaSimplificado(dia) : null;
                const ehHoje =
                  dia === hoje.getDate() &&
                  mesAtual.getMonth() === hoje.getMonth() &&
                  mesAtual.getFullYear() === hoje.getFullYear();
                const selecionado = diaSelecionado === dia && dia !== null;

                return (
                  <TouchableOpacity
                    key={`${dia ?? 'vazio'}-${index}`}
                    disabled={!dia}
                    activeOpacity={dia ? 0.75 : 1}
                    onPress={() => dia && selecionarDia(dia)}
                    style={[
                      styles.dia,
                      { height: isMobile ? 48 : 58 },
                      ehHoje && !selecionado && [styles.diaHoje, { borderColor: theme.yellow5 }],
                      selecionado && [styles.diaSelecionado, { backgroundColor: theme.yellow5 }],
                    ]}
                  >
                    {dia && (
                      <>
                        <Text
                          style={[
                            tipografia.caption,
                            styles.numeroDia,
                            { fontSize: isMobile ? 12 : 14, color: theme.textPrimary },
                            selecionado && { color: theme.id === 'dark' ? '#000' : '#FFF', fontWeight: '800' },
                          ]}
                        >
                          {dia}
                        </Text>

                        {temEventoNoDia(dia) && (
                          <View style={styles.eventosDia}>
                            {info?.temMedicamento && (
                              <View
                                style={[
                                  styles.pontoEvento,
                                  { backgroundColor: theme.Med },
                                ]}
                              />
                            )}
                            {info?.temConsulta && (
                              <View
                                style={[
                                  styles.pontoEvento,
                                  { backgroundColor: theme.Consul },
                                ]}
                              />
                            )}
                            {info?.temExame && (
                              <View
                                style={[
                                  styles.pontoEvento,
                                  { backgroundColor: theme.Exame },
                                ]}
                              />
                            )}
                            {!!info?.total && (
                              <Text style={[styles.quantidadeEventos, { color: theme.textSecondary }]}>{info.total}</Text>
                            )}
                          </View>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legendas */}
            <View style={[styles.legendaContainer, { borderTopColor: theme.border }]}>
              <View style={styles.legendaSecao}>
                <Text style={[tipografia.bodySecondary,]}>Categorias</Text>
                <View style={styles.legendaLinha}>
                  {Object.values(CORES_CATEGORIA).map((item) => (
                    <View key={item.label} style={styles.legendaItem}>
                      <View style={[styles.legendaMarcador, { backgroundColor: item.dot }]} />
                      <Text style={[tipografia.body, { color: theme.black}]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.legendaSecao}>
                <Text style={[tipografia.bodySecondary, ]}>Status do Dia</Text>
                <View style={styles.legendaLinha}>
                  {Object.values(CORES_STATUS).map((item) => (
                    <View key={item.label} style={styles.legendaItem}>
                      <View style={[styles.legendaMarcador, { backgroundColor: item.dot }]} />
                      <Text style={[tipografia.body, ]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Atividades do Dia Selecionado */}
          <View
            style={[
              styles.atividadesCard,
              {
                flex: isDesktopLargo ? 1 : undefined,
                width: isDesktopLargo ? undefined : '100%',
                paddingVertical: isMobile ? 20 : 28,
                paddingHorizontal: isMobile ? 16 : 24,
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.atividadesHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[tipografia.body, { fontWeight: '700', color: theme.textPrimary }]}>
                  {dataSelecionada ? `Atividades de ${dataSelecionada}` : 'Atividades do dia'}
                </Text>
                <Text style={[tipografia.caption, { marginTop: 4, color: theme.textSecondary }]}>
                  {dataSelecionada
                    ? `${atividadesAgrupadas.length} ${
                        atividadesAgrupadas.length === 1 ? 'item agendado' : 'itens agendados'
                      }`
                    : 'Selecione um dia no calendário para ver a programação.'}
                </Text>
              </View>

              {dataSelecionada && (
                <View style={[styles.contadorAtividades, { backgroundColor: theme.yellow2 }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.yellow9 }}>
                    {atividadesAgrupadas.length}
                  </Text>
                </View>
              )}
            </View>

            {diaSelecionado === null ? (
              <View style={styles.estadoAtividadesVazio}>
                <View style={[styles.iconeVazio, { backgroundColor: theme.inputBg }]}>
                  <Image
                    source={require('@/img/icons/calendar-02.svg')}
                    style={{ width: 22, height: 22, tintColor: theme.textSecondary }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[tipografia.body, { fontWeight: '600', textAlign: 'center', color: theme.textPrimary }]}>
                  Nenhum dia selecionado
                </Text>
                <Text style={[tipografia.caption, { marginTop: 4, textAlign: 'center', maxWidth: 320, color: theme.textSecondary }]}>
                  Clique em uma data acima para visualizar medicamentos, consultas e exames daquele dia.
                </Text>
              </View>
            ) : atividadesAgrupadas.length === 0 ? (
              <View style={styles.estadoAtividadesVazio}>
                <View style={[styles.iconeVazio, { backgroundColor: theme.inputBg }]}>
                  <Image
                    source={require('@/img/icons/check.svg')}
                    style={{ width: 22, height: 22, tintColor: theme.textSecondary }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[tipografia.body, { fontWeight: '600', textAlign: 'center', color: theme.textPrimary }]}>
                  Nenhuma atividade agendada
                </Text>
                <Text style={[tipografia.caption, { marginTop: 4, textAlign: 'center', color: theme.textSecondary }]}>
                  Não há medicamentos, consultas ou exames cadastrados para este dia.
                </Text>
              </View>
            ) : (
              <View style={styles.listaAtividades}>
                {atividadesAgrupadas.map((evento: any) => {
                  const tipo = obterConfigTipo(evento.tipo);
                  const status = obterStatusVisual(evento);
                  const ehMedicamento = evento.tipo === 'medicamento';

                  return (
                    <View key={evento.idAgrupado || evento.id} style={[styles.atividadeItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                      <View style={[styles.atividadeIcone, { backgroundColor: tipo.fundo }]}>
                        <Image
                          source={tipo.icone}
                          style={{ width: 20, height: 20, tintColor: tipo.cor }}
                          resizeMode="contain"
                        />
                      </View>

                      <View style={styles.atividadeConteudo}>
                        <View style={styles.atividadeTopo}>
                          <View style={[styles.badgeTipo, { backgroundColor: tipo.fundo }]}>
                            <Text style={[tipografia.caption, { color: tipo.cor, fontWeight: '600', fontSize: 11 }]}>
                              {tipo.label}
                            </Text>
                          </View>

                          <View style={[styles.badgeStatus, { backgroundColor: status.fundo }]}>
                            <Text style={[tipografia.caption, { color: status.cor, fontWeight: '600', fontSize: 11 }]}>
                              {status.label}
                            </Text>
                          </View>

                          {ehMedicamento && !!(evento.dosagem || evento.subtitulo) && (
                            <View style={{ backgroundColor: theme.cardBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: theme.border }}>
                              <Text style={[tipografia.caption, { color: theme.textPrimary, fontWeight: '700', fontSize: 11 }]}>
                                {evento.dosagem || evento.subtitulo}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text numberOfLines={1} style={[tipografia.body, { fontWeight: '600', marginTop: 8, color: theme.textPrimary }]}>
                          {evento.titulo || 'Atividade'}
                        </Text>

                        <Text numberOfLines={2} style={[tipografia.caption, { color: theme.textSecondary, marginTop: 3 }]}>
                          {ehMedicamento && evento.frequencia
                            ? `Frequência: a cada ${evento.frequencia} • ${evento.horariosDoses?.length || 1} dose(s) hoje`
                            : evento.subtitulo || 'Compromisso agendado'}
                        </Text>

                        {ehMedicamento && evento.horariosDoses && evento.horariosDoses.length > 0 && (
                          <View style={{ marginTop: 10 }}>
                            <Text style={[tipografia.caption, { color: theme.textSecondary, fontSize: 11, marginBottom: 6 }]}>
                              Horários do dia:
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                              {evento.horariosDoses.map((hrDose: string, idx: number) => (
                                <View key={idx} style={[styles.doseChipContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                                  <Image
                                    source={require('@/img/icons/clock-01.svg')}
                                    style={{ width: 12, height: 12, tintColor: theme.textSecondary }}
                                    resizeMode="contain"
                                  />
                                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textPrimary }}>
                                    {hrDose}
                                  </Text>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      {!ehMedicamento && !!evento.horario && (
                        <View style={styles.horarioAtividade}>
                          <Image
                            source={require('@/img/icons/clock-01.svg')}
                            style={{ width: 15, height: 15, tintColor: theme.textSecondary }}
                            resizeMode="contain"
                          />
                          <Text style={[tipografia.caption, { color: theme.textSecondary, fontWeight: '600' }]}>
                            {evento.horario}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Filtro */}
      <Modal
        animationType="fade"
        transparent
        visible={modalFiltroVisivel}
        onRequestClose={() => setModalFiltroVisivel(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalFiltroVisivel(false)}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]} onStartShouldSetResponder={() => true}>
            <Text style={[tipografia.h3, { fontWeight: '600', marginBottom: 16, color: theme.textPrimary }]}>
              Exibir atividades de:
            </Text>

            <View style={styles.listaFiltro}>
              {listaFilhos.map((filho: any) => {
                const ativo = filhosFiltradosIds.includes(filho.id);

                return (
                  <TouchableOpacity
                    key={filho.id}
                    activeOpacity={0.75}
                    style={[
                      styles.filtroOption,
                      { backgroundColor: theme.inputBg, borderColor: theme.border },
                      ativo && { backgroundColor: theme.yellow1, borderColor: theme.yellow5 },
                    ]}
                    onPress={() => alternarFiltroFilho(filho.id)}
                  >
                    <View style={[styles.checkbox, ativo && { backgroundColor: theme.yellow5, borderColor: theme.yellow5 }]}>
                      {ativo && (
                        <Image
                          source={require('@/img/icons/check.svg')}
                          style={{ width: 14, height: 14, tintColor: theme.id === 'dark' ? '#000' : theme.yellow9 }}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    <Text style={[tipografia.body, { color: ativo ? (theme.id === 'dark' ? '#FFF' : theme.yellow9) : theme.textPrimary }]}>
                      {filho.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ButtonBlack texto="Confirmar" onPress={() => setModalFiltroVisivel(false)} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}