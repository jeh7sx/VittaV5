import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Filho,
  FormFilho,
  formatarData,
  formatarAltura,
  formatarPeso,
  idadeDetalhada,
  useFilhos,
} from '../../hooks/useFilhos';
import { useConvites } from '@/hooks/useConvites';
import { useTheme } from '@/context/ThemeContext';
import { ParentescoResponsavel } from '@/types/convites';

import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';
import ModalVisualizarImagem from '@/components/Modal/ModalVisualizarImagem';
import filhoIcon from '../../img/filho.svg';
import { styles } from '../../styles/app/(user)/filhos';
import { auth, db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const FORM_VAZIO: FormFilho = {
  nome: '',
  dataNascimento: '',
  tipoNeoplasia: '',
  altura: '',
  peso: '',
  fotoBase64: '',
};

export default function Filhos() {
  const { width } = useWindowDimensions();
  const mobile = width < 768;
  const tablet = width < 1050;

  const { theme } = useTheme();

  const {
    filhos,
    filhoAtual,
    carregando,
    salvando,
    modalCadastro,
    modalEditar,
    form,
    setForm,
    contadores,
    imc,
    imcInfo,
    selecionarFilho,
    abrirEdicao,
    salvarCadastro,
    salvarEdicao,
    escolherFoto,
    setModalCadastro,
    setModalEditar,
  } = useFilhos();

  const usuario = auth.currentUser;

  const {
    convitesRecebidos,
    convitesPendentesDoFilho,
    enviarConvite,
    cancelarConvite,
    aceitarConvite,
    recusarConvite,
    transferirTitularidade,
    removerResponsavel,
    enviando,
  } = useConvites(filhoAtual?.id);

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [modalConvidarAberto, setModalConvidarAberto] = useState(false);
  const [emailConvidado, setEmailConvidado] = useState('');
  const [parentescoEscolhido, setParentescoEscolhido] = useState<ParentescoResponsavel>('pai');

  const [responsavelSelecionado, setResponsavelSelecionado] = useState<{
    uid: string;
    nome: string;
    parentesco: string;
  } | null>(null);

  const [nomesResponsaveis, setNomesResponsaveis] = useState<Record<string, string>>({});

  const titularUid = filhoAtual?.responsavelId || filhoAtual?.responsaveisIds?.[0] || '';
  const souTitular = Boolean(usuario && usuario.uid === titularUid);

  const listaUidsResponsaveis: string[] = Array.from(
    new Set([
      ...(filhoAtual?.responsavelId ? [filhoAtual.responsavelId] : []),
      ...(filhoAtual?.responsaveisIds || []),
    ])
  );

  useEffect(() => {
    async function carregarNomes() {
      const mapa: Record<string, string> = {};
      for (const uid of listaUidsResponsaveis) {
        if (!uid) continue;
        try {
          const userSnap = await getDoc(doc(db, 'usuarios', uid));
          if (userSnap.exists()) {
            mapa[uid] = userSnap.data().nome || userSnap.data().email || 'Responsável';
          }
        } catch (e) {}
      }
      setNomesResponsaveis(mapa);
    }

    if (listaUidsResponsaveis.length > 0) {
      carregarNomes();
    }
  }, [filhoAtual?.id, listaUidsResponsaveis.join(',')]);

  async function handleDispararConvite() {
    if (!filhoAtual) return;
    if (!emailConvidado.trim()) {
      Alert.alert('Atenção', 'Informe o e-mail do outro responsável.');
      return;
    }

    await enviarConvite({
      filhoIdAlvo: filhoAtual.id,
      nomeFilho: filhoAtual.nome,
      emailDestino: emailConvidado.trim(),
      parentesco: parentescoEscolhido,
    });

    setEmailConvidado('');
    setModalConvidarAberto(false);
  }

  function abrirGerenciamento(uid: string) {
    if (!souTitular || uid === usuario?.uid) return;
    const perm = filhoAtual?.permissoesResponsaveis?.[uid];
    const nomeReal = nomesResponsaveis[uid] || perm?.nome || perm?.email || 'Co-responsável';
    setResponsavelSelecionado({
      uid,
      nome: nomeReal,
      parentesco: perm?.parentesco || 'Responsável',
    });
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.bg }}>
      <BotaoVittaIA />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: mobile ? 14 : 28 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Crianças e adolescentes</Text>
          {!carregando && filhoAtual && (
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
              Gerencie e tenha controle sobre a conta de
              <Text style={{ fontWeight: '600', color: theme.yellow5, paddingLeft: 2 }}>
                {' '}{filhoAtual.nome}
              </Text>
            </Text>
          )}
        </View>

        {carregando && <ActivityIndicator size="large" color="#F7B500" />}

        {!carregando && !filhoAtual && (
          <View style={[styles.vazio, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Image source={filhoIcon} style={{ width: 42, height: 42 }} />
            <Text style={{ color: theme.textSecondary, marginVertical: 12 }}>Nenhum filho cadastrado.</Text>
            <ButtonPrimary
              texto="Cadastrar filho"
              icone={require('@/img/icons/add-01.svg')}
              onPress={() => setModalCadastro(true)}
            />
          </View>
        )}

        {!carregando && filhoAtual && (
          <View style={{ flexDirection: tablet ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>
            {/* CARD PRINCIPAL */}
            <View style={[styles.cardPrincipal, { flex: 1, width: '100%', backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <View
                style={{
                  flexDirection: mobile ? 'column' : 'row',
                  alignItems: mobile ? 'stretch' : 'center',
                  gap: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
                  <TouchableOpacity
                    activeOpacity={filhoAtual.fotoBase64 ? 0.8 : 1}
                    onPress={() => {
                      if (filhoAtual.fotoBase64) {
                        setFotoPreview(filhoAtual.fotoBase64);
                      }
                    }}
                  >
                    <Avatar filho={filhoAtual} tamanho={mobile ? 72 : 96} theme={theme} />
                    {Boolean(filhoAtual.fotoBase64) && (
                      <Text
                        style={[
                          tipografia.caption,
                          { color: theme.yellow6, marginTop: 4, textAlign: 'center', fontSize: 11 },
                        ]}
                      >
                        Ampliar
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text numberOfLines={1} style={[tipografia.h2, { color: theme.textPrimary, fontSize: mobile ? 20 : 24 }]}>
                        {filhoAtual.nome}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: theme.yellow1, paddingHorizontal: 10, paddingVertical: 4 }]}>
                        <Image
                          source={require('@/img/icons/config.svg')}
                          style={{ width: 14, height: 14, tintColor: theme.yellow6 }}
                        />
                        <Text style={[tipografia.caption, { color: theme.yellow6, fontSize: 11 }]}>
                          {souTitular ? 'Titular' : 'Co-responsável'}
                        </Text>
                      </View>
                    </View>
                    <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: mobile ? 13 : 14 }]}>
                      {filhoAtual.tipoNeoplasia || 'Neoplasia não informada'}
                    </Text>
                    <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: mobile ? 12 : 13 }]}>
                      {idadeDetalhada(filhoAtual.dataNascimento)} | {filhoAtual.dataNascimento}
                    </Text>
                  </View>
                </View>

                <ButtonSecondary
                  texto="Editar"
                  onPress={() => abrirEdicao(filhoAtual)}
                  icone={require('@/img/icons/edit-02.svg')}
                  style={mobile ? { width: '100%', marginTop: 8 } : undefined}
                />
              </View>

              {/* SESSÃO: COPARENTALIDADE / RESPONSÁVEIS */}
              <View
                style={{
                  marginTop: 18,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              >
                <View
                  style={{
                    flexDirection: mobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: mobile ? 'flex-start' : 'center',
                    gap: mobile ? 10 : 0,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: theme.textPrimary }}>
                      👥 Responsáveis ({listaUidsResponsaveis.length})
                    </Text>
                    <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                      {souTitular
                        ? 'Você é o titular. Toque em um co-responsável para gerenciar.'
                        : 'Pessoas autorizadas a acompanhar os dados médicos'}
                    </Text>
                  </View>

                  {souTitular && (
                    <TouchableOpacity
                      onPress={() => setModalConvidarAberto(true)}
                      style={{
                        backgroundColor: theme.yellow1,
                        borderWidth: 1,
                        borderColor: theme.yellow5,
                        paddingVertical: 7,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        alignSelf: mobile ? 'flex-start' : 'auto',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.id === 'dark' ? '#FFF' : theme.yellow9 }}>
                        + Convidar Responsável
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Tags de Responsáveis */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {listaUidsResponsaveis.map((uid) => {
                    const perm = filhoAtual.permissoesResponsaveis?.[uid];
                    const ehVoce = uid === usuario?.uid;
                    const ehOTitular = uid === titularUid;
                    const nomeBanco = nomesResponsaveis[uid];

                    let rotulo = '';
                    if (ehVoce) {
                      rotulo = `Você (${ehOTitular ? 'Titular' : 'Co-responsável'})`;
                    } else if (ehOTitular) {
                      rotulo = `${nomeBanco || 'Titular'} (Titular)`;
                    } else {
                      rotulo = nomeBanco || perm?.nome || perm?.email || 'Co-responsável';
                    }

                    return (
                      <TouchableOpacity
                        key={uid}
                        activeOpacity={souTitular && !ehVoce ? 0.7 : 1}
                        onPress={() => abrirGerenciamento(uid)}
                        style={{
                          backgroundColor: ehOTitular ? (theme.id === 'dark' ? '#14301B' : '#E8F5E9') : theme.inputBg,
                          borderWidth: 1,
                          borderColor: ehOTitular ? (theme.id === 'dark' ? '#22543D' : '#C8E6C9') : theme.border,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: ehOTitular ? (theme.id === 'dark' ? '#4ADE80' : '#2E7D32') : theme.textPrimary,
                          }}
                        >
                          {rotulo}
                        </Text>
                        <Text style={{ fontSize: 10, color: theme.textSecondary }}>
                          ({ehOTitular ? 'titular' : perm?.parentesco || 'pai/mãe'})
                        </Text>
                        {souTitular && !ehVoce && (
                          <Text style={{ fontSize: 10, color: theme.yellow6, fontWeight: 'bold' }}>⚙️</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  {/* Convites pendentes */}
                  {convitesPendentesDoFilho.map((convite) => (
                    <View
                      key={convite.id}
                      style={{
                        backgroundColor: theme.inputBg,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: theme.yellow5,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: theme.yellow6, fontWeight: '600' }}>
                        ⏳ {convite.emailDestino} (Pendente)
                      </Text>
                      {souTitular && (
                        <TouchableOpacity onPress={() => cancelarConvite(convite.id)}>
                          <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: 'bold', marginLeft: 4 }}>
                            ✕ Cancelar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Cards de Contadores Responsivos */}
              <View
                style={{
                  flexDirection: mobile ? 'column' : 'row',
                  gap: 12,
                  marginTop: 24,
                  width: '100%',
                }}
              >
                <View style={{ flex: mobile ? undefined : 1, width: '100%' }}>
                  <Contador
                    icone={require('@/img/icons/medicamento.svg')}
                    corIcone={theme.Med}
                    corFundoIcone={theme.bgMed}
                    titulo="Medicamentos"
                    numero={contadores.medicamentos}
                    legenda="Ativos"
                    theme={theme}
                  />
                </View>
                <View style={{ flex: mobile ? undefined : 1, width: '100%' }}>
                  <Contador
                    icone={require('@/img/icons/stethoscope-02.svg')}
                    corIcone={theme.Consul}
                    corFundoIcone={theme.bgConsul}
                    titulo="Consultas"
                    numero={contadores.consultas}
                    legenda="Agendadas"
                    theme={theme}
                  />
                </View>
                <View style={{ flex: mobile ? undefined : 1, width: '100%' }}>
                  <Contador
                    icone={require('@/img/icons/microscope.svg')}
                    corIcone={theme.Exame}
                    corFundoIcone={theme.bgExame}
                    titulo="Exames"
                    numero={contadores.exames}
                    legenda="Agendados"
                    theme={theme}
                  />
                </View>
              </View>

              {/* Resumo de Saúde e IMC */}
              <View style={[styles.resumoSaude, { backgroundColor: theme.cardBg }]}>
                <View>
                  <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Resumo de saúde</Text>
                  <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Informações gerais para acompanhamento.</Text>
                </View>
                <View style={{ flexDirection: mobile ? 'column' : 'row', gap: 12, width: '100%' }}>
                  <Metrica
                    icone={require('@/img/icons/ruler.svg')}
                    titulo="Altura"
                    valor={filhoAtual.altura ? `${filhoAtual.altura} m` : '—'}
                    theme={theme}
                  />
                  <Metrica
                    icone={require('@/img/icons/weight.svg')}
                    titulo="Peso"
                    valor={filhoAtual.peso ? `${filhoAtual.peso} kg` : '—'}
                    theme={theme}
                  />
                  <Metrica
                    icone={require('@/img/icons/balance-scale.svg')}
                    titulo="IMC"
                    valor={imc}
                    detalhe={`Classificação: ${imcInfo.texto}`}
                    cor={imcInfo.cor}
                    theme={theme}
                  />
                </View>
              </View>
            </View>

            {/* LISTA LATERAL DIREITA DE CRIANÇAS CADASTRADAS */}
            <View style={[styles.lateral, { width: tablet ? '100%' : 320, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              <ButtonPrimary
                texto="Cadastrar filho"
                onPress={() => {
                  setForm(FORM_VAZIO);
                  setModalCadastro(true);
                }}
                icone={require('@/img/icons/add-01.svg')}
              />
              <View style={{ gap: 8 }}>
                <Text style={[tipografia.body, { color: theme.textPrimary, fontWeight: '700' }]}>Crianças/adolescentes cadastrados</Text>
                {filhos.map((filho) => {
                  const ativo = filho.id === filhoAtual.id;
                  return (
                    <TouchableOpacity
                      key={filho.id}
                      onPress={() => selecionarFilho(filho)}
                      style={[
                        styles.itemFilho,
                        { backgroundColor: theme.cardBg, borderColor: theme.border },
                        ativo && [styles.itemFilhoAtivo, { backgroundColor: theme.yellow1, borderColor: theme.yellow5 }],
                      ]}
                    >
                      <Avatar filho={filho} tamanho={48} theme={theme} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={[tipografia.body, { color: theme.textPrimary, fontWeight: '600' }]}>
                          {filho.nome}
                        </Text>
                        <Text
                          style={[
                            tipografia.caption,
                            { color: ativo ? theme.yellow6 : theme.gray4 },
                          ]}
                        >
                          {ativo ? 'Gerenciando' : 'Inativo'}
                        </Text>
                      </View>
                      <Image
                        source={require('@/img/icons/setaDireita.svg')}
                        style={{ width: 24, height: 24, tintColor: theme.gray4 }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* POPUP AUTOMÁTICO DE CONVITE PENDENTE PARA O CONVIDADO */}
      <Modal visible={convitesRecebidos.length > 0} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { width: '100%', maxWidth: 440, padding: 24, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            {convitesRecebidos[0] && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 32 }}>📬</Text>
                  <Text style={[tipografia.h2, { textAlign: 'center', marginTop: 8, color: theme.textPrimary }]}>
                    Convite de Acesso
                  </Text>
                </View>

                <Text style={[tipografia.body, { textAlign: 'center', color: theme.textSecondary }]}>
                  <Text style={{ fontWeight: '800', color: theme.textPrimary }}>
                    {convitesRecebidos[0].nomeCriador || 'O titular'}
                  </Text>{' '}
                  convidou você para acompanhar os cuidados de{' '}
                  <Text style={{ fontWeight: '800', color: theme.yellow6 }}>
                    {convitesRecebidos[0].nomeFilho}
                  </Text>{' '}
                  como {convitesRecebidos[0].parentescoSugerido.toUpperCase()}.
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 18 }}>
                  <ButtonSecondary
                    texto="Recusar"
                    onPress={() => recusarConvite(convitesRecebidos[0].id)}
                    style={{ width: '48%' }}
                  />
                  <ButtonPrimary
                    texto="Aceitar Acesso"
                    onPress={() => aceitarConvite(convitesRecebidos[0])}
                    style={{ width: '48%' }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL GERENCIAR CO-RESPONSÁVEL (TITULAR) */}
      <Modal
        visible={responsavelSelecionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setResponsavelSelecionado(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { width: '100%', maxWidth: 440, padding: 22, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Gerenciar Responsável</Text>
              <TouchableOpacity onPress={() => setResponsavelSelecionado(null)}>
                <Image source={require('@/img/icons/x.svg')} style={{ tintColor: theme.textPrimary }} />
              </TouchableOpacity>
            </View>

            <View style={{ marginVertical: 8 }}>
              <Text style={[tipografia.body, { fontWeight: '700', color: theme.textPrimary }]}>
                {responsavelSelecionado?.nome}
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                Parentesco: {responsavelSelecionado?.parentesco}
              </Text>
            </View>

            <View style={{ gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (!filhoAtual || !responsavelSelecionado || !usuario) return;
                  const conf = Platform.OS === 'web'
                    ? window.confirm(`Deseja passar a titularidade de ${filhoAtual.nome} para ${responsavelSelecionado.nome}? Você continuará com acesso total como co-responsável.`)
                    : true;
                  if (conf) {
                    await transferirTitularidade(filhoAtual.id, responsavelSelecionado.uid, usuario.uid);
                    setResponsavelSelecionado(null);
                  }
                }}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: theme.yellow1,
                  borderWidth: 1,
                  borderColor: theme.yellow5,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.id === 'dark' ? '#FFF' : theme.yellow9 }}>
                  👑 Passar Titularidade
                </Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                  O usuário passará a ser o titular. Você continuará tendo acesso completo ao dependente como co-responsável.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (!filhoAtual || !responsavelSelecionado) return;
                  const conf = Platform.OS === 'web'
                    ? window.confirm(`Remover o acesso de ${responsavelSelecionado.nome}?`)
                    : true;
                  if (conf) {
                    await removerResponsavel(filhoAtual.id, responsavelSelecionado.uid);
                    setResponsavelSelecionado(null);
                  }
                }}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: '#FEF2F2',
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#B91C1C' }}>
                  🗑️ Remover Responsável
                </Text>
                <Text style={{ fontSize: 11, color: '#7F1D1D', marginTop: 2 }}>
                  A criança deixará de aparecer na conta deste usuário.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONVIDAR RESPONSÁVEL */}
      <Modal
        visible={modalConvidarAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConvidarAberto(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modal, { width: '100%', maxWidth: 460, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Convidar Responsável</Text>
              <TouchableOpacity onPress={() => setModalConvidarAberto(false)}>
                <Image source={require('@/img/icons/x.svg')} style={{ tintColor: theme.textPrimary }} />
              </TouchableOpacity>
            </View>

            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
              Compartilhe o acompanhamento de{' '}
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{filhoAtual?.nome}</Text> com o pai, mãe ou cuidador.
            </Text>

            <View style={{ marginTop: 6 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary }]}>E-mail do responsável</Text>
              <TextInput
                value={emailConvidado}
                onChangeText={setEmailConvidado}
                placeholder="exemplo@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.gray4}
                style={[styles.input, { marginTop: 6, backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
              />
            </View>

            <View style={{ marginTop: 6 }}>
              <Text style={[tipografia.body, { color: theme.textPrimary }]}>Grau de parentesco</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {(['pai', 'mae', 'padrasto', 'madrasta', 'avo', 'cuidador'] as ParentescoResponsavel[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setParentescoEscolhido(p)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: parentescoEscolhido === p ? theme.yellow6 : theme.border,
                      backgroundColor: parentescoEscolhido === p ? theme.yellow1 : theme.inputBg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: parentescoEscolhido === p ? (theme.id === 'dark' ? '#FFF' : theme.yellow9) : theme.gray4,
                      }}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 14 }}>
              <ButtonSecondary
                texto="Cancelar"
                onPress={() => setModalConvidarAberto(false)}
                icone={require('@/img/icons/x.svg')}
                style={{ width: '48%' }}
              />
              <ButtonPrimary
                texto={enviando ? 'Enviando...' : 'Enviar convite'}
                onPress={handleDispararConvite}
                icone={require('@/img/icons/save.svg')}
                style={{ width: '48%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Cadastro */}
      <ModalFilho
        visible={modalCadastro}
        titulo="Cadastre uma "
        destaque="Criança/Adolescente"
        form={form}
        setForm={setForm}
        theme={theme}
        salvar={salvarCadastro}
        cancelar={() => {
          setModalCadastro(false);
          setForm(FORM_VAZIO);
        }}
        escolherFoto={escolherFoto}
        salvando={salvando}
      />

      {/* Modal de Edição */}
      <ModalFilho
        visible={modalEditar}
        titulo="Editar "
        destaque="Criança/Adolescente"
        form={form}
        setForm={setForm}
        theme={theme}
        salvar={salvarEdicao}
        cancelar={() => {
          setModalEditar(false);
          setForm(FORM_VAZIO);
        }}
        escolherFoto={escolherFoto}
        salvando={salvando}
      />

      <ModalVisualizarImagem
        imagemUri={fotoPreview}
        nomeArquivo={
          filhoAtual
            ? `perfil-${filhoAtual.nome.toLowerCase().replace(/\s+/g, '-')}`
            : 'perfil-crianca'
        }
        onClose={() => setFotoPreview(null)}
      />
    </View>
  );
}

function Avatar({ filho, tamanho, theme }: { filho: Filho; tamanho: number; theme: any }) {
  return (
    <View
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        overflow: 'hidden',
        backgroundColor: theme.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {filho.fotoBase64 ? (
        <Image source={{ uri: filho.fotoBase64 }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <Image source={filhoIcon} style={{ width: tamanho * 0.48, height: tamanho * 0.48 }} />
      )}
    </View>
  );
}

function Contador({ icone, corIcone, corFundoIcone, titulo, numero, legenda, theme }: any) {
  return (
    <View style={[styles.resumoContadores, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={[styles.iconeEscuro, { backgroundColor: corFundoIcone }]}>
        <Image source={icone} style={{ width: 22, height: 22, tintColor: corIcone }} />
      </View>
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'column', gap: 4 }}>
        <Text numberOfLines={1} style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: 13 }]}>{titulo}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[tipografia.h3, { color: theme.textPrimary, fontSize: 20 }]}>{String(numero).padStart(2, '0')}</Text>
          <Text numberOfLines={1} style={[tipografia.body, { color: theme.textPrimary, fontSize: 14 }]}>{legenda}</Text>
        </View>
      </View>
    </View>
  );
}

function Metrica({ icone, titulo, valor, detalhe, cor, theme }: any) {
  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        minWidth: 0,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.cardBg,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Image source={icone} style={{ width: 22, height: 22, tintColor: theme.yellow6 }} />
        <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>{titulo}</Text>
      </View>
      <Text style={[tipografia.h3, { color: theme.textPrimary, fontSize: 20 }]}>{valor}</Text>
      {detalhe && <Text style={[tipografia.caption, { color: cor }]}>{detalhe}</Text>}
    </View>
  );
}

function ModalFilho({
  visible,
  titulo,
  destaque,
  form,
  setForm,
  theme,
  salvar,
  cancelar,
  escolherFoto,
  salvando,
}: any) {
  const alterar = (campo: keyof FormFilho, valor: string) =>
    setForm((p: FormFilho) => ({ ...p, [campo]: valor }));

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={cancelar}>
      <View style={styles.overlay}>
        <ScrollView
          style={{ width: '100%', maxWidth: 520 }}
          contentContainerStyle={{ paddingVertical: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.modal, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
            <Text style={[tipografia.h2, { color: theme.textPrimary }]}>
              {titulo}
              {destaque}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity onPress={escolherFoto} style={[styles.fotoForm, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                {form.fotoBase64 ? (
                  <Image source={{ uri: form.fotoBase64 }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Image
                    source={require('@/img/icons/camera-add-01.svg')}
                    style={{ width: 28, height: 28, tintColor: theme.gray4 }}
                  />
                )}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Toque para adicionar uma foto</Text>
                <Text style={[tipografia.caption, { color: theme.gray4, marginTop: 2 }]}>
                  Máximo 0.8 MB (formatos JPG ou PNG)
                </Text>
              </View>
            </View>

            <Campo
              label="Nome"
              value={form.nome}
              onChangeText={(v: string) => alterar('nome', v)}
              placeholder="Nome completo"
              theme={theme}
            />
            <Campo
              label="Data de nascimento"
              value={form.dataNascimento}
              onChangeText={(v: string) => alterar('dataNascimento', formatarData(v))}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              theme={theme}
            />
            <Campo
              label="Tipo de neoplasia"
              value={form.tipoNeoplasia}
              onChangeText={(v: string) => alterar('tipoNeoplasia', v)}
              placeholder="Ex: Leucemia"
              theme={theme}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Campo
                  label="Altura (metros)"
                  value={form.altura}
                  onChangeText={(v: string) => alterar('altura', formatarAltura(v))}
                  placeholder="Ex: 1.32"
                  keyboardType="numeric"
                  maxLength={4}
                  theme={theme}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Campo
                  label="Peso (kg)"
                  value={form.peso}
                  onChangeText={(v: string) => alterar('peso', formatarPeso(v))}
                  placeholder="Ex: 28.5"
                  keyboardType="numeric"
                  maxLength={6}
                  theme={theme}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
              <ButtonSecondary
                texto="Cancelar"
                onPress={cancelar}
                icone={require('@/img/icons/x.svg')}
                style={{ width: '48%' }}
              />
              <ButtonPrimary
                texto={
                  salvando
                    ? 'Salvando...'
                    : titulo === 'Editar '
                    ? 'Salvar alterações'
                    : 'Cadastrar'
                }
                onPress={salvar}
                icone={require('@/img/icons/save.svg')}
                style={{ width: '48%' }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Campo({ label, theme, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[tipografia.body, { color: theme.textPrimary }]}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.gray4}
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
      />
    </View>
  );
}