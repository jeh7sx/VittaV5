import React, { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

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
  STATUS_CONSULTA,
  calcularTurnoConsulta,
  formatarHorarioConsulta,
  type Consulta,
  type StatusConsulta,
} from '../../hooks/useConsultas';

import { useConsultasController } from '@/controllers/useConsultasController';
import { useTheme } from '@/context/ThemeContext';
import { useFilho } from '@/context/FilhoContext';
import consultaIcon from '../../img/consultas.svg';
import { styles } from '../../styles/app/(user)/consultas';
import { tipografia } from '@/styles/tipografia';

import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';

export default function Consultas() {
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < 768;

  const { theme } = useTheme();
  const { podeEditarFilhoSelecionado } = useFilho();

  const {
    filhoSelecionado,
    isNarrow: hookIsNarrow,
    contadores,
    carregando,
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

    consulta,
    setConsulta,
    descricao,
    setDescricao,
    dataConsulta,
    horario,
    setHorario,
    hospital,
    setHospital,
    hospitalLat,
    hospitalLng,
    setHospitalPlaceId,
    nomeMedico,
    setNomeMedico,
    fotosForm,
    setFotosForm,
    sugestoes,
    buscandoPlaces,

    editConsulta,
    setEditConsulta,
    editDescricao,
    setEditDescricao,
    editDataConsulta,
    editHorario,
    setEditHorario,
    editHospital,
    setEditHospital,
    editHospitalLat,
    editHospitalLng,
    setEditHospitalPlaceId,
    editNomeMedico,
    setEditNomeMedico,
    editFotos,
    setEditFotos,
    editSugestoes,
    editBuscandoPlaces,

    alterarStatus,
    buscarPlaces,
    selecionarPlace,
    escolherFoto,
    removerFoto,
    substituirFoto,
    modalSucessoVisivel,
    cadastrarConsulta,
    limparFormCadastro,
    abrirEditar,
    salvarEdicao,
    confirmarExclusao,

    filtroStatus,
    setFiltroStatus,
    fotoVisualizando,
    setFotoVisualizando,
    modalCalendario,
    setModalCalendario,
    consultasFiltradas,
    fecharMenus,
    aplicarDataSelecionada,
    navegarParaConsultas,
  } = useConsultasController();

  const isNarrow = isNarrowScreen || hookIsNarrow;

  const consultasVisiveis = todosExpandido
    ? consultasFiltradas
    : consultasFiltradas.slice(0, PREVIEW_LIMIT);

  return (
    <TouchableOpacity activeOpacity={1} onPress={fecharMenus} style={[styles.pagina, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />

      <View style={{ flex: 1, minWidth: 0 }}>
        <ScrollView
          style={[styles.scrollPrincipal, { backgroundColor: theme.bg }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { padding: isNarrow ? 12 : 24 }]}
        >
          {/* Cabeçalho com Permissão */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Consultas</Text>
              {!carregando && filhoSelecionado && (
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                  Gerencie as consultas de
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

          {/* Pesquisa + Ação Superior */}
          <View
            style={[
              styles.topoAcoesRow,
              {
                flexDirection: isNarrow ? 'column' : 'row',
                alignItems: isNarrow ? 'stretch' : 'center',
                gap: 16,
                width: '100%',
              },
            ]}
          >
            <View style={{ flex: isNarrow ? undefined : 1 }}>
              <Header {...headerProps} />
            </View>
            {podeEditarFilhoSelecionado && (
              <ButtonPrimary
                style={[
                  styles.btnAdicionarTopo,
                  { minWidth: isNarrow ? undefined : 220, width: isNarrow ? '100%' : undefined },
                ]}
                texto="Adicionar consulta"
                onPress={() => {
                  fecharMenus();
                  setModalCadastro(true);
                }}
                icone={require('@/img/icons/add-01.svg')}
              />
            )}
          </View>

          <View style={{ width: '100%', minWidth: 0 }}>
            {tooltipInfo && (
              <View style={styles.tooltip}>
                <Text style={styles.textoTooltip}>
                  Gerencie as consultas do seu filho e altere o status diretamente no card.
                </Text>
              </View>
            )}

            {!filhoSelecionado && (
              <EstadoVazio texto="Selecione um filho na barra lateral." theme={theme} />
            )}

            {filhoSelecionado && carregando && (
              <ActivityIndicator size="large" color="#F0A900" style={styles.carregando} />
            )}

            {filhoSelecionado && !carregando && consultasFiltradas.length === 0 && filtroStatus === 'Todos' && (
              <View style={[styles.emptyStateContainer, {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                borderWidth: 1,
              }]}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Nenhuma consulta adicionada. Suas consultas adicionadas serão exibidas aqui
                </Text>
                <Image
                  source={require('../../img/icons/semConsultas.svg')}
                  style={styles.emptyStateImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {filhoSelecionado && !carregando && (consultasFiltradas.length > 0 || filtroStatus !== 'Todos') && (
              <View style={{ gap: 16 }}>
                {/* Abas com Filtros sem botão avulso */}
                <View
                  style={[
                    styles.filtrosLinha,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ width: '100%' }}
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 16 }}
                  >
                    {(['Todos', ...STATUS_CONSULTA] as ('Todos' | StatusConsulta)[]).map((status) => {
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
                              minWidth: isNarrow ? (ehTodos ? 120 : 130) : (ehTodos ? 166 : 158),
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
                            source={ehTodos ? consultaIcon : ICONE_STATUS[status]}
                            style={{
                              width: 24,
                              height: 24,
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
                                fontSize: isNarrow ? 14 : 16,
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
                                fontSize: isNarrow ? 13 : 15,
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

                {/* Lista */}
                <View>
                  {consultasVisiveis.map((item) => (
                    <CardConsultaItem
                      key={item.id}
                      item={item}
                      isNarrow={isNarrow}
                      theme={theme}
                      podeEditar={podeEditarFilhoSelecionado}
                      popoverAberto={popoverStatus === item.id}
                      menuAberto={menuOpcoes === item.id}
                      onTogglePopover={(e) => {
                        e.stopPropagation();
                        if (!podeEditarFilhoSelecionado) return;
                        setPopoverStatus(popoverStatus === item.id ? null : item.id);
                        setMenuOpcoes(null);
                      }}
                      onToggleMenu={(e) => {
                        e.stopPropagation();
                        setMenuOpcoes(menuOpcoes === item.id ? null : item.id);
                        setPopoverStatus(null);
                      }}
                      onAlterarStatus={(st) => alterarStatus(item.id, st)}
                      onVerMais={(e) => {
                        e.stopPropagation();
                        setModalVerMais(item);
                      }}
                      onEditar={(e) => {
                        e.stopPropagation();
                        abrirEditar(item);
                      }}
                      onExcluir={(e) => {
                        e.stopPropagation();
                        confirmarExclusao(item.id);
                      }}
                    />
                  ))}

                  {consultasFiltradas.length === 0 && (
                    <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={[tipografia.bodySecondary, { textAlign: 'center', color: theme.textSecondary }]}>
                        Nenhuma consulta com status “{filtroStatus}”.
                      </Text>
                    </View>
                  )}

                  {consultasFiltradas.length > PREVIEW_LIMIT && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => {
                        fecharMenus();
                        setTodosExpandido(!todosExpandido);
                      }}
                      style={[styles.botaoExpandir, {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderWidth: 1
                      }]}>
                      <Text style={[tipografia.caption, styles.textoExpandir, { color: theme.yellow6 }]}>
                        {todosExpandido
                          ? 'Ver menos'
                          : `Ver todas as consultas (${consultasFiltradas.length})`}
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
        <FormConsulta
          isEdit={false}
          isNarrow={isNarrow}
          theme={theme}
          consulta={consulta}
          setConsulta={setConsulta}
          descricao={descricao}
          setDescricao={setDescricao}
          dataConsulta={dataConsulta}
          horario={horario}
          setHorario={setHorario}
          nomeMedico={nomeMedico}
          setNomeMedico={setNomeMedico}
          hospital={hospital}
          setHospital={setHospital}
          setHospitalPlaceId={setHospitalPlaceId}
          hospitalLat={hospitalLat}
          hospitalLng={hospitalLng}
          fotos={fotosForm}
          setFotos={setFotosForm}
          sugestoes={sugestoes}
          buscandoPlaces={buscandoPlaces}
          buscarPlaces={buscarPlaces}
          selecionarPlace={selecionarPlace}
          escolherFoto={escolherFoto}
          removerFoto={removerFoto}
          substituirFoto={substituirFoto}
          onAbrirCalendario={() => setModalCalendario({ visivel: true, isEdit: false })}
        />

        <View
          style={{
            flexDirection: isNarrow ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isNarrow ? 'stretch' : 'center',
            gap: 12,
            marginTop: 18,
          }}
        >
          <ButtonSecondary
            texto="Cancelar"
            icone={require('@/img/icons/x.svg')}
            onPress={() => {
              limparFormCadastro();
              setModalCadastro(false);
            }}
            style={{ width: isNarrow ? '100%' : '48%' }}
          />
          <ButtonPrimary
            texto="Adicionar consulta"
            icone={require('@/img/icons/add-01.svg')}
            onPress={cadastrarConsulta}
            style={{ width: isNarrow ? '100%' : '48%' }}
          />
        </View>
      </ModalPadrao>

      {/* Modal Editar */}
      <ModalPadrao visible={modalEditar} theme={theme} onClose={() => setModalEditar(false)} isNarrow={isNarrow}>
        <FormConsulta
          isEdit={true}
          isNarrow={isNarrow}
          theme={theme}
          consulta={editConsulta}
          setConsulta={setEditConsulta}
          descricao={editDescricao}
          setDescricao={setEditDescricao}
          dataConsulta={editDataConsulta}
          horario={editHorario}
          setHorario={setEditHorario}
          nomeMedico={editNomeMedico}
          setNomeMedico={setEditNomeMedico}
          hospital={editHospital}
          setHospital={setEditHospital}
          setHospitalPlaceId={setEditHospitalPlaceId}
          hospitalLat={editHospitalLat}
          hospitalLng={editHospitalLng}
          fotos={editFotos}
          setFotos={setEditFotos}
          sugestoes={editSugestoes}
          buscandoPlaces={editBuscandoPlaces}
          buscarPlaces={buscarPlaces}
          selecionarPlace={selecionarPlace}
          escolherFoto={escolherFoto}
          removerFoto={removerFoto}
          substituirFoto={substituirFoto}
          onAbrirCalendario={() => setModalCalendario({ visivel: true, isEdit: true })}
        />

        <View
          style={{
            flexDirection: isNarrow ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isNarrow ? 'stretch' : 'center',
            gap: 12,
            marginTop: 18,
          }}
        >
          <ButtonSecondary
            texto="Cancelar"
            icone={require('@/img/icons/x.svg')}
            onPress={() => setModalEditar(false)}
            style={{ width: isNarrow ? '100%' : '48%' }}
          />
          <ButtonPrimary
            texto="Salvar alterações"
            icone={require('@/img/icons/add-01.svg')}
            onPress={salvarEdicao}
            style={{ width: isNarrow ? '100%' : '48%' }}
          />
        </View>
      </ModalPadrao>

      {/* Modal Ver Mais */}
      <ModalVerMaisConsulta
        consulta={modalVerMais}
        isNarrow={isNarrow}
        theme={theme}
        onFechar={() => setModalVerMais(null)}
        onVisualizarFoto={setFotoVisualizando}
      />

      {/* Modal Calendário */}
      <ModalSeletorData
        visivel={modalCalendario.visivel}
        onFechar={() => setModalCalendario({ visivel: false, isEdit: false })}
        onConfirmar={aplicarDataSelecionada}
        titulo="Selecione a Data da Consulta"
      />

      {/* Modal Zoom Foto */}
      <ModalVisualizarImagem
        imagemUri={fotoVisualizando}
        nomeArquivo={modalVerMais ? `consulta-${modalVerMais.consulta.toLowerCase().replace(/\s+/g, '-')}` : 'consulta'}
        onClose={() => setFotoVisualizando(null)}
      />

      {/* Modal Sucesso */}
      <ModalSucesso
        visivel={modalSucessoVisivel}
        tipo="exame"
        duracaoMs={5000}
        onFechar={navegarParaConsultas}
        onVerMais={navegarParaConsultas}
      />
    </TouchableOpacity>
  );
}

function CardConsultaItem({
  item,
  isNarrow,
  theme,
  podeEditar,
  popoverAberto,
  menuAberto,
  onTogglePopover,
  onToggleMenu,
  onAlterarStatus,
  onVerMais,
  onEditar,
  onExcluir,
}: {
  item: Consulta;
  isNarrow: boolean;
  theme: any;
  podeEditar: boolean;
  popoverAberto: boolean;
  menuAberto: boolean;
  onTogglePopover: (e: any) => void;
  onToggleMenu: (e: any) => void;
  onAlterarStatus: (status: StatusConsulta) => void;
  onVerMais: (e: any) => void;
  onEditar: (e: any) => void;
  onExcluir: (e: any) => void;
}) {
  const turno = item.turno || calcularTurnoConsulta(item.horario);
  const corTurno = turno === 'Manhã' ? '#E8A300' : turno === 'Tarde' ? '#F07C00' : '#252A63';
  const [hoverAcao, setHoverAcao] = useState<string | null>(null);

  return (
    <View
      style={[
        styles.cardConsulta,
        {
          paddingVertical: isNarrow ? 12 : 22,
          paddingHorizontal: isNarrow ? 12 : 22,
          gap: isNarrow ? 8 : 16,
          minHeight: isNarrow ? 76 : 98,
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          zIndex: popoverAberto || menuAberto ? 1000 : 1,
          elevation: popoverAberto || menuAberto ? 1000 : 1,
          width: '100%',
        },
      ]}
    >
      <View
        style={[
          styles.iconeBoxConsulta,
          { width: isNarrow ? 36 : 48, height: isNarrow ? 36 : 48, backgroundColor: theme.bgConsul },
        ]}
      >
        <Image source={consultaIcon} style={{ width: isNarrow ? 20 : 24, height: isNarrow ? 20 : 24, tintColor: theme.Consul }} resizeMode="contain" />
      </View>

      <View style={{ flex: 1.2, minWidth: 0 }}>
        <Text numberOfLines={1} style={[tipografia.body, { color: theme.textPrimary, fontWeight: '700', fontSize: isNarrow ? 14 : 16 }]}>
          {item.consulta}
        </Text>
        {!isNarrow ? (
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            {item.hospital || '—'}
          </Text>
        ) : (
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: 12 }]}>
            {item.dataConsulta || '—'}
          </Text>
        )}
      </View>

      {!isNarrow && (
        <View style={{ flex: 1, minWidth: 135, gap: 4 }}>
          <Text style={[tipografia.body, { color: theme.textPrimary }]}>{item.dataConsulta || '—'}</Text>
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            {item.nomeMedico || '—'}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[tipografia.body, { color: theme.textPrimary, fontSize: isNarrow ? 14 : 16, fontWeight: '600' }]}>
          {item.horario ? `${item.horario} horas` : '—'}
        </Text>
        {!isNarrow && item.horario ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Image source={ICONE_TURNO[turno]} style={{ width: 24, height: 24, tintColor: corTurno }} resizeMode="contain" />
            <Text style={[tipografia.body, { color: corTurno }]}>{turno}</Text>
          </View>
        ) : null}
      </View>

      {/* Popover de Status */}
      <View style={{ position: 'relative', flexShrink: 0 }}>
        <TouchableOpacity
          activeOpacity={podeEditar ? 0.8 : 1}
          onPress={onTogglePopover}
          style={[
            styles.statusBadgeBtn,
            {
              width: isNarrow ? 36 : 56,
              height: isNarrow ? 36 : 40,
              backgroundColor: COR_STATUS[item.status].bg,
            },
          ]}
        >
          <Image
            source={ICONE_STATUS[item.status]}
            style={{ width: 20, height: 20, tintColor: COR_STATUS[item.status].text }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {popoverAberto && podeEditar && (
          <View style={[styles.popover, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {STATUS_CONSULTA.map((status, index) => (
              <TouchableOpacity
                key={status}
                activeOpacity={0.75}
                onPress={(e) => {
                  e.stopPropagation();
                  onAlterarStatus(status);
                }}
                style={[
                  styles.itemPopover,
                  {
                    backgroundColor: item.status === status ? COR_STATUS[status].bg : theme.cardBg,
                    borderBottomWidth: index < STATUS_CONSULTA.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Image
                  source={ICONE_STATUS[status]}
                  style={{ width: 24, height: 24, tintColor: COR_STATUS[status].text }}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    tipografia.caption,
                    {
                      color: COR_STATUS[status].text,
                      fontWeight: item.status === status ? '700' : '500',
                    },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Ações */}
      {!isNarrow ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0, position: 'relative' }}>
          {/* Botão Ver mais */}
          <View style={{ position: 'relative', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={onVerMais}
              activeOpacity={0.65}
              // @ts-ignore
              onMouseEnter={() => setHoverAcao('ver')}
              onMouseLeave={() => setHoverAcao(null)}
              style={{ padding: 6 }}
            >
              <Image source={require('@/img/icons/view.svg')} style={{ width: 24, height: 24, tintColor: theme.textPrimary }} />
            </TouchableOpacity>
            {hoverAcao === 'ver' && (
              <View style={{ position: 'absolute', bottom: '100%', marginBottom: 4, backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 9999 }}>
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>Ver mais</Text>
              </View>
            )}
          </View>

          {podeEditar && (
            <>
              {/* Botão Editar */}
              <View style={{ position: 'relative', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={onEditar}
                  activeOpacity={0.65}
                  // @ts-ignore
                  onMouseEnter={() => setHoverAcao('edit')}
                  onMouseLeave={() => setHoverAcao(null)}
                  style={{ padding: 6 }}
                >
                  <Image source={require('@/img/icons/edit-02.svg')} style={{ width: 24, height: 24, tintColor: theme.textPrimary }} resizeMode="contain" />
                </TouchableOpacity>
                {hoverAcao === 'edit' && (
                  <View style={{ position: 'absolute', bottom: '100%', marginBottom: 4, backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 9999 }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>Editar</Text>
                  </View>
                )}
              </View>

              {/* Botão Excluir */}
              <View style={{ position: 'relative', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={onExcluir}
                  activeOpacity={0.65}
                  // @ts-ignore
                  onMouseEnter={() => setHoverAcao('del')}
                  onMouseLeave={() => setHoverAcao(null)}
                  style={{ padding: 6 }}
                >
                  <Image source={require('@/img/icons/delete-02.svg')} style={{ width: 24, height: 24, tintColor: '#E11919' }} resizeMode="contain" />
                </TouchableOpacity>
                {hoverAcao === 'del' && (
                  <View style={{ position: 'absolute', bottom: '100%', marginBottom: 4, backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 9999 }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600' }}>Excluir</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={{ position: 'relative', flexShrink: 0 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={onToggleMenu} style={{ width: 30, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, color: theme.textSecondary, lineHeight: 24 }}>⋮</Text>
          </TouchableOpacity>

          {menuAberto && (
            <View style={[styles.menuDropdownMobile, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <TouchableOpacity onPress={onVerMais} style={[styles.itemMenuMobile, { borderBottomWidth: podeEditar ? 1 : 0, borderBottomColor: theme.border }]}>
                <Text style={[tipografia.caption, { color: theme.textPrimary }]}>Ver mais</Text>
              </TouchableOpacity>
              {podeEditar && (
                <>
                  <TouchableOpacity onPress={onEditar} style={[styles.itemMenuMobile, { borderBottomColor: theme.border }]}>
                    <Text style={[tipografia.caption, { color: theme.textPrimary }]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onExcluir} style={{ paddingVertical: 13, paddingHorizontal: 14 }}>
                    <Text style={[tipografia.caption, { color: '#D93025' }]}>Excluir</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function FormConsulta(props: any) {
  const {
    isEdit,
    isNarrow,
    theme,
    consulta, setConsulta,
    descricao, setDescricao,
    dataConsulta,
    horario, setHorario,
    nomeMedico, setNomeMedico,
    hospital, setHospital, setHospitalPlaceId,
    hospitalLat, hospitalLng,
    fotos, setFotos,
    sugestoes, buscandoPlaces,
    buscarPlaces, selecionarPlace,
    escolherFoto, removerFoto, substituirFoto,
    onAbrirCalendario,
  } = props;

  return (
    <ScrollView
      style={[styles.formularioScroll, isNarrow && styles.formularioScrollMobile]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 18 }}>
        <View
          style={{
            backgroundColor: theme.bgConsul,
            borderRadius: 999,
            padding: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image source={require('@/img/icons/stethoscope-02.svg')} style={{ width: 32, height: 32, tintColor: theme.Consul }} />
        </View>
        <Text style={[tipografia.h2, { color: theme.textPrimary }]}>{isEdit ? 'Editar ' : 'Adicionar '}consulta</Text>
      </View>

      <Campo
        label="Consulta"
        placeholder="Ex: Rotina, acompanhamento"
        placeholderTextColor={theme.gray4}
        value={consulta}
        onChangeText={setConsulta}
        theme={theme}
      />

      <Text style={[styles.label, { color: theme.textPrimary }]}>Descrição / Observações</Text>
      <TextInput
        placeholder="Observações sobre a consulta..."
        placeholderTextColor={theme.gray4}
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
        style={[styles.input, { minHeight: 70, textAlignVertical: 'top', marginBottom: 14, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
      />

      <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: 16, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Data</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAbrirCalendario}
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.inputBg, borderColor: theme.border }]}
          >
            <Text style={{ color: dataConsulta ? theme.textPrimary : '#AAA', fontSize: 16 }}>
              {dataConsulta || 'Selecionar data'}
            </Text>
            <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 24, height: 24, tintColor: theme.gray4 }} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Campo
            label="Horário"
            placeholder="Ex: 09:00"
            value={horario}
            onChangeText={(valor: string) => setHorario(formatarHorarioConsulta(valor))}
            keyboardType="numeric"
            maxLength={5}
            theme={theme}
          />
          {!!calcularTurnoConsulta(horario) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 14 }}>
              <Image source={ICONE_TURNO[calcularTurnoConsulta(horario)]} style={{ width: 14, height: 14 }} resizeMode="contain" />
              <Text style={{ fontSize: 11, color: theme.textSecondary }}>{calcularTurnoConsulta(horario)}</Text>
            </View>
          )}
        </View>
      </View>

      <Campo
        label="Médico"
        placeholder="Ex: Cláudio Silva"
        placeholderTextColor={theme.gray4}
        value={nomeMedico}
        onChangeText={setNomeMedico}
        theme={theme}
      />

      <Text style={[styles.label, { color: theme.textPrimary }]}>Hospital ou clínica</Text>
      <View style={{ position: 'relative', marginBottom: 14, zIndex: 99 }}>
        <TextInput
          placeholder="Buscar hospital ou clínica..."
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
          <View style={[styles.dropdownPlaces, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {sugestoes.map((sg: any) => (
              <TouchableOpacity key={sg.place_id} onPress={() => selecionarPlace(sg, isEdit)} style={[styles.itemDropdownPlaces, { borderBottomColor: theme.border }]}>
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

      {/* Upload de Fotos */}
      <Text style={[styles.label, { marginTop: 14, color: theme.textPrimary }]}>
        Fotos <Text style={{ fontWeight: '400', color: theme.textSecondary }}>(máx. {MAX_FOTOS})</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {fotos.map((f: string, i: number) => (
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
            style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: theme.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.inputBg }}
          >
            <Text style={{ fontSize: 26, color: theme.gray4 }}>+</Text>
            <Text style={{ fontSize: 10, color: theme.gray4, marginTop: 2 }}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

function ModalVerMaisConsulta({
  consulta,
  isNarrow,
  theme,
  onFechar,
  onVisualizarFoto,
}: {
  consulta: Consulta | null;
  isNarrow: boolean;
  theme: any;
  onFechar: () => void;
  onVisualizarFoto: (uri: string) => void;
}) {
  if (!consulta) return null;

  return (
    <Modal animationType="fade" transparent visible={Boolean(consulta)} onRequestClose={onFechar}>
      <View style={[styles.modalFundo, { padding: isNarrow ? 12 : 20 }]}>
        <View style={[styles.verMaisBox, { padding: isNarrow ? 20 : 24, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <ScrollView style={{ maxHeight: isNarrow ? 460 : 520 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <View style={[styles.verMaisIconWrap, { backgroundColor: theme.bgConsul }]}>
                <Image source={consultaIcon} style={{ width: 24, height: 24, tintColor: theme.Consul }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[tipografia.h3, { color: theme.textPrimary }]}>{consulta.consulta}</Text>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>{consulta.nomeFilho}</Text>
              </View>
              <View
                style={[
                  styles.verMaisStatusBadge,
                  {
                    backgroundColor: COR_STATUS[consulta.status].bg,
                    borderColor: COR_STATUS[consulta.status].border,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Image
                    source={ICONE_STATUS[consulta.status]}
                    style={{ width: 24, height: 24, tintColor: COR_STATUS[consulta.status].text }}
                    resizeMode="contain"
                  />
                  <Text style={[tipografia.body, { color: COR_STATUS[consulta.status].text, }]}>
                    {consulta.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 16 }} />

            {/* Linhas de Informações */}
            <View style={{ gap: 12, marginBottom: 16 }}>
              {consulta.dataConsulta && <InfoRow icon={require('@/img/icons/alarm-clock.svg')} label="Data" value={consulta.dataConsulta} theme={theme} />}
              {consulta.horario && (
                <InfoRow
                  icon={ICONE_TURNO[consulta.turno] || '🕐'}
                  label="Horário"
                  value={`${consulta.horario} — ${consulta.turno || calcularTurnoConsulta(consulta.horario)}`}
                  theme={theme}
                />
              )}
              {consulta.nomeMedico && <InfoRow icon="👨‍⚕️" label="Médico(a)" value={`Dr(a). ${consulta.nomeMedico}`} theme={theme} />}
              {consulta.hospital && <InfoRow icon="🏥" label="Hospital / Clínica" value={consulta.hospital} theme={theme} />}
            </View>

            {consulta.descricao && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Descrição</Text>
                <View style={[styles.descricaoBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Text style={[tipografia.body, { color: theme.textPrimary }]}>{consulta.descricao}</Text>
                </View>
              </View>
            )}

            {consulta.fotos?.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Fotos ({consulta.fotos.length}) — Toque para ampliar
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {consulta.fotos.map((f, i) => (
                      <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => onVisualizarFoto(f)}>
                        <Image source={{ uri: f }} style={{ width: isNarrow ? 80 : 100, height: isNarrow ? 80 : 100, borderRadius: 12, borderWidth: 1, borderColor: theme.border }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {Boolean(consulta.hospital) && (
              <MiniMapaHospital hospital={consulta.hospital} lat={consulta.hospitalLat} lng={consulta.hospitalLng} exibirBotaoRota />
            )}
          </ScrollView>

          <ButtonSecondary texto="Fechar" onPress={onFechar} icone={require('@/img/icons/x.svg')} style={{ width: '100%' }} />
        </View>
      </View>
    </Modal>
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
  const [dataAtual, setDataAtual] = useState(new Date());

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const diasGrade: (number | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) diasGrade.push(null);
  for (let d = 1; d <= diasNoMes; d++) diasGrade.push(d);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={[styles.modalPadraoOverlay, { padding: 16 }]}>
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

function Campo({ label, placeholder, value, onChangeText, keyboardType, maxLength, placeholderTextColor, editable = true, theme }: any) {
  return (
    <View style={styles.campoContainer}>
      <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || theme.gray4}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
      />
    </View>
  );
}

function EstadoVazio({ texto, theme }: any) {
  return (
    <View style={[styles.estadoVazio, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.textoEstadoVazio, { color: theme.textSecondary }]}>{texto}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, theme }: { icon: string; label: string; value: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={[tipografia.caption, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>{value || '—'}</Text>
      </View>
    </View>
  );
}

function ModalPadrao({ visible, onClose, isNarrow, theme, children }: { visible: boolean; onClose: () => void; isNarrow: boolean; theme: any; children: ReactNode }) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalPadraoOverlay, { padding: isNarrow ? 12 : 20 }]}>
        <View style={[styles.modalPadraoBox, { paddingHorizontal: isNarrow ? 20 : 36, paddingVertical: isNarrow ? 24 : 36, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}