import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonWhite from '@/components/Buttons/ButtonWhite';
import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';

import { useTheme } from '@/context/ThemeContext';
import {
  useDocumentosController,
  FOLDER_COLORS,
  LIMITE_MB,
  type Pasta,
  type Documento,
} from '@/controllers/useDocumentosController';
import { styles } from '../../styles/app/(user)/documentos';

export default function DocumentosScreen() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 768;

  const { theme } = useTheme();

  const {
    searchText,
    setSearchText,
    pastas,
    documentos,
    documentosFiltrados,
    isLoading,
    isFetching,
    baixandoZip,
    modalPastaVisible,
    setModalPastaVisible,
    modalEditPastaVisible,
    setModalEditPastaVisible,
    modalDocVisible,
    setModalDocVisible,
    docVisualizando,
    docEditando,
    pastaVisualizando,
    setPastaVisualizando,
    origemPastaId,
    setOrigemPastaId,
    novaPastaNome,
    setNovaPastaNome,
    novaPastaCor,
    setNovaPastaCor,
    editPastaNome,
    setEditPastaNome,
    editPastaCor,
    setEditPastaCor,
    novoDocNome,
    novoDocDescricao,
    setNovoDocDescricao,
    novoDocPastasSelecionadas,
    editNome,
    setEditNome,
    editDescricao,
    setEditDescricao,
    editDocPastasSelecionadas,
    fecharModalPasta,
    fecharModalDoc,
    baixarArquivo,
    baixarPastaZipada,
    handleCriarPasta,
    abrirEdicaoPasta,
    salvarEdicaoPasta,
    handleExcluirPasta,
    selecionarArquivo,
    handleSalvarDocumento,
    handleExcluirDocumento,
    abrirVisualizacaoDocumento,
    abrirEdicaoDocumento,
    fecharVisualizacaoDocumento,
    fecharEdicaoDocumento,
    salvarEdicaoDocumento,
    toggleNovaPastaSelection,
    toggleEditPastaSelection,
    getEstatisticasPasta,
  } = useDocumentosController();

  if (isFetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#FFB020" />
        <Text style={{ marginTop: 16, color: theme.textSecondary }}>Carregando seus documentos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />
      <ScrollView contentContainerStyle={[styles.contentContainer, isNarrow && { padding: 12 }]}>
        <View style={styles.header}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Documentos</Text>
          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Gerencie seus arquivos e pastas</Text>
        </View>

        <View style={[styles.searchRow, isNarrow && { flexDirection: 'column', gap: 12, width: '100%' }]}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                width: '100%',     // Garante que ocupe 100% da largura no mobile
                flex: isNarrow ? undefined : 1, // No desktop estica até o botão
                minWidth: 0,
              },
            ]}
          >
            <Ionicons name="search" size={20} color={theme.gray4} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary, flex: 1, minWidth: 0 }]}
              placeholder="Pesquisar documentos"
              placeholderTextColor={theme.gray4}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <ButtonPrimary
            onPress={() => setModalDocVisible(true)}
            texto="Armazenar documento"
            icone={require('@/img/icons/upload-01.svg')}
            style={isNarrow ? { width: '100%' } : { minWidth: 220 }}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Image source={require('@/img/icons/pastas.svg')} style={{ tintColor: theme.yellow6 }} />
            <Text style={[tipografia.body, { color: theme.textPrimary }]}>Pastas</Text>
          </View>
          <ButtonWhite
            icone={require('@/img/icons/add-01.svg')}
            onPress={() => setModalPastaVisible(true)}
            texto="Criar pasta"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.foldersContainer}>
          {pastas.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhuma pasta criada.</Text>
          ) : (
            pastas.map(pasta => {
              const stats = getEstatisticasPasta(pasta.id);
              return (
                <TouchableOpacity
                  key={pasta.id}
                  style={[styles.folderCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                  onPress={() => setPastaVisualizando(pasta)}
                >
                  <View style={styles.folderCardHeader}>
                    <View style={[styles.folderIconBg, { backgroundColor: `${pasta.cor}15` }]}>
                      <Image
                        source={require('@/img/icons/folder-01.svg')}
                        style={{ tintColor: pasta.cor, width: 24, height: 24 }}
                      />
                    </View>
                    <TouchableOpacity onPress={() => abrirEdicaoPasta(pasta, false)}>
                      <Image
                        source={require('@/img/icons/edit-02.svg')}
                        style={{ tintColor: theme.gray4, width: 16, height: 16 }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text style={[tipografia.body, { color: theme.textPrimary }]}>{pasta.nome}</Text>
                    <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                      {stats.qtd < 10 ? `0${stats.qtd}` : stats.qtd} arquivos • {stats.tamanhoMB} MB
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <View style={styles.sectionTitleRow}>
            <Image source={require('@/img/icons/docs.svg')} style={{ tintColor: theme.yellow6 }} />
            <Text style={[tipografia.body, { color: theme.textPrimary }]}>Documentos recentes</Text>
          </View>
        </View>

        <View style={styles.documentsList}>
          {documentosFiltrados.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum documento encontrado.</Text>
          ) : (
            documentosFiltrados.map(docItem => (
              <CardDocumentoItem
                key={docItem.id}
                d={docItem}
                isNarrow={isNarrow}
                pastas={pastas}
                theme={theme}
                onBaixar={() => baixarArquivo(docItem)}
                onVisualizar={() => abrirVisualizacaoDocumento(docItem, false)}
                onEditar={() => abrirEdicaoDocumento(docItem, false)}
                onExcluir={() => handleExcluirDocumento(docItem.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Visualizar Pasta */}
      <Modal
        visible={!!pastaVisualizando}
        animationType="slide"
        onRequestClose={() => setPastaVisualizando(null)}
      >
        <View style={[styles.container, { padding: isNarrow ? 16 : 32, backgroundColor: theme.bg }]}>
          <View
            style={[
              styles.modalHeader,
              isNarrow && { flexDirection: 'column', alignItems: 'flex-start', gap: 14 },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <TouchableOpacity onPress={() => setPastaVisualizando(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
              <Ionicons name="folder" size={28} color={pastaVisualizando?.cor} />
              <Text style={[styles.title, isNarrow && { fontSize: 20 }, { color: theme.textPrimary }]}>
                {pastaVisualizando?.nome}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <TouchableOpacity
                onPress={() => pastaVisualizando && baixarPastaZipada(pastaVisualizando)}
                disabled={baixandoZip}
                style={[styles.btnZipPasta, { opacity: baixandoZip ? 0.6 : 1, backgroundColor: theme.cardBg, borderColor: theme.border }]}
              >
                {baixandoZip ? (
                  <ActivityIndicator size="small" color={theme.textPrimary} />
                ) : (
                  <Ionicons name="archive-outline" size={20} color={theme.textPrimary} />
                )}
                <Text style={[tipografia.body, { fontWeight: '600', color: theme.textPrimary }]}>
                  {baixandoZip ? 'Compactando...' : 'Baixar Pasta (.zip)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pastaVisualizando && abrirEdicaoPasta(pastaVisualizando, true)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Image source={require('@/img/icons/edit-02.svg')} style={{ width: 20, height: 20, tintColor: theme.textSecondary }} />
                <Text style={[tipografia.body, { color: theme.textSecondary }]}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (pastaVisualizando?.id) {
                    handleExcluirPasta(pastaVisualizando.id);
                  }
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Image source={require('@/img/icons/delete-02.svg')} style={{ width: 20, height: 20, tintColor: '#FF4560' }} />
                <Text style={[tipografia.body, { color: '#FF4560', fontWeight: 'bold' }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ marginTop: 24 }}>
            <View style={styles.documentsList}>
              {documentos.filter(d => pastaVisualizando?.id && d.pastasIds.includes(pastaVisualizando.id)).length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Esta pasta está vazia.</Text>
              ) : (
                documentos
                  .filter(d => pastaVisualizando?.id && d.pastasIds.includes(pastaVisualizando.id))
                  .map(docItem => (
                    <CardDocumentoItem
                      key={docItem.id}
                      d={docItem}
                      isNarrow={isNarrow}
                      pastas={pastas}
                      theme={theme}
                      onBaixar={() => baixarArquivo(docItem)}
                      onVisualizar={() => abrirVisualizacaoDocumento(docItem, true)}
                      onEditar={() => abrirEdicaoDocumento(docItem, true)}
                      onExcluir={() => handleExcluirDocumento(docItem.id)}
                    />
                  ))
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Criar Pasta */}
      <Modal
        visible={modalPastaVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharModalPasta}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isNarrow && { width: '92%', padding: 20 }, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nova Pasta</Text>
              <TouchableOpacity onPress={fecharModalPasta}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Nome da Pasta</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Ex: Exames de Sangue"
              placeholderTextColor={theme.gray4}
              value={novaPastaNome}
              onChangeText={setNovaPastaNome}
            />
            <Text style={[styles.label, { color: theme.textPrimary }]}>Cor da Pasta</Text>
            <View style={styles.colorPickerContainer}>
              {FOLDER_COLORS.map(cor => (
                <TouchableOpacity
                  key={cor}
                  style={[styles.colorOption, { backgroundColor: cor }]}
                  onPress={() => setNovaPastaCor(cor)}
                >
                  {novaPastaCor === cor && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.yellow5 }]} onPress={handleCriarPasta} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.id === 'dark' ? '#000' : '#FFF' }]}>Criar Pasta</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Pasta */}
      <Modal
        visible={modalEditPastaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalEditPastaVisible(false);
          if (origemPastaId) {
            const p = pastas.find(item => item.id === origemPastaId);
            if (p) setPastaVisualizando(p);
            setOrigemPastaId(null);
          }
        }}
      >
        <View style={[styles.modalOverlay, { zIndex: 10000, elevation: 10000 }]}>
          <View style={[styles.modalContent, isNarrow && { width: '92%', padding: 20 }, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Editar Pasta</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalEditPastaVisible(false);
                  if (origemPastaId) {
                    const p = pastas.find(item => item.id === origemPastaId);
                    if (p) setPastaVisualizando(p);
                    setOrigemPastaId(null);
                  }
                }}
              >
                <Image source={require('@/img/icons/x.svg')} style={{ tintColor: theme.textPrimary }} />
              </TouchableOpacity>
            </View>
            <Text style={[tipografia.body, { color: theme.textPrimary }]}>Novo Nome</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} value={editPastaNome} onChangeText={setEditPastaNome} />
            <Text style={[tipografia.body, { color: theme.textPrimary }]}>Nova Cor</Text>
            <View style={styles.colorPickerContainer}>
              {FOLDER_COLORS.map(cor => (
                <TouchableOpacity
                  key={cor}
                  style={[styles.colorOption, { backgroundColor: cor }]}
                  onPress={() => setEditPastaCor(cor)}
                >
                  {editPastaCor === cor && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </View>
            <ButtonPrimary texto="Salvar Alterações" onPress={salvarEdicaoPasta} />
          </View>
        </View>
      </Modal>

      {/* Modal Armazenar Documento */}
      <Modal
        visible={modalDocVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharModalDoc}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isNarrow && { width: '92%', padding: 20 }, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Armazenar Documento</Text>
              <TouchableOpacity onPress={fecharModalDoc}>
                <Image source={require('@/img/icons/x.svg')} style={{ tintColor: theme.textPrimary }} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View style={styles.items}>
                <View style={styles.labelRow}>
                  <Text style={[tipografia.body, { color: theme.textPrimary }]}>Arquivo</Text>
                  <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Máx. {LIMITE_MB} MB</Text>
                </View>

                <TouchableOpacity style={[styles.filePickerButton, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={selecionarArquivo}>
                  <Image source={require('@/img/icons/anexarArquivo.svg')} style={{ width: 32, height: 32, tintColor: theme.yellow6 }} />
                  <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]} numberOfLines={1}>
                    {novoDocNome ? novoDocNome : 'Clique para buscar no computador'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.items}>
                <Text style={[tipografia.body, { color: theme.textPrimary }]}>Descrição (opcional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                  placeholder="Ex: Receita do mês de Maio"
                  placeholderTextColor={theme.gray4}
                  value={novoDocDescricao}
                  onChangeText={setNovoDocDescricao}
                />
              </View>

              {pastas.length > 0 && (
                <View style={styles.items}>
                  <Text style={[tipografia.body, { color: theme.textPrimary }]}>Atribuir a pastas (opcional)</Text>
                  <ScrollView style={styles.folderSelectList}>
                    {pastas.map(pasta => (
                      <TouchableOpacity
                        key={pasta.id}
                        style={[styles.folderSelectItem, { borderColor: theme.border }]}
                        onPress={() => toggleNovaPastaSelection(pasta.id)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            novoDocPastasSelecionadas.includes(pasta.id) && [styles.checkboxSelected, { backgroundColor: theme.yellow5 }],
                          ]}
                        >
                          {novoDocPastasSelecionadas.includes(pasta.id) && (
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          )}
                        </View>
                        <View style={[styles.folderSelectIcon, { backgroundColor: `${pasta.cor}20` }]}>
                          <Image source={require('@/img/icons/folder-01.svg')} style={{ tintColor: pasta.cor }} />
                        </View>
                        <Text style={[tipografia.body, { color: theme.textPrimary }]}>{pasta.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <ButtonPrimary texto="Salvar Documento" onPress={handleSalvarDocumento} />
          </View>
        </View>
      </Modal>

      {/* Modal Edição Documento */}
      <Modal
        visible={!!docEditando}
        transparent
        animationType="fade"
        onRequestClose={fecharEdicaoDocumento}
      >
        <View style={[styles.modalOverlay, { zIndex: 10000, elevation: 10000 }]}>
          <View style={[styles.modalContent, isNarrow && { width: '92%', padding: 20 }, { backgroundColor: theme.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Editar Documento</Text>
              <TouchableOpacity onPress={fecharEdicaoDocumento}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Nome do Arquivo</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} value={editNome} onChangeText={setEditNome} />
            <Text style={[styles.label, { color: theme.textPrimary }]}>Descrição</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]} value={editDescricao} onChangeText={setEditDescricao} />

            {pastas.length > 0 && (
              <>
                <Text style={[styles.label, { color: theme.textPrimary }]}>Mover entre Pastas</Text>
                <ScrollView style={styles.folderSelectList}>
                  {pastas.map(pasta => (
                    <TouchableOpacity
                      key={pasta.id}
                      style={[styles.folderSelectItem, { borderColor: theme.border }]}
                      onPress={() => toggleEditPastaSelection(pasta.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          editDocPastasSelecionadas.includes(pasta.id) && [styles.checkboxSelected, { backgroundColor: theme.yellow5 }],
                        ]}
                      >
                        {editDocPastasSelecionadas.includes(pasta.id) && (
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        )}
                      </View>
                      <View style={[styles.folderSelectIcon, { backgroundColor: `${pasta.cor}20` }]}>
                        <Ionicons name="folder" size={16} color={pasta.cor} />
                      </View>
                      <Text style={{ color: theme.textPrimary }}>{pasta.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.yellow5 }]}
              onPress={salvarEdicaoDocumento}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.id === 'dark' ? '#000' : '#FFF' }]}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Pré-visualização Documento */}
      <Modal
        visible={!!docVisualizando}
        transparent
        animationType="fade"
        onRequestClose={fecharVisualizacaoDocumento}
      >
        <View style={[styles.modalOverlay, { zIndex: 10000, elevation: 10000 }]}>
          <View
            style={[
              styles.modalContent,
              {
                width: isNarrow ? '96%' : '80%',
                height: '80%',
                padding: 0,
                overflow: 'hidden',
                backgroundColor: theme.cardBg,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { padding: 16, backgroundColor: theme.cardBg, borderBottomWidth: 1, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { fontSize: 18, flex: 1, color: theme.textPrimary }]} numberOfLines={1}>
                {docVisualizando?.nome}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <TouchableOpacity
                  onPress={() => docVisualizando && baixarArquivo(docVisualizando)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: theme.inputBg,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="download-outline" size={18} color={theme.textPrimary} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textPrimary }}>Baixar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={fecharVisualizacaoDocumento}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.previewContainer}>
              {docVisualizando?.conteudoBase64 ? (
                docVisualizando.extensao === 'PDF' && Platform.OS === 'web' ? (
                  <iframe
                    src={docVisualizando.conteudoBase64}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Preview"
                  />
                ) : (
                  <Image
                    source={{ uri: docVisualizando.conteudoBase64 }}
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  />
                )
              ) : (
                <Text style={{ color: theme.textSecondary }}>Conteúdo não disponível.</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CardDocumentoItem({
  d,
  isNarrow,
  pastas,
  theme,
  onBaixar,
  onVisualizar,
  onEditar,
  onExcluir,
}: {
  d: Documento;
  isNarrow: boolean;
  pastas: Pasta[];
  theme: any;
  onBaixar: () => void;
  onVisualizar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const isImagem = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(d.extensao?.toUpperCase());

  return (
    <View style={styles.documentCardWrapper}>
      <View style={[styles.documentCard, isNarrow && styles.documentCardMobile, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.docInfoContainer}>
          <View style={[styles.docTypeBadge, { backgroundColor: theme.inputBg }]}>
            {isImagem && d.conteudoBase64 ? (
              <Image
                source={{ uri: d.conteudoBase64 }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 6,
                  resizeMode: 'cover',
                }}
              />
            ) : (
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>{d.extensao}</Text>
            )}
          </View>

          <View style={styles.docNameDesc}>
            <Text style={[tipografia.body, { color: theme.textPrimary }]} numberOfLines={1}>
              {d.nome}
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]} numberOfLines={1}>
              {d.descricao || 'Sem descrição'}
            </Text>
          </View>
        </View>

        {!isNarrow && (
          <>
            <View style={styles.docColumn}>
              <Text style={[tipografia.body, { color: theme.textPrimary }]}>Tamanho</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>{d.tamanhoMB} MB</Text>
            </View>

            <View style={styles.docColumn}>
              <Text style={[tipografia.body, { color: theme.textPrimary }]}>Última modificação</Text>
              <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>{d.dataModificacao}</Text>
            </View>
          </>
        )}

        <View style={[styles.docActionColumn, isNarrow && styles.docActionColumnMobile]}>
          <View style={styles.docActionsIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={onBaixar} accessibilityLabel="Baixar arquivo">
              <Ionicons name="download-outline" size={22} color={theme.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={onVisualizar}>
              <Image source={require('@/img/icons/view.svg')} style={{ width: 22, height: 22, tintColor: theme.textPrimary }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={onEditar}>
              <Image source={require('@/img/icons/edit-02.svg')} style={{ width: 22, height: 22, tintColor: theme.textPrimary }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={onExcluir}>
              <Image source={require('@/img/icons/delete-02.svg')} style={{ width: 22, height: 22, tintColor: '#FF4560' }} />
            </TouchableOpacity>
          </View>

          <View style={styles.colorIndicatorRow}>
            {d.pastasIds.length > 0 ? (
              d.pastasIds.map(pId => {
                const pastaCor = pastas.find(p => p.id === pId)?.cor || '#CCC';
                return (
                  <View
                    key={pId}
                    style={[styles.colorIndicatorLine, { backgroundColor: pastaCor }]}
                  />
                );
              })
            ) : (
              <View style={[styles.colorIndicatorLine, { backgroundColor: 'transparent' }]} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}