import React, { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  ImageSourcePropType,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';
import { useFilho } from '@/context/FilhoContext';

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
  calcularTurno,
  formatarHorario,
  type Exame,
  type StatusExame,
} from '@/hooks/useExames';

import { useExamesController } from '@/controllers/useExamesController';
import exameIcon from '../../img/exames.svg';
import { styles } from '../../styles/app/(user)/exames';

export default function Exames() {
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < 768;

  const { theme } = useTheme();
  const { podeEditarFilhoSelecionado } = useFilho();

  const {
    filhoSelecionado,
    isNarrow: hookIsNarrow,
    carregando,
    contadores,
    headerProps,

    popoverStatus, setPopoverStatus,
    modalCadastro, setModalCadastro,
    modalEditar, setModalEditar,
    modalVerMais, setModalVerMais,
    menuOpcoes, setMenuOpcoes,
    tooltipInfo,

    titulo, setTitulo,
    descricao, setDescricao,
    hospital, setHospital,
    hospitalLat,
    hospitalLng,
    setHospitalPlaceId,
    dataExame,
    horario, setHorario,
    nomeDoutor, setNomeDoutor,
    fotosForm, setFotosForm,
    sugestoes,
    buscandoPlaces,

    editTitulo, setEditTitulo,
    editDescricao, setEditDescricao,
    editHospital, setEditHospital,
    editHospitalLat,
    editHospitalLng,
    setEditHospitalPlaceId,
    editData,
    editHorario, setEditHorario,
    editNomeDoutor, setEditNomeDoutor,
    editFotos, setEditFotos,
    editSugestoes,
    editBuscandoPlaces,

    alterarStatus,
    buscarPlaces,
    selecionarPlace,
    escolherFoto,
    removerFoto,
    substituirFoto,
    modalSucessoVisivel,
    cadastrarExame,
    limparFormCadastro,
    abrirEditar,
    salvarEdicao,
    confirmarExclusao,

    abaSelecionada, setAbaSelecionada,
    listaExpandida, setListaExpandida,
    fotoVisualizando, setFotoVisualizando,
    modalCalendario, setModalCalendario,
    examesFiltrados,
    examesVisiveis,
    fecharMenus,
    aplicarDataSelecionada,
    navegarParaExames,
  } = useExamesController();

  const isNarrow = isNarrowScreen || hookIsNarrow;


  return (
    <TouchableOpacity activeOpacity={1} onPress={fecharMenus} style={[styles.root, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />

      <View style={{ flex: 1, minWidth: 0, gap: 16 }}>
        <ScrollView
          style={[styles.scrollContainer, { backgroundColor: theme.bg }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { padding: isNarrow ? 12 : 24 }]}
        >
          {/* Título com Permissão */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Exames</Text>
              {!carregando && filhoSelecionado && (
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                  Gerencie os exames de
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

          {/* Busca + Ação de Adicionar */}
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
                texto="Adicionar exame"
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
              <View style={styles.tooltipBox}>
                <Text style={styles.tooltipText}>
                  Gerencie todos os exames do seu filho e altere o status diretamente no card.
                </Text>
              </View>
            )}

            {!filhoSelecionado && (
              <View style={[styles.semFilhoBox, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                  Selecione um filho na barra lateral.
                </Text>
              </View>
            )}

            {filhoSelecionado && carregando && (
              <ActivityIndicator size="large" color="#F0A900" style={{ marginTop: 40 }} />
            )}

            {filhoSelecionado && !carregando && examesFiltrados.length === 0 && abaSelecionada === 'Todos' && (
              <View style={[styles.emptyStateContainer, {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                borderWidth: 1,
              }]}>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Nenhum exame adicionado. Seus exames adicionados serão exibidos aqui
                </Text>
                <Image
                  source={require('../../img/icons/semExames.svg')}
                  style={styles.emptyStateImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {filhoSelecionado && !carregando && (examesFiltrados.length > 0 || abaSelecionada !== 'Todos') && (
              <View style={{ gap: 16 }}>
                {/* Abas de Filtro sem botão avulso */}
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
                    {(['Todos', 'Ativo', 'Atrasado', 'Concluído'] as const).map((tab) => {
                      const selecionado = abaSelecionada === tab;
                      const ehTodos = tab === 'Todos';
                      const quantidade = ehTodos ? contadores.Todos : contadores[tab];

                      return (
                        <TouchableOpacity
                          key={tab}
                          activeOpacity={0.8}
                          onPress={() => {
                            setAbaSelecionada(tab);
                            setListaExpandida(false);
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
                                    ? COR_STATUS[tab].bg
                                    : theme.inputBg,
                            },
                          ]}
                        >
                          <Image
                            source={ehTodos ? exameIcon : ICONE_STATUS[tab]}
                            style={{
                              width: 20,
                              height: 20,
                              tintColor:
                                selecionado && ehTodos
                                  ? (theme.id === 'dark' ? '#FFF' : theme.yellow9)
                                  : selecionado && !ehTodos
                                    ? COR_STATUS[tab].text
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
                                      ? COR_STATUS[tab].text
                                      : theme.textSecondary,
                                fontWeight: selecionado ? '700' : '400',
                              },
                            ]}
                          >
                            {tab}
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
                                      ? COR_STATUS[tab].text
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

                {/* Lista de Cards */}
                <View>
                  {examesVisiveis.map((exame) => (
                    <CardExameItem
                      key={exame.id}
                      exame={exame}
                      isNarrow={isNarrow}
                      theme={theme}
                      podeEditar={podeEditarFilhoSelecionado}
                      popoverAberto={popoverStatus === exame.id}
                      menuAberto={menuOpcoes === exame.id}
                      onTogglePopover={() => {
                        if (!podeEditarFilhoSelecionado) return;
                        setPopoverStatus(popoverStatus === exame.id ? null : exame.id);
                        setMenuOpcoes(null);
                      }}
                      onToggleMenu={() => {
                        setMenuOpcoes(menuOpcoes === exame.id ? null : exame.id);
                        setPopoverStatus(null);
                      }}
                      onAlterarStatus={(st) => alterarStatus(exame.id, st)}
                      onVerMais={() => setModalVerMais(exame)}
                      onEditar={() => abrirEditar(exame)}
                      onExcluir={() => confirmarExclusao(exame.id)}
                    />
                  ))}

                  {examesFiltrados.length === 0 && (
                    <View style={{ paddingVertical: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={[tipografia.bodySecondary, { textAlign: 'center', color: theme.textSecondary }]}>
                        Nenhum exame com status “{abaSelecionada}”.
                      </Text>
                    </View>
                  )}

                  {examesFiltrados.length > PREVIEW_LIMIT && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => setListaExpandida(!listaExpandida)}
                      style={[styles.verTodosBtn, {
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        borderWidth: 1
                      }]}>
                      <Text style={[tipografia.caption, styles.verTodosText, { color: theme.yellow6 }]}>
                        {listaExpandida ? 'Ver menos' : `Ver todos exames (${examesFiltrados.length})`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modal de Cadastro */}
      <ModalPadrao
        visible={modalCadastro}
        onClose={() => {
          limparFormCadastro();
          setModalCadastro(false);
        }}
        isNarrow={isNarrow}
        theme={theme}
      >
        <FormExame
          isEdit={false}
          isNarrow={isNarrow}
          theme={theme}
          titulo={titulo}
          setTitulo={setTitulo}
          descricao={descricao}
          setDescricao={setDescricao}
          dataExame={dataExame}
          horario={horario}
          setHorario={setHorario}
          nomeDoutor={nomeDoutor}
          setNomeDoutor={setNomeDoutor}
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
            texto="Adicionar exame"
            onPress={cadastrarExame}
            icone={require('@/img/icons/add-01.svg')}
            style={{ width: isNarrow ? '100%' : '48%' }}
          />
        </View>
      </ModalPadrao>

      {/* Modal de Edição */}
      <ModalPadrao visible={modalEditar} onClose={() => setModalEditar(false)} isNarrow={isNarrow} theme={theme}>
        <FormExame
          isEdit={true}
          isNarrow={isNarrow}
          theme={theme}
          titulo={editTitulo}
          setTitulo={setEditTitulo}
          descricao={editDescricao}
          setDescricao={setEditDescricao}
          dataExame={editData}
          horario={editHorario}
          setHorario={setEditHorario}
          nomeDoutor={editNomeDoutor}
          setNomeDoutor={setNomeDoutor}
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
      <ModalVerMaisExame
        exame={modalVerMais}
        isNarrow={isNarrow}
        theme={theme}
        onFechar={() => setModalVerMais(null)}
        onVisualizarFoto={setFotoVisualizando}
      />

      {/* Seletor de Data */}
      <ModalSeletorData
        visivel={modalCalendario.visivel}
        onFechar={() => setModalCalendario({ visivel: false, isEdit: false })}
        onConfirmar={aplicarDataSelecionada}
        titulo="Selecione a Data do Exame"
      />

      {/* Zoom na Foto */}
      <ModalVisualizarImagem
        imagemUri={fotoVisualizando}
        nomeArquivo={modalVerMais ? `exame-${modalVerMais.titulo.toLowerCase().replace(/\s+/g, '-')}` : 'exame'}
        onClose={() => setFotoVisualizando(null)}
      />

      {/* Modal Sucesso */}
      <ModalSucesso
        visivel={modalSucessoVisivel}
        tipo="exame"
        duracaoMs={5000}
        onFechar={navegarParaExames}
        onVerMais={navegarParaExames}
      />
    </TouchableOpacity>
  );
}

function CardExameItem({
  exame,
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
  exame: Exame;
  isNarrow: boolean;
  theme: any;
  podeEditar: boolean;
  popoverAberto: boolean;
  menuAberto: boolean;
  onTogglePopover: () => void;
  onToggleMenu: () => void;
  onAlterarStatus: (status: StatusExame) => void;
  onVerMais: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const turno = exame.turno || calcularTurno(exame.horario);
  const corTurno = turno === 'Manhã' ? '#E8A300' : turno === 'Tarde' ? '#F07C00' : '#252A63';
  const [hoverAcao, setHoverAcao] = useState<string | null>(null);
  
  return (
    <View
      style={[
        styles.examCard,
        {
          paddingVertical: isNarrow ? 12 : 22,
          paddingHorizontal: isNarrow ? 12 : 22,
          gap: isNarrow ? 8 : 20,
          minHeight: isNarrow ? 76 : 96,
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
          styles.iconeBoxExame,
          { width: isNarrow ? 36 : 48, height: isNarrow ? 36 : 48, backgroundColor: theme.bgExame },
        ]}
      >
        <Image source={exameIcon} style={{ width: isNarrow ? 20 : 24, height: isNarrow ? 20 : 24, tintColor: theme.Exame }} resizeMode="contain" />
      </View>

      <View style={{ flex: 1.2, minWidth: 0 }}>
        <Text numberOfLines={1} style={[tipografia.body, { color: theme.textPrimary, fontWeight: '700', fontSize: isNarrow ? 14 : 16 }]}>
          {exame.titulo}
        </Text>
        {!isNarrow ? (
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            {exame.hospital || '—'}
          </Text>
        ) : (
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: 12 }]}>
            {exame.dataExame || '—'}
          </Text>
        )}
      </View>

      {!isNarrow && (
        <View style={{ flex: 1, minWidth: 150 }}>
          <Text style={[tipografia.body, { color: theme.textPrimary }]}>{exame.dataExame || '—'}</Text>
          <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
            {exame.nomeDoutor || '—'}
          </Text>
        </View>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[tipografia.body, { color: theme.textPrimary, fontSize: isNarrow ? 13 : 15, fontWeight: '600' }]}>
          {exame.horario ? `${exame.horario} horas` : '—'}
        </Text>
        {!isNarrow && exame.horario ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={ICONE_TURNO[turno]} style={{ width: 24, height: 24, tintColor: corTurno }} resizeMode="contain" />
            <Text style={[tipografia.caption, { color: corTurno }]}>{turno}</Text>
          </View>
        ) : null}
      </View>

      {/* Popover de Status */}
      <View style={{ position: 'relative', flexShrink: 0 }}>
        <TouchableOpacity
          activeOpacity={podeEditar ? 0.8 : 1}
          onPress={onTogglePopover}
          style={[styles.statusBadgeBtn, { backgroundColor: COR_STATUS[exame.status].bg, paddingHorizontal: isNarrow ? 10 : 16 }]}
        >
          <Image
            source={ICONE_STATUS[exame.status]}
            style={{ width: 20, height: 20, tintColor: COR_STATUS[exame.status].text }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {popoverAberto && podeEditar && (
          <View style={[styles.statusPopover, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {(['Ativo', 'Atrasado', 'Concluído'] as StatusExame[]).map((status) => (
              <TouchableOpacity
                key={status}
                activeOpacity={0.75}
                onPress={() => onAlterarStatus(status)}
                style={[
                  styles.statusPopoverItem,
                  {
                    backgroundColor: exame.status === status ? COR_STATUS[status].bg : theme.cardBg,
                    borderBottomWidth: status === 'Concluído' ? 0 : 1,
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Image
                  source={ICONE_STATUS[status]}
                  style={{ width: 20, height: 20, tintColor: COR_STATUS[status].text }}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    tipografia.caption,
                    {
                      color: COR_STATUS[status].text,
                      fontWeight: exame.status === status ? '700' : '500',
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
          <TouchableOpacity activeOpacity={0.7} onPress={onToggleMenu} style={{ padding: 6 }}>
            <Text style={{ fontSize: 22, color: theme.textSecondary }}>⋮</Text>
          </TouchableOpacity>

          {menuAberto && (
            <View
              style={{
                position: 'absolute',
                right: 0,
                top: 36,
                minWidth: 140,
                backgroundColor: theme.cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: 'hidden',
                elevation: 20,
                zIndex: 9999,
              }}
            >
              <TouchableOpacity onPress={onVerMais} style={{ padding: 12, borderBottomWidth: podeEditar ? 1 : 0, borderBottomColor: theme.border }}>
                <Text style={[tipografia.caption, { color: theme.textPrimary }]}>Ver mais</Text>
              </TouchableOpacity>
              {podeEditar && (
                <>
                  <TouchableOpacity onPress={onEditar} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                    <Text style={[tipografia.caption, { color: theme.textPrimary }]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onExcluir} style={{ padding: 12 }}>
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

function FormExame(props: any) {
  const {
    isEdit,
    isNarrow,
    theme,
    titulo, setTitulo,
    descricao, setDescricao,
    dataExame,
    horario, setHorario,
    nomeDoutor, setNomeDoutor,
    hospital, setHospital, setHospitalPlaceId,
    hospitalLat, hospitalLng,
    fotos, setFotos,
    sugestoes, buscandoPlaces,
    buscarPlaces, selecionarPlace,
    escolherFoto, removerFoto, substituirFoto,
    onAbrirCalendario,
  } = props;

  return (
    <ScrollView style={{ maxHeight: 680 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 18 }}>
        <View style={{ backgroundColor: theme.bgExame, borderRadius: 999, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('@/img/icons/microscope.svg')} style={{ width: 32, height: 32, tintColor: theme.Exame }} />
        </View>
        <Text style={[tipografia.h2, { color: theme.textPrimary }]}>{isEdit ? 'Editar' : 'Adicionar'} exame</Text>
      </View>

      <CampoFormulario
        label="Título do exame"
        placeholder="Ex: Hemograma completo"
        value={titulo}
        onChangeText={setTitulo}
        theme={theme}
      />

      <Text style={[tipografia.body, { marginBottom: 6, color: theme.textPrimary }]}>Descrição</Text>
      <TextInput
        placeholder="Observações sobre o exame..."
        placeholderTextColor={theme.gray4}
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
        style={[styles.input, { minHeight: 70, textAlignVertical: 'top', backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
      />

      <View style={{ flexDirection: isNarrow ? 'column' : 'row', gap: 12, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={[tipografia.body, { marginBottom: 6, color: theme.textPrimary }]}>Data do exame</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAbrirCalendario}
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, backgroundColor: theme.inputBg, borderColor: theme.border }]}
          >
            <Text style={{ color: dataExame ? theme.textPrimary : '#AAA', fontSize: 15 }}>{dataExame || 'Selecionar data'}</Text>
            <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[tipografia.body, { marginBottom: 6, color: theme.textPrimary }]}>Horário</Text>
          <TextInput
            placeholder="Ex: 09:30"
            placeholderTextColor={theme.gray4}
            value={horario}
            onChangeText={(t) => setHorario(formatarHorario(t))}
            keyboardType="numeric"
            maxLength={5}
            style={[styles.input, { height: 48, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          />
        </View>
      </View>

      <CampoFormulario
        label="Nome do doutor(a)"
        placeholder="Ex: Dr. Carlos"
        value={nomeDoutor}
        onChangeText={setNomeDoutor}
        theme={theme}
      />

      <View style={{ gap: 6, marginBottom: 14, zIndex: 99 }}>
        <Text style={[tipografia.body, { color: theme.textPrimary }]}>Hospital</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="Buscar hospital..."
            placeholderTextColor={theme.gray4}
            value={hospital}
            onChangeText={(t) => {
              setHospital(t);
              setHospitalPlaceId('');
              buscarPlaces(t, isEdit);
            }}
            style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
          />
          {buscandoPlaces && <ActivityIndicator size="small" color="#F7B500" style={{ position: 'absolute', right: 12, top: 14 }} />}
          {sugestoes.length > 0 && (
            <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              {sugestoes.map((sg: any) => (
                <TouchableOpacity key={sg.place_id} onPress={() => selecionarPlace(sg, isEdit)} style={[styles.dropdownItem, { borderBottomColor: theme.border }]}>
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
      </View>

      {/* Galeria de Fotos */}
      <View style={{ gap: 8, marginBottom: 20 }}>
        <Text style={[tipografia.body, { color: theme.textPrimary }]}>
          Fotos <Text style={{ color: theme.textSecondary }}>(máx. {MAX_FOTOS})</Text>
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          {fotos.map((f: string, i: number) => (
            <View key={i} style={{ position: 'relative' }}>
              <Image source={{ uri: f }} style={{ width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: theme.border }} />
              <TouchableOpacity
                onPress={() => removerFoto(i, fotos, setFotos)}
                style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#838383', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
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
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function ModalVerMaisExame({
  exame,
  isNarrow,
  theme,
  onFechar,
  onVisualizarFoto,
}: {
  exame: Exame | null;
  isNarrow: boolean;
  theme: any;
  onFechar: () => void;
  onVisualizarFoto: (uri: string) => void;
}) {
  if (!exame) return null;

  return (
    <Modal animationType="fade" transparent visible={Boolean(exame)} onRequestClose={onFechar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: isNarrow ? 12 : 20 }}>
        <View style={[styles.verMaisBox, { padding: isNarrow ? 20 : 24, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <ScrollView style={{ maxHeight: isNarrow ? 460 : 520 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <View style={[styles.verMaisIconWrap, { backgroundColor: theme.bgExame }]}>
                <Image source={exameIcon} style={{ width: 22, height: 22, tintColor: theme.Exame }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: theme.textPrimary }}>{exame.titulo}</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>{exame.nomeFilho}</Text>
              </View>
              <View style={[styles.verMaisStatusBadge, { backgroundColor: COR_STATUS[exame.status].bg, borderColor: COR_STATUS[exame.status].border }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: COR_STATUS[exame.status].text }}>
                  {exame.status}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 16 }} />

            <View style={{ gap: 12, marginBottom: 16 }}>
              {Boolean(exame.dataExame) && (
                <InfoRow icon="📅" label="Data" value={exame.dataExame} theme={theme} />
              )}
              {Boolean(exame.horario) && (
                <InfoRow icon="🕐" label="Horário" value={`${exame.horario} — ${exame.turno}`} theme={theme} />
              )}
              {Boolean(exame.nomeDoutor) && (
                <InfoRow icon="👨‍⚕️" label="Doutor(a)" value={`Dr(a). ${exame.nomeDoutor}`} theme={theme} />
              )}
              {Boolean(exame.hospital) && (
                <InfoRow icon="🏥" label="Hospital" value={exame.hospital} theme={theme} />
              )}
            </View>

            {exame.descricao && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>
                  Descrição
                </Text>
                <View style={[styles.descricaoBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Text style={{ fontSize: 13, color: theme.textPrimary, lineHeight: 20 }}>{exame.descricao}</Text>
                </View>
              </View>
            )}

            {exame.fotos?.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase' }}>
                  Fotos ({exame.fotos.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {exame.fotos.map((f, i) => (
                      <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => onVisualizarFoto(f)}>
                        <Image source={{ uri: f }} style={{ width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: theme.border }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {Boolean(exame.hospital) && (
              <MiniMapaHospital hospital={exame.hospital} lat={exame.hospitalLat} lng={exame.hospitalLng} exibirBotaoRota />
            )}
          </ScrollView>

          <ButtonSecondary texto="Fechar" onPress={onFechar} icone={require('@/img/icons/x.svg')} />
        </View>
      </View>
    </Modal>
  );
}

function CampoFormulario({ label, placeholder, value, onChangeText, theme }: any) {
  return (
    <View style={{ gap: 6, marginBottom: 14 }}>
      <Text style={[tipografia.body, { color: theme.textPrimary }]}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.gray4}
        value={value}
        onChangeText={onChangeText}
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
        <Text style={{ fontSize: 15, marginTop: 1 }}>{icon}</Text>
      ) : (
        <Image source={icon} style={{ width: 18, height: 18, marginTop: 2 }} resizeMode="contain" />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 1 }}>{label}</Text>
        <Text style={{ fontSize: 13, color: theme.textPrimary, fontWeight: '600' }}>{value || '—'}</Text>
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

function ModalSeletorData({ visivel, onFechar, onConfirmar, titulo }: { visivel: boolean; onFechar: () => void; onConfirmar: (data: string) => void; titulo: string }) {
  const { theme } = useTheme();
  const [dataAtual, setDataAtual] = React.useState(new Date());

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
      <View style={styles.modalCalendarioOverlay}>
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