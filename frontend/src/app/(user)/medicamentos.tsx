import React, { useRef, ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';
import Header from '../../components/Header';
import MiniMapaHospital from '../../components/MiniMapaHospital';
import ModalVisualizarImagem from '../../components/Modal/ModalVisualizarImagem';
import ModalSucesso from '@/components/Modal/ModalSucesso';

import {
  COR_STATUS,
  ICONE_STATUS,
  ICONE_TURNO,
  MAX_FOTOS,
  PREVIEW_LIMIT,
  STATUS,
  calcularTurno,
  formatarHorario,
  type Medicamento,
  type StatusMedicamento,
} from '../../hooks/useMedicamentos';

import { useMedicamentosController } from '@/controllers/useMedicamentosController';
import medicamentoIcon from '../../img/medicamentos.svg';
import { styles } from '@/styles/app/(user)/medicamentos';
import { tipografia } from '@/styles/tipografia';

import { useTheme } from '@/context/ThemeContext';
import { useFilho } from '@/context/FilhoContext';

const OPCOES_UNIDADE_FREQ = ['Horas', 'Dias', 'Semanas', 'Personalizado'];
const OPCOES_DOSAGEM = [
  'Comprimido(s)',
  'Gotas',
  'ml',
  'mg',
  'Cápsula(s)',
  'Colher(es)',
  'Injeção/Ampola',
  'Outro',
];

// ─────────────────────────────────────────────────────────────
// HELPERS DE DOSES E HORÁRIOS
// ─────────────────────────────────────────────────────────────

function calcularTodasAsDoses(item: Medicamento): Date[] {
  if (!item.dataInicio || !item.horario) return [];
  const [dI, mI, aI] = item.dataInicio.split('/').map(Number);
  const [hI, minI] = item.horario.split(':').map(Number);
  let atual = new Date(aI, mI - 1, dI, hI, minI, 0);

  let fim: Date;
  if (item.dataTermino) {
    const [dT, mT, aT] = item.dataTermino.split('/').map(Number);
    fim = new Date(aT, mT - 1, dT, 23, 59, 59);
  } else {
    fim = new Date(atual);
    fim.setDate(fim.getDate() + 30);
  }

  let addHoras = 0;
  let addDias = 0;
  const match = (item.frequencia || '').match(/(\d+)\s*(.*)/);

  if (match) {
    const qtd = parseInt(match[1], 10);
    const und = match[2]?.trim();
    if (und === 'Horas') addHoras = qtd;
    else if (und === 'Dias') addDias = qtd;
    else if (und === 'Semanas') addDias = qtd * 7;
    else addDias = 1;
  } else {
    addDias = 1;
  }

  if (addHoras === 0 && addDias === 0) addDias = 1;

  const doses: Date[] = [];
  while (atual <= fim && doses.length < 500) {
    doses.push(new Date(atual));
    if (addHoras > 0) atual.setHours(atual.getHours() + addHoras);
    else atual.setDate(atual.getDate() + addDias);
  }
  return doses;
}

function obterProximoHorario(item: Medicamento): { dataFormatada: string; turno: string } | null {
  const doses = calcularTodasAsDoses(item);
  if (doses.length === 0) return null;

  const agora = new Date();
  const proxima = doses.find((d) => d > agora);
  const selecionada = proxima || doses[doses.length - 1];

  const h = String(selecionada.getHours()).padStart(2, '0');
  const m = String(selecionada.getMinutes()).padStart(2, '0');
  const d = String(selecionada.getDate()).padStart(2, '0');
  const mes = String(selecionada.getMonth() + 1).padStart(2, '0');
  const horaFormatada = `${h}:${m}`;

  const ehHoje =
    selecionada.getDate() === agora.getDate() &&
    selecionada.getMonth() === agora.getMonth() &&
    selecionada.getFullYear() === agora.getFullYear();

  return {
    dataFormatada: ehHoje ? horaFormatada : `${d}/${mes} às ${horaFormatada}`,
    turno: calcularTurno(horaFormatada),
  };
}

function obterEstiloDose(dose: Date, dosesTomadas: number[] = [], statusMedicamento: StatusMedicamento) {
  if (dosesTomadas.includes(dose.getTime())) {
    return { bg: '#DCFCE7', borda: '#86EFAC', texto: '#15803D', label: 'Tomado' };
  }
  const agora = new Date();
  const diffMinutos = (dose.getTime() - agora.getTime()) / (1000 * 60);

  if (diffMinutos > 0 && diffMinutos <= 60) {
    return { bg: '#FEF3C7', borda: '#FCD34D', texto: '#B45309', label: 'Próximo' };
  }
  if (diffMinutos <= 0) {
    return { bg: '#FEE2E2', borda: '#FCA5A5', texto: '#B91C1C', label: 'Atrasado' };
  }
  return { bg: '#DBEAFE', borda: '#93C5FD', texto: '#1D4ED8', label: 'Agendado' };
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function Medicamentos() {
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < 768;
  const scrollDosesRef = useRef<ScrollView>(null);

  const { theme } = useTheme();
  const { podeEditarFilhoSelecionado } = useFilho();

  const {
    filhoSelecionado,
    isNarrow: hookIsNarrow,
    carregando,
    contadores,
    headerProps,

    todosExpandido,
    setTodosExpandido,

    popoverStatus,
    setPopoverStatus,
    modalCadastro,
    setModalCadastro,
    modalEditar,
    setModalEditar,
    modalVerMais,
    setModalVerMais,
    menuOpcoes,
    setMenuOpcoes,
    tooltipInfo,

    nome, setNome,
    dosagem, setDosagem,
    horario, setHorario,
    frequencia, setFrequencia,
    dataInicio,
    dataTermino,
    hospital, setHospital,
    hospitalLat, hospitalLng,
    setHospitalPlaceId,
    fotosForm, setFotosForm,
    sugestoes, buscandoPlaces,

    editNome, setEditNome,
    editDosagem, setEditDosagem,
    editHorario, setEditHorario,
    editFrequencia, setEditFrequencia,
    editDataInicio,
    editDataTermino,
    editHospital, setEditHospital,
    editHospitalLat, editHospitalLng,
    setEditHospitalPlaceId,
    editFotos, setEditFotos,
    editSugestoes, editBuscandoPlaces,

    alterarStatus,
    buscarPlaces,
    selecionarPlace,
    escolherFoto,
    removerFoto,
    substituirFoto,
    modalSucessoVisivel,
    cadastrarMedicamento,
    limparFormCadastro,
    salvarEdicao,
    confirmarExclusao,

    freqQtd, setFreqQtd,
    freqUnidade, setFreqUnidade,
    freqCustom, setFreqCustom,
    editFreqQtd, setEditFreqQtd,
    editFreqUnidade, setEditFreqUnidade,
    editFreqCustom, setEditFreqCustom,
    dosTipo, setDosTipo,
    editDosTipo, setEditDosTipo,
    dropdownAberto, setDropdownAberto,
    modalCalendario, setModalCalendario,
    fotoVisualizando, setFotoVisualizando,
    filtroStatus, setFiltroStatus,
    doseSelecionada, setDoseSelecionada,
    salvandoDose,
    medicamentosFiltrados,
    fecharMenus,
    handleAbrirEditarCustom,
    handleConfirmarAlteracaoDose,
    aplicarDataSelecionada,
    navegarParaMedicamentos,
  } = useMedicamentosController();

  const isNarrow = isNarrowScreen || hookIsNarrow;

  return (
    <TouchableOpacity activeOpacity={1} onPress={fecharMenus} style={[styles.pagina, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />

      <View style={{ flex: 1, minWidth: 0 }}>
        <ScrollView
          style={[styles.scrollPrincipal, { backgroundColor: theme.bg }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { padding: isNarrow ? 12 : 24 }]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Medicamentos</Text>
              {!carregando && filhoSelecionado && (
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                  Gerencie os medicamentos de
                  <Text style={{ fontWeight: '600', color: theme.yellow5, paddingLeft: 2 }}>
                    {' '}{filhoSelecionado.nome}
                  </Text>
                </Text>
              )}
            </View>

            {!podeEditarFilhoSelecionado && (
              <View style={{ backgroundColor: theme.inputBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textSecondary }}>👁️ Modo Visualização</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.topoAcoesRow,
              {
                flexDirection: isNarrow ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isNarrow ? 'stretch' : 'center',
              },
            ]}
          >
            <Header {...headerProps} />
            {podeEditarFilhoSelecionado && (
              <ButtonPrimary
                texto="Adicionar medicamento"
                onPress={() => setModalCadastro(true)}
                icone={require('@/img/icons/add-01.svg')}
              />
            )}
          </View>

          <View style={{ width: '100%', minWidth: 0 }}>
            {tooltipInfo && (
              <View style={styles.tooltip}>
                <Text style={{ color: '#FFF', fontSize: 12 }}>
                  Gerencie os medicamentos do seu filho e altere o status diretamente no card.
                </Text>
              </View>
            )}

            {!filhoSelecionado && (
              <EstadoVazio texto="Selecione um filho na barra lateral." theme={theme} />
            )}

            {filhoSelecionado && carregando && (
              <ActivityIndicator size="large" color="#F0A900" style={{ marginTop: 40 }} />
            )}

            {filhoSelecionado && !carregando && medicamentosFiltrados.length === 0 && filtroStatus === 'Todos' && (
              <View style={[styles.emptyStateContainer, {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                borderWidth: 1,
              },]}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Nenhum medicamento adicionado. Seus medicamentos adicionados serão exibidos aqui!
                </Text>
                <Image
                  source={require('../../img/icons/semMedicamentos.svg')}
                  style={styles.emptyStateImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {filhoSelecionado && !carregando && (medicamentosFiltrados.length > 0 || filtroStatus !== 'Todos') && (
              <View style={{ gap: 16 }}>
                <View
                  style={[
                    styles.filtrosLinha,
                    {
                      flexDirection: isNarrow ? 'column' : 'row',
                      alignItems: isNarrow ? 'stretch' : 'center',
                    },
                  ]}
                >
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ width: '100%' }}
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 16 }}
                  >
                    {(['Todos', ...STATUS] as ('Todos' | StatusMedicamento)[]).map((status) => {
                      const selecionado = filtroStatus === status;
                      const ehTodos = status === 'Todos';
                      const quantidade = ehTodos ? contadores.Todos : contadores[status];

                      return (
                        <TouchableOpacity
                          key={status}
                          activeOpacity={0.8}
                          onPress={() => {
                            setFiltroStatus(status);
                            setTodosExpandido(false);
                            fecharMenus();
                          }}
                          style={[
                            styles.chipFiltro,
                            {
                              minWidth: ehTodos ? 166 : 158,
                              borderColor: selecionado ? theme.yellow5 : theme.border,
                              borderWidth: 1,
                              backgroundColor:
                                selecionado && ehTodos
                                  ? theme.yellow1
                                  : selecionado && !ehTodos
                                    ? COR_STATUS[status].bg
                                    : theme.inputBg,
                            },
                          ]}
                        >
                          <Image
                            source={ehTodos ? medicamentoIcon : ICONE_STATUS[status]}
                            style={{
                              width: 20,
                              height: 20,
                              tintColor:
                                selecionado && ehTodos
                                  ? (theme.id === 'dark' ? '#FFF' : theme.yellow9)
                                  : selecionado && !ehTodos
                                    ? COR_STATUS[status].text
                                    : theme.gray4,
                            }}
                            resizeMode="contain"
                          />

                          <Text
                            style={[
                              tipografia.caption,
                              {
                                fontSize: 16,
                                color:
                                  selecionado && ehTodos
                                    ? (theme.id === 'dark' ? '#FFF' : theme.yellow9)
                                    : selecionado && !ehTodos
                                      ? COR_STATUS[status].text
                                      : theme.textSecondary,
                                fontWeight: selecionado ? '700' : '500',
                              },
                            ]}
                          >
                            {status}
                          </Text>

                          <Text
                            style={[
                              tipografia.caption,
                              {
                                fontSize: 15,
                                color:
                                  selecionado && ehTodos
                                    ? (theme.id === 'dark' ? '#FFF' : theme.yellow9)
                                    : selecionado && !ehTodos
                                      ? COR_STATUS[status].text
                                      : theme.textSecondary,
                                fontWeight: '700',
                              },
                            ]}
                          >
                            {quantidade}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View>
                  {(todosExpandido
                    ? medicamentosFiltrados
                    : medicamentosFiltrados.slice(0, PREVIEW_LIMIT)
                  ).map((item: Medicamento) => (
                    <CardMedicamentoItem
                      key={item.id}
                      item={item}
                      isNarrow={isNarrow}
                      theme={theme}
                      podeEditar={podeEditarFilhoSelecionado}
                      popoverAberto={popoverStatus === item.id}
                      menuOpcoesAberto={menuOpcoes === item.id}
                      onTogglePopover={() => {
                        if (!podeEditarFilhoSelecionado) return;
                        setPopoverStatus(popoverStatus === item.id ? null : item.id);
                        setMenuOpcoes(null);
                      }}
                      onToggleMenuOpcoes={() => {
                        setMenuOpcoes(menuOpcoes === item.id ? null : item.id);
                        setPopoverStatus(null);
                      }}
                      onAlterarStatus={(st) => alterarStatus(item.id, st)}
                      onVerMais={() => {
                        setMenuOpcoes(null);
                        setModalVerMais(item);
                      }}
                      onEditar={() => {
                        setMenuOpcoes(null);
                        handleAbrirEditarCustom(item);
                      }}
                      onExcluir={() => {
                        setMenuOpcoes(null);
                        confirmarExclusao(item.id);
                      }}
                    />
                  ))}

                  {medicamentosFiltrados.length === 0 && (
                    <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={[tipografia.bodySecondary, { textAlign: 'center', color: theme.textSecondary }]}>
                        Nenhum medicamento com status “{filtroStatus}”.
                      </Text>
                    </View>
                  )}

                  {medicamentosFiltrados.length > PREVIEW_LIMIT && (
                    <TouchableOpacity
                      onPress={() => setTodosExpandido(!todosExpandido)}
                      activeOpacity={0.75}
                      style={[styles.botaoVerMaisMenos, {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderWidth: 1
                      }]}>
                      <Text style={[tipografia.caption, { color: theme.yellow6, textDecorationLine: 'underline', fontSize: 15 }]}>
                        {todosExpandido ? 'Ver menos' : `Ver todos (${medicamentosFiltrados.length})`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modal Cadastro */}
      <ModalPadrao
        visible={modalCadastro}
        theme={theme}
        onClose={() => {
          limparFormCadastro();
          setModalCadastro(false);
        }}
        isNarrow={isNarrow}
      >
        <FormMedicamento
          isEdit={false}
          isNarrow={isNarrow}
          theme={theme}
          nome={nome} setNome={setNome}
          dosagem={dosagem} setDosagem={setDosagem}
          horario={horario} setHorario={setHorario}
          dataInicio={dataInicio}
          dataTermino={dataTermino}
          hospital={hospital} setHospital={setHospital}
          setHospitalPlaceId={setHospitalPlaceId}
          hospitalLat={hospitalLat} hospitalLng={hospitalLng}
          fotos={fotosForm} setFotos={setFotosForm}
          sugestoes={sugestoes} buscandoPlaces={buscandoPlaces}
          buscarPlaces={buscarPlaces} selecionarPlace={selecionarPlace}
          escolherFoto={escolherFoto} removerFoto={removerFoto} substituirFoto={substituirFoto}
          freqQtd={freqQtd} setFreqQtd={setFreqQtd}
          freqUnidade={freqUnidade} setFreqUnidade={setFreqUnidade}
          freqCustom={freqCustom} setFreqCustom={setFreqCustom}
          setFrequencia={setFrequencia}
          dosTipo={dosTipo} setDosTipo={setDosTipo}
          dropdownAberto={dropdownAberto} setDropdownAberto={setDropdownAberto}
          onAbrirCalendario={(campo: 'inicio' | 'termino') =>
            setModalCalendario({ visivel: true, campo, isEdit: false })
          }
        />
        <View style={styles.acoesModal}>
          <ButtonSecondary
            texto="Cancelar"
            onPress={() => {
              limparFormCadastro();
              setModalCadastro(false);
            }}
            style={{ width: '100%' }}
            icone={require('@/img/icons/x.svg')}
          />
          <ButtonPrimary
            texto="Adicionar"
            onPress={cadastrarMedicamento}
            icone={require('@/img/icons/add-01.svg')}
            style={{ width: '100%' }}
          />
        </View>
      </ModalPadrao>

      {/* Modal Editar */}
      <ModalPadrao visible={modalEditar} theme={theme} onClose={() => setModalEditar(false)} isNarrow={isNarrow}>
        <FormMedicamento
          isEdit={true}
          isNarrow={isNarrow}
          theme={theme}
          nome={editNome} setNome={setEditNome}
          dosagem={editDosagem} setDosagem={setEditDosagem}
          horario={editHorario} setHorario={setEditHorario}
          dataInicio={editDataInicio}
          dataTermino={editDataTermino}
          hospital={editHospital} setHospital={setEditHospital}
          setHospitalPlaceId={setEditHospitalPlaceId}
          hospitalLat={editHospitalLat} hospitalLng={editHospitalLng}
          fotos={editFotos} setFotos={setEditFotos}
          sugestoes={editSugestoes} buscandoPlaces={editBuscandoPlaces}
          buscarPlaces={buscarPlaces} selecionarPlace={selecionarPlace}
          escolherFoto={escolherFoto} removerFoto={removerFoto} substituirFoto={substituirFoto}
          freqQtd={editFreqQtd} setFreqQtd={setEditFreqQtd}
          freqUnidade={editFreqUnidade} setFreqUnidade={setEditFreqUnidade}
          freqCustom={editFreqCustom} setFreqCustom={setEditFreqCustom}
          setFrequencia={setEditFrequencia}
          dosTipo={editDosTipo} setDosTipo={setEditDosTipo}
          dropdownAberto={dropdownAberto} setDropdownAberto={setDropdownAberto}
          onAbrirCalendario={(campo: 'inicio' | 'termino') =>
            setModalCalendario({ visivel: true, campo, isEdit: true })
          }
        />
        <View style={styles.acoesModal}>
          <ButtonSecondary
            texto="Cancelar"
            onPress={() => setModalEditar(false)}
            style={{ width: '100%' }}
            icone={require('@/img/icons/x.svg')}
          />
          <ButtonPrimary
            texto="Salvar alterações"
            onPress={salvarEdicao}
            icone={require('@/img/icons/add-01.svg')}
            style={{ width: '100%' }}
          />
        </View>
      </ModalPadrao>

      {/* Modal Ver Mais */}
      <ModalVerMaisMed
        modalVerMais={modalVerMais}
        medicamentos={medicamentosFiltrados}
        isNarrow={isNarrow}
        theme={theme}
        scrollDosesRef={scrollDosesRef}
        onFechar={() => setModalVerMais(null)}
        onVisualizarFoto={setFotoVisualizando}
        onSelecionarDose={(dose: any, med: any, jaTomou: boolean) => {
          if (!podeEditarFilhoSelecionado) return;
          setDoseSelecionada({ dose, medicamento: med, jaTomou });
        }}
      />

      {/* Modal Ação de Dose */}
      <ModalAcaoDose
        doseSelecionada={doseSelecionada}
        salvandoDose={salvandoDose}
        theme={theme}
        onConfirmar={handleConfirmarAlteracaoDose}
        onFechar={() => setDoseSelecionada(null)}
      />

      {/* Modal Seletor de Data */}
      <ModalSeletorData
        visivel={modalCalendario.visivel}
        onFechar={() => setModalCalendario({ visivel: false, campo: null, isEdit: false })}
        onConfirmar={aplicarDataSelecionada}
        titulo={modalCalendario.campo === 'inicio' ? 'Selecione a Data de Início' : 'Selecione a Data de Término'}
      />

      {/* Zoom na Foto */}
      <ModalVisualizarImagem
        imagemUri={fotoVisualizando}
        nomeArquivo={modalVerMais ? `medicamento-${modalVerMais.nome.toLowerCase().replace(/\s+/g, '-')}` : 'medicamento'}
        onClose={() => setFotoVisualizando(null)}
      />

      {/* Modal Sucesso */}
      <ModalSucesso
        visivel={modalSucessoVisivel}
        tipo="medicamento"
        duracaoMs={5000}
        onFechar={navegarParaMedicamentos}
        onVerMais={navegarParaMedicamentos}
      />
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES AUXILIARES DE RENDERIZAÇÃO
// ─────────────────────────────────────────────────────────────

function CardMedicamentoItem({
  item,
  isNarrow,
  theme,
  podeEditar,
  popoverAberto,
  menuOpcoesAberto,
  onTogglePopover,
  onToggleMenuOpcoes,
  onAlterarStatus,
  onVerMais,
  onEditar,
  onExcluir,
}: {
  item: Medicamento;
  isNarrow: boolean;
  theme: any;
  podeEditar: boolean;
  popoverAberto: boolean;
  menuOpcoesAberto: boolean;
  onTogglePopover: () => void;
  onToggleMenuOpcoes: () => void;
  onAlterarStatus: (status: StatusMedicamento) => void;
  onVerMais: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const proximoInfo = obterProximoHorario(item);
  const displayHorario = proximoInfo ? proximoInfo.dataFormatada : `${item.horario} horas`;

  return (
    <View
      style={[
        styles.cardMedicamento,
        {
          paddingVertical: isNarrow ? 12 : 24,
          paddingHorizontal: isNarrow ? 12 : 24,
          gap: isNarrow ? 8 : 16,
          minHeight: isNarrow ? 76 : 96,
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          zIndex: (popoverAberto || menuOpcoesAberto) ? 1000 : 1,
          elevation: (popoverAberto || menuOpcoesAberto) ? 1000 : 1,
          width: '100%',
        },
      ]}
    >
      <View
        style={[
          styles.iconeBoxMed,
          { width: isNarrow ? 36 : 48, height: isNarrow ? 36 : 48, backgroundColor: theme.bgMed },
        ]}
      >
        <Image source={medicamentoIcon} style={{ width: isNarrow ? 20 : 24, height: isNarrow ? 20 : 24, tintColor: theme.Med }} resizeMode="contain" />
      </View>

      <View style={{ flex: 1.2, minWidth: 0 }}>
        <Text numberOfLines={1} style={[tipografia.body, { color: theme.textPrimary, fontWeight: '700', fontSize: isNarrow ? 14 : 16 }]}>{item.nome}</Text>
        <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: isNarrow ? 12 : 14 }]}>{item.dosagem}</Text>
      </View>

      {!isNarrow && (
        <View style={{ flex: 0.95, minWidth: 150 }}>
          <Text style={[tipografia.body, { color: theme.textPrimary }]}>
            {item.dataInicio || '—'}{item.dataTermino ? ` até ${item.dataTermino}` : ''}
          </Text>
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>{item.frequencia || '—'}</Text>
        </View>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[tipografia.caption, { color: theme.textSecondary, fontSize: isNarrow ? 11 : 12 }]}>Próxima dose:</Text>
        <Text numberOfLines={1} style={[tipografia.body, { color: theme.textPrimary, fontSize: isNarrow ? 13 : 15, fontWeight: '600' }]}>{displayHorario}</Text>
      </View>

      {/* Popover Status */}
      <View style={{ position: 'relative', flexShrink: 0 }}>
        <TouchableOpacity
          activeOpacity={podeEditar ? 0.8 : 1}
          onPress={onTogglePopover}
          style={[styles.statusBadgeBtn, { backgroundColor: COR_STATUS[item.status].bg, paddingHorizontal: isNarrow ? 10 : 16 }]}
        >
          <Image
            source={ICONE_STATUS[item.status]}
            style={{ width: 20, height: 20, tintColor: COR_STATUS[item.status].text }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {popoverAberto && podeEditar && (
          <View style={[styles.popover, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {STATUS.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => onAlterarStatus(status)}
                style={[
                  styles.itemPopover,
                  { backgroundColor: item.status === status ? COR_STATUS[status].bg : theme.cardBg },
                ]}
              >
                <Image source={ICONE_STATUS[status]} style={{ width: 24, height: 24, tintColor: COR_STATUS[status].text }} />
                <Text style={{ color: COR_STATUS[status].text, fontWeight: '700' }}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Menu de 3 Pontinhos */}
      <View style={{ position: 'relative', flexShrink: 0 }}>
        <TouchableOpacity
          accessibilityLabel="Mais opções"
          activeOpacity={0.7}
          onPress={onToggleMenuOpcoes}
          style={styles.btnMaisOpcoes}
        >
          <Text style={{ fontSize: 20, lineHeight: 20, fontWeight: 'bold', color: theme.textSecondary }}>⋮</Text>
        </TouchableOpacity>

        {menuOpcoesAberto && (
          <View style={[styles.menuOpcoesDropdown, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <TouchableOpacity
              onPress={onVerMais}
              style={[styles.itemMenuOpcoes, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            >
              <Image source={require('@/img/icons/view.svg')} style={{ width: 18, height: 18, tintColor: theme.textPrimary }} />
              <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '500' }}>Ver mais</Text>
            </TouchableOpacity>

            {podeEditar && (
              <>
                <TouchableOpacity
                  onPress={onEditar}
                  style={[styles.itemMenuOpcoes, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                >
                  <Image source={require('@/img/icons/edit-02.svg')} style={{ width: 18, height: 18, tintColor: theme.textPrimary }} />
                  <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '500' }}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onExcluir}
                  style={styles.itemMenuOpcoes}
                >
                  <Image source={require('@/img/icons/delete-02.svg')} style={{ width: 18, height: 18, tintColor: '#E11919' }} />
                  <Text style={{ color: '#E11919', fontSize: 14, fontWeight: '500' }}>Excluir</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function FormMedicamento(props: any) {
  const {
    isEdit,
    isNarrow,
    theme,
    nome, setNome,
    dosagem, setDosagem,
    horario, setHorario,
    dataInicio,
    dataTermino,
    hospital, setHospital, setHospitalPlaceId,
    hospitalLat, hospitalLng,
    fotos, setFotos,
    sugestoes, buscandoPlaces,
    buscarPlaces, selecionarPlace,
    escolherFoto, removerFoto, substituirFoto,
    freqQtd, setFreqQtd,
    freqUnidade, setFreqUnidade,
    freqCustom, setFreqCustom,
    setFrequencia,
    dosTipo, setDosTipo,
    dropdownAberto, setDropdownAberto,
    onAbrirCalendario,
  } = props;

  const alterarFreqQtd = (val: number) => {
    const v = Math.max(1, val);
    setFreqQtd(v);
    setFrequencia(`${v} ${freqUnidade}`);
  };

  const alterarFreqUnidade = (und: string) => {
    setFreqUnidade(und);
    setFrequencia(und === 'Personalizado' ? freqCustom : `${freqQtd} ${und}`);
    setDropdownAberto(null);
  };

  const alterarFreqCustom = (val: string) => {
    setFreqCustom(val);
    setFrequencia(val);
  };

  return (
    <ScrollView style={{ maxHeight: 680 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <View style={{ backgroundColor: theme.bgMed, borderRadius: 999, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/img/icons/medicamento.svg')} style={{ width: 32, height: 32, tintColor: theme.Med }} />
        </View>
        <Text style={[tipografia.h2, { color: theme.textPrimary }]}>{isEdit ? 'Editar ' : 'Adicionar '}medicamento</Text>
      </View>

      <Campo label="Medicamento" obrigatorio placeholder="Ex: Dipirona" value={nome} onChangeText={setNome} theme={theme} />

      {/* Dosagem */}
      <View style={{ marginBottom: 14, zIndex: 50 }}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Dosagem <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text></Text>
        <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: 8 }}>
          <TextInput
            placeholder="Ex: 1, 500, 2..."
            placeholderTextColor={theme.gray4}
            value={dosagem}
            keyboardType="numeric"
            onChangeText={(texto) => setDosagem(texto.replace(/[^0-9]/g, ''))}
            style={[styles.input, { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          />
          <View style={{ position: 'relative', minWidth: isNarrow ? '100%' : 180 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdownAberto(dropdownAberto === 'dos' ? null : 'dos')}
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.inputBg, borderColor: theme.border }]}
            >
              <Text style={{ color: theme.textPrimary }}>{dosTipo}</Text>
              <Text style={{ fontSize: 12, color: theme.gray4 }}>▼</Text>
            </TouchableOpacity>

            {dropdownAberto === 'dos' && (
              <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                {OPCOES_DOSAGEM.map((opc) => (
                  <TouchableOpacity
                    key={opc}
                    onPress={() => {
                      setDosTipo(opc);
                      setDropdownAberto(null);
                    }}
                    style={[styles.dropdownItem, { backgroundColor: dosTipo === opc ? theme.yellow1 : theme.cardBg, borderBottomColor: theme.border }]}
                  >
                    <Text style={{ fontSize: 14, color: theme.textPrimary }}>{opc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <Campo
        label="Horário inicial"
        obrigatorio
        placeholder="Ex: 09:00"
        value={horario}
        onChangeText={(v: string) => setHorario(formatarHorario(v))}
        keyboardType="numeric"
        maxLength={5}
        theme={theme}
      />
      {!!calcularTurno(horario) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -9, marginBottom: 14 }}>
          <Image source={ICONE_TURNO[calcularTurno(horario)]} style={{ width: 16, height: 16, tintColor: theme.gray4 }} resizeMode="contain" />
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{calcularTurno(horario)}</Text>
        </View>
      )}

      {/* Frequência */}
      <View style={{ marginBottom: 14, zIndex: 40 }}>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Frequência <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text></Text>
        <View style={{ flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'stretch' : 'center', gap: 8 }}>
          {freqUnidade !== 'Personalizado' && (
            <View style={[styles.counterBox, { width: isNarrow ? '100%' : 140, backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <TouchableOpacity onPress={() => alterarFreqQtd(freqQtd - 1)} style={styles.counterBtn}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}>{freqQtd}</Text>
              <TouchableOpacity onPress={() => alterarFreqQtd(freqQtd + 1)} style={styles.counterBtn}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary }}>+</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ position: 'relative', flex: 1 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDropdownAberto(dropdownAberto === 'freq' ? null : 'freq')}
              style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.inputBg, borderColor: theme.border }]}
            >
              <Text style={{ color: theme.textPrimary }}>{freqUnidade}</Text>
              <Text style={{ fontSize: 12, color: theme.gray4 }}>▼</Text>
            </TouchableOpacity>

            {dropdownAberto === 'freq' && (
              <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                {OPCOES_UNIDADE_FREQ.map((opc) => (
                  <TouchableOpacity
                    key={opc}
                    onPress={() => alterarFreqUnidade(opc)}
                    style={[styles.dropdownItem, { backgroundColor: freqUnidade === opc ? theme.yellow1 : theme.cardBg, borderBottomColor: theme.border }]}
                  >
                    <Text style={{ fontSize: 14, color: theme.textPrimary }}>{opc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {freqUnidade === 'Personalizado' && (
          <TextInput
            placeholder="Ex: Segundas e Quintas, ou quando houver febre..."
            placeholderTextColor={theme.gray4}
            value={freqCustom}
            onChangeText={alterarFreqCustom}
            style={[styles.input, { marginTop: 8, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          />
        )}
      </View>

      {/* Datas */}
      <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: 12, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Data de Início <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text></Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onAbrirCalendario('inicio')}
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.inputBg, borderColor: theme.border }]}
          >
            <Text style={{ color: dataInicio ? theme.textPrimary : '#AAA' }}>{dataInicio || 'Selecionar data'}</Text>
            <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Data de Término <Text style={{ color: theme.textSecondary, fontWeight: '400' }}>(Opcional)</Text></Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onAbrirCalendario('termino')}
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.inputBg, borderColor: theme.border }]}
          >
            <Text style={{ color: dataTermino ? theme.textPrimary : '#AAA' }}>{dataTermino || 'Selecionar data'}</Text>
            <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hospital */}
      <Text style={[styles.label, { color: theme.textPrimary }]}>Hospital / Farmácia / Clínica <Text style={{ color: theme.textSecondary, fontWeight: '400' }}>(Opcional)</Text></Text>
      <View style={{ position: 'relative', marginBottom: 14, zIndex: 20 }}>
        <TextInput
          placeholder="Buscar hospital ou farmácia..."
          placeholderTextColor={theme.gray4}
          value={hospital}
          onChangeText={(t) => {
            setHospital(t);
            setHospitalPlaceId('');
            buscarPlaces(t, isEdit);
          }}
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
        />
        {buscandoPlaces && (
          <ActivityIndicator size="small" color="#F7B500" style={{ position: 'absolute', right: 12, top: 13 }} />
        )}
        {sugestoes.length > 0 && (
          <View style={{ backgroundColor: theme.cardBg, borderRadius: 8, borderWidth: 1, borderColor: theme.border, marginTop: 4, overflow: 'hidden' }}>
            {sugestoes.map((sg: any) => (
              <TouchableOpacity
                key={sg.place_id}
                onPress={() => selecionarPlace(sg, isEdit)}
                style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}
              >
                <Text style={{ fontSize: 13 }}>📍</Text>
                <Text style={{ fontSize: 13, color: theme.textPrimary, flex: 1 }}>{sg.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {Boolean(hospital && hospital.trim().length > 0) && (
          <MiniMapaHospital hospital={hospital} lat={hospitalLat} lng={hospitalLng} exibirBotaoRota={false} />
        )}
      </View>

      {/* Fotos */}
      <Text style={[styles.label, { color: theme.textPrimary }]}>Fotos <Text style={{ color: theme.textSecondary, fontWeight: '400' }}>(Opcional, máx. {MAX_FOTOS})</Text></Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {fotos.map((f: any, i: any) => (
          <View key={i} style={{ position: 'relative' }}>
            <Image source={{ uri: f }} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: theme.border }} />
            <TouchableOpacity
              onPress={() => removerFoto(i, fotos, setFotos)}
              style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#D93025', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
            {isEdit && (
              <TouchableOpacity
                onPress={() => substituirFoto(i, fotos, setFotos)}
                style={{ position: 'absolute', bottom: -6, right: -6, backgroundColor: theme.yellow5, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>✎</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {fotos.length < MAX_FOTOS && (
          <TouchableOpacity
            onPress={() => escolherFoto(fotos, setFotos)}
            style={{ padding: 24, borderRadius: 16, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.inputBg }}
          >
            <Image source={require('@/img/icons/add-01.svg')} style={{ width: 24, height: 24, tintColor: theme.gray4 }} />
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function ModalVerMaisMed({
  modalVerMais,
  medicamentos,
  isNarrow,
  theme,
  scrollDosesRef,
  onFechar,
  onVisualizarFoto,
  onSelecionarDose,
}: any) {
  if (!modalVerMais) return null;

  const medAtual = medicamentos.find((m: Medicamento) => m.id === modalVerMais.id) || modalVerMais;
  const todasAsDoses = calcularTodasAsDoses(medAtual);

  return (
    <Modal animationType="fade" transparent visible={Boolean(modalVerMais)} onRequestClose={onFechar}>
      <View style={[styles.modalOverlayFundo, { padding: isNarrow ? 12 : 20 }]}>
        <View style={[styles.verMaisBox, { padding: isNarrow ? 20 : 24, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <ScrollView style={{ maxHeight: isNarrow ? 460 : 540 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <View style={[styles.verMaisIconWrap, { backgroundColor: theme.bgMed }]}>
                <Image source={require('@/img/icons/medicamento.svg')} style={{ width: 24, height: 24, tintColor: theme.Med }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[tipografia.h3, { color: theme.textPrimary }]}>{medAtual.nome}</Text>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>{medAtual.nomeFilho}</Text>
              </View>
              <View style={[styles.verMaisBadge, { backgroundColor: COR_STATUS[medAtual.status].bg, borderColor: COR_STATUS[medAtual.status].border }]}>
                <Image source={ICONE_STATUS[medAtual.status]} style={{ width: 22, height: 22, tintColor: COR_STATUS[medAtual.status].text }} />
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 16 }} />

            <View style={{ gap: 16, marginBottom: 16 }}>
              {Boolean(medAtual?.tipo) && (
                <InfoRow
                  icon={require('@/img/icons/medicamento.svg')}
                  label="Tipo"
                  value={medAtual.tipo}
                  theme={theme}
                />
              )}

              {Boolean(medAtual?.dosagem) && (
                <InfoRow
                  icon={require('@/img/icons/balance-scale.svg')}
                  label="Dosagem"
                  value={medAtual.dosagem}
                  theme={theme}
                />
              )}

              {Boolean(medAtual?.frequencia) && (
                <InfoRow
                  icon={require('@/img/icons/repeat-one-01.svg')}
                  label="Frequência"
                  value={medAtual.frequencia}
                  theme={theme}
                />
              )}

              {Boolean(medAtual?.dataInicio) && (
                <InfoRow
                  icon={require('@/img/icons/calendar-02.svg')}
                  label="Período"
                  value={medAtual.dataTermino ? `${medAtual.dataInicio} até ${medAtual.dataTermino}` : medAtual.dataInicio}
                  theme={theme}
                />
              )}

              {/* Doses programadas */}
              {todasAsDoses.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                      Horários Programados ({todasAsDoses.length} doses)
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => scrollDosesRef.current?.scrollTo({ x: 0, animated: true })}
                        style={{ padding: 6, backgroundColor: theme.inputBg, borderRadius: 999 }}
                      >
                        <Image source={require('@/img/icons/setaEsquerda.svg')} style={{ tintColor: theme.textPrimary }} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => scrollDosesRef.current?.scrollToEnd({ animated: true })}
                        style={{ padding: 6, backgroundColor: theme.inputBg, borderRadius: 999 }}
                      >
                        <Image source={require('@/img/icons/setaDireita.svg')} style={{ tintColor: theme.textPrimary }} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ScrollView ref={scrollDosesRef} horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {todasAsDoses.map((dose: Date, idx: number) => {
                      const dia = String(dose.getDate()).padStart(2, '0');
                      const mes = String(dose.getMonth() + 1).padStart(2, '0');
                      const hora = String(dose.getHours()).padStart(2, '0');
                      const min = String(dose.getMinutes()).padStart(2, '0');
                      const jaTomou = (medAtual.dosesTomadas || []).includes(dose.getTime());
                      const estilo = obterEstiloDose(dose, medAtual.dosesTomadas || [], medAtual.status);

                      return (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.7}
                          onPress={() => onSelecionarDose(dose, medAtual, jaTomou)}
                          style={[styles.doseCardItem, { backgroundColor: estilo.bg, borderColor: estilo.borda }]}
                        >
                          <Text style={{ fontSize: 11, color: estilo.texto, fontWeight: '600' }}>{dia}/{mes}</Text>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: estilo.texto, marginTop: 2 }}>{hora}:{min}</Text>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: estilo.texto, marginTop: 3 }}>{estilo.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {Boolean(medAtual?.hospital) && (
                <InfoRow
                  icon="🏥"
                  label="Hospital / Farmácia"
                  value={medAtual.hospital}
                  theme={theme}
                />
              )}
            </View>

            {medAtual.fotos?.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[tipografia.bodySecondary, { marginBottom: 8, color: theme.textSecondary }]}>Fotos ({medAtual.fotos.length}) — Toque para ampliar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {medAtual.fotos.map((f: any, i: any) => (
                      <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => onVisualizarFoto(f)}>
                        <Image source={{ uri: f }} style={{ width: isNarrow ? 80 : 100, height: isNarrow ? 80 : 100, borderRadius: 12, borderWidth: 1, borderColor: theme.border }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {Boolean(medAtual.hospital) && (
              <MiniMapaHospital hospital={medAtual.hospital} lat={medAtual.hospitalLat} lng={medAtual.hospitalLng} exibirBotaoRota />
            )}
          </ScrollView>

          <ButtonSecondary texto="Fechar" onPress={onFechar} icone={require('@/img/icons/x.svg')} style={{ width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
}

function ModalAcaoDose({ doseSelecionada, salvandoDose, theme, onConfirmar, onFechar }: any) {
  if (!doseSelecionada) return null;

  const hora = String(doseSelecionada.dose.getHours()).padStart(2, '0');
  const min = String(doseSelecionada.dose.getMinutes()).padStart(2, '0');
  const dia = String(doseSelecionada.dose.getDate()).padStart(2, '0');
  const mes = String(doseSelecionada.dose.getMonth() + 1).padStart(2, '0');

  return (
    <Modal animationType="fade" transparent visible={Boolean(doseSelecionada)} onRequestClose={onFechar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={[styles.doseModalBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={[styles.doseModalIconWrap, { backgroundColor: doseSelecionada.jaTomou ? '#DCFCE7' : theme.yellow1 }]}>
            <Image
              source={doseSelecionada.jaTomou ? require('@/img/icons/check.svg') : require('@/img/icons/medicamento.svg')}
              style={{ width: 24, height: 24, tintColor: doseSelecionada.jaTomou ? '#166534' : theme.yellow6 }}
            />
          </View>

          <Text style={[tipografia.h3, { marginBottom: 6, textAlign: 'center', color: theme.textPrimary }]}>
            Dose de {dia}/{mes} às {hora}:{min}
          </Text>

          <Text style={[tipografia.bodySecondary, { textAlign: 'center', marginBottom: 20, lineHeight: 20, color: theme.textSecondary }]}>
            {doseSelecionada.jaTomou
              ? 'Essa dose já consta como tomada. Deseja desmarcar e torná-la pendente?'
              : `Confirmar que o medicamento "${doseSelecionada.medicamento.nome}" foi administrado nesta data e horário?`}
          </Text>

          <View style={{ width: '100%', gap: 10 }}>
            <ButtonPrimary
              texto={salvandoDose ? 'Atualizando...' : doseSelecionada.jaTomou ? 'Desmarcar dose' : 'Marcar como tomado'}
              onPress={onConfirmar}
              icone={doseSelecionada.jaTomou ? undefined : require('@/img/icons/check.svg')}
            />
            <ButtonSecondary texto="Cancelar" onPress={onFechar} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ModalSeletorData({ visivel, onFechar, onConfirmar, titulo }: any) {
  const { theme } = useTheme();
  const [dataAtual, setDataAtual] = useState(new Date());

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const diasGrade = [];
  for (let i = 0; i < primeiroDiaSemana; i++) diasGrade.push(null);
  for (let d = 1; d <= diasNoMes; d++) diasGrade.push(d);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={[styles.modalCalendarioBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[tipografia.h3, { marginBottom: 16, textAlign: 'center', color: theme.textPrimary }]}>{titulo}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDataAtual(new Date(ano, mes - 1, 1))} style={{ padding: 8, borderRadius: 8, backgroundColor: theme.inputBg }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>◀</Text>
            </TouchableOpacity>
            <Text style={[tipografia.body, { fontWeight: '600', color: theme.textPrimary }]}>{nomesMeses[mes]} {ano}</Text>
            <TouchableOpacity onPress={() => setDataAtual(new Date(ano, mes + 1, 1))} style={{ padding: 8, borderRadius: 8, backgroundColor: theme.inputBg }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => (
              <Text key={idx} style={{ width: 36, textAlign: 'center', fontWeight: 'bold', color: theme.textSecondary }}>{dia}</Text>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {diasGrade.map((dia, idx) => {
              if (dia === null) return <View key={idx} style={{ width: `${100 / 7}%`, height: 38 }} />;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    const d = dia < 10 ? `0${dia}` : `${dia}`;
                    const m = mes + 1 < 10 ? `0${mes + 1}` : `${mes + 1}`;
                    onConfirmar(`${d}/${m}/${ano}`);
                  }}
                  style={{ width: `${100 / 7}%`, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 19 }}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: 14 }}>{dia}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onFechar} style={{ marginTop: 16, alignItems: 'center', paddingVertical: 10, backgroundColor: theme.inputBg, borderRadius: 12 }}>
            <Text style={{ fontWeight: '600', color: theme.textSecondary }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Campo(props: any) {
  const { theme } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>
        {props.label} {props.obrigatorio ? <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text> : <Text style={{ color: theme.textSecondary, fontWeight: '400' }}>(Opcional)</Text>}
      </Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.gray4}
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
      />
    </View>
  );
}

function InfoRow({ icon, label, value, theme }: { icon: string | ImageSourcePropType; label: string; value: string; theme: any }) {
  const iconeEhTexto = typeof icon === 'string';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      {iconeEhTexto ? (
        <Text style={{ fontSize: 16, marginTop: 1 }}>{icon}</Text>
      ) : (
        <Image source={icon} style={{ width: 20, height: 20, marginTop: 2, tintColor: theme.gray4 }} resizeMode="contain" />
      )}
      <View style={{ flex: 1 }}>
        <Text style={[tipografia.caption, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[tipografia.body, { color: theme.textPrimary }]}>{value || '—'}</Text>
      </View>
    </View>
  );
}

function EstadoVazio({ texto, theme }: { texto: string; theme: any }) {
  return (
    <View style={[styles.estadoVazio, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={{ color: theme.textSecondary }}>{texto}</Text>
    </View>
  );
}

function ModalPadrao({ visible, onClose, isNarrow, theme, children }: { visible: boolean; onClose: () => void; isNarrow: boolean; theme: any; children: ReactNode }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalOverlayFundo, { padding: isNarrow ? 12 : 20 }]}>
        <View style={[styles.modalPadraoBox, { paddingHorizontal: isNarrow ? 20 : 40, paddingVertical: isNarrow ? 24 : 40, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}