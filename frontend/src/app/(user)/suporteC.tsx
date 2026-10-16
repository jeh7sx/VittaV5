import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import Sidebar from '@/components/Sidebar';

// Botões, cores e tipografia
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonBlack from '@/components/Buttons/ButtonBlack';
import ButtonWhite from '@/components/Buttons/ButtonWhite';
import ButtonTertiary from '@/components/Buttons/ButtonTertiary';
// Importa as cores do sistema
import { colors } from '@/styles/colors';
// Importa tipografia
import { tipografia } from '@/styles/tipografia';

interface TicketUsuario {
  id: string;
  assunto: string;
  categoria: string;
  mensagem: string;
  respostaAdmin?: string;
  status: 'aberto' | 'em_andamento' | 'resolvido';
  criadoEm: string;
}

const CATEGORIAS = ['Dúvida no app', 'Problema com vacinas/exames', 'Erro na conta', 'Outros'];

export default function SuporteUsuario() {
  const [tickets, setTickets] = useState<TicketUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Formulário de Novo Chamado
  const [modalNovo, setModalNovo] = useState(false);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Visualização de Detalhes
  const [ticketSelecionado, setTicketSelecionado] = useState<TicketUsuario | null>(null);

  async function carregarMeusTickets() {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setCarregando(true);
      const q = query(
        collection(db, 'suporte'),
        where('usuarioId', '==', user.uid),
        orderBy('criadoEm', 'desc')
      );

      const snap = await getDocs(q).catch(async () => {
        // Fallback sem orderBy caso falte índice no Firestore
        const qSimples = query(collection(db, 'suporte'), where('usuarioId', '==', user.uid));
        return await getDocs(qSimples);
      });

      const lista: TicketUsuario[] = snap.docs.map((d) => {
        const data = d.data();
        let dt = 'Recentemente';
        if (data.criadoEm) {
          const dataObj = data.criadoEm.toDate ? data.criadoEm.toDate() : new Date(data.criadoEm);
          if (!isNaN(dataObj.getTime())) {
            dt = `${String(dataObj.getDate()).padStart(2, '0')}/${String(dataObj.getMonth() + 1).padStart(2, '0')}/${dataObj.getFullYear()}`;
          }
        }

        return {
          id: d.id,
          assunto: data.assunto || 'Sem assunto',
          categoria: data.categoria || 'Geral',
          mensagem: data.mensagem || '',
          respostaAdmin: data.respostaAdmin || '',
          status: data.status || 'aberto',
          criadoEm: dt,
        };
      });

      setTickets(lista);
    } catch (e) {
      console.error('Erro ao carregar tickets:', e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMeusTickets();
  }, []);

  async function enviarTicket() {
    const user = auth.currentUser;
    if (!user) return;

    if (!assunto.trim() || !mensagem.trim()) {
      Alert.alert('Campos vazios', 'Preencha o assunto e descreva o seu problema.');
      return;
    }

    try {
      setEnviando(true);

      // Resgata o nome cadastrado no Firestore
      let nomeUsuario = user.displayName || 'Usuário';
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists() && userDoc.data().nome) {
          nomeUsuario = userDoc.data().nome;
        }
      } catch (e) { }

      await addDoc(collection(db, 'suporte'), {
        usuarioId: user.uid,
        usuarioNome: nomeUsuario,
        usuarioEmail: user.email,
        categoria,
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
        status: 'aberto',
        respostaAdmin: '',
        criadoEm: new Date(),
      });

      Alert.alert('Enviado com sucesso!', 'Nossa equipe responderá sua solicitação em breve.');
      setModalNovo(false);
      setAssunto('');
      setMensagem('');
      carregarMeusTickets();
    } catch (e) {
      console.error('Erro ao enviar ticket:', e);
      Alert.alert('Erro', 'Não foi possível enviar sua mensagem.');
    } finally {
      setEnviando(false);
    }
  }

  function renderBadge(status: TicketUsuario['status']) {
    const configs = {
      aberto: { bg: '#FDECEC', cor: '#B00020', label: 'Enviado' },
      em_andamento: { bg: '#FFF8E1', cor: '#8A5B00', label: 'Em análise' },
      resolvido: { bg: '#DCF3E2', cor: '#1B7A3E', label: 'Respondido' },
    };
    const c = configs[status] || configs.aberto;

    return (
      <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: c.cor }}>{c.label}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, display: 'flex', flexDirection: 'row', minHeight: '100%', }}>
      {/* Header */}

      {/* <Sidebar /> */}
      <View style={{ flex: 1, padding: 24 }}>


        <View style={{ marginBottom: 24 }}>
          <Text style={tipografia.h2}>Suporte</Text>
          <Text style={tipografia.bodySecondary}>Estamos aqui para ajudar você e sua família</Text>
        </View>




        <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 32 }}>
          {/* Card de Ação Rápida */}
          <View style={{
            width: '50%',
            backgroundColor: '#FFF4D6',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: '#FCE7B8',
            gap: 32
          }}>
            {/* Textos */}
            <View style={{ gap: 0 }}>
              <Text style={[tipografia.h3, { color: colors.yellow9 }]}>Como podemos te ajudar?</Text>
              <Text style={[tipografia.body, { color: colors.yellow9 }]}>
                Tire dúvidas sobre medicamentos, vacinas, exames ou envie sugestões de melhoria.
              </Text>
            </View>
            {/* Botão para Abrir ticket */}
            <ButtonPrimary
              style={{ width: '100%' }}
              texto="Abrir ticket"
              onPress={() => setModalNovo(true)}
              icone={require('@/img/icons/add-01.svg')}
            />
          </View>
          <View style={{ gap: 8 }}>
            {/* Lista de Chamados do Usuário */}
            <Text style={[tipografia.h3, { fontWeight: '600' }]}>
              Meus Chamados ({tickets.length})
            </Text>

            {carregando ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#F7B500" />
              </View>
            ) : tickets.length === 0 ? (
              <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' }}>
                <Text style={tipografia.body}>Nenhum chamado aberto</Text>
                <Text style={tipografia.caption}>
                  Quando você tiver alguma dúvida ou problema, seus tickets aparecerão aqui.
                </Text>
              </View>
            ) : (
              tickets.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setTicketSelecionado(item)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24,
                    paddingHorizontal: 24,
                    paddingVertical: 32,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: colors.gray1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={tipografia.body}>{item.categoria} • {item.criadoEm}</Text>
                    {renderBadge(item.status)}
                  </View>

                  <Text style={tipografia.h3}>
                    {item.assunto}
                  </Text>
                  <Text style={tipografia.bodySecondary} numberOfLines={2}>
                    {item.mensagem}
                  </Text>

                  {item.respostaAdmin ? (
                    <View style={{ marginTop: 16, padding: 16, backgroundColor: '#E8F5E9', borderRadius: 24,  }}>
                      <Text style={[tipografia.body, {fontWeight: '600', color: '#1B7A3E' }]}>✅ Resposta da equipe disponível</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))
            )}
          </View>

        </ScrollView>

        {/* Modal Criar Chamado */}
        <Modal visible={modalNovo} animationType="slide" transparent onRequestClose={() => setModalNovo(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, maxHeight: '90%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A' }}>Novo Chamado</Text>
                <TouchableOpacity onPress={() => setModalNovo(false)}>
                  <Text style={{ fontSize: 18, color: '#888', fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Categorias */}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 8 }}>Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CATEGORIAS.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategoria(cat)}
                        style={{
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: categoria === cat ? '#FFF4D6' : '#F5F5F5',
                          borderWidth: 1,
                          borderColor: categoria === cat ? '#F7B500' : '#EAEAEA',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: categoria === cat ? '#8A5B00' : '#666' }}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Assunto */}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6 }}>Assunto</Text>
                <TextInput
                  value={assunto}
                  onChangeText={setAssunto}
                  placeholder="Ex: Não consigo cadastrar exame"
                  placeholderTextColor="#999"
                  style={{
                    backgroundColor: '#FAFAFA',
                    borderWidth: 1,
                    borderColor: '#EAEAEA',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    marginBottom: 14,
                  }}
                />

                {/* Mensagem */}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6 }}>Descrição detalhada</Text>
                <TextInput
                  value={mensagem}
                  onChangeText={setMensagem}
                  placeholder="Explique o que aconteceu para que possamos te ajudar melhor..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  style={{
                    backgroundColor: '#FAFAFA',
                    borderWidth: 1,
                    borderColor: '#EAEAEA',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    minHeight: 100,
                    textAlignVertical: 'top',
                    marginBottom: 20,
                  }}
                />

                <TouchableOpacity
                  onPress={enviarTicket}
                  disabled={enviando}
                  style={{
                    backgroundColor: '#F7B500',
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  {enviando ? (
                    <ActivityIndicator color="#1A1A1A" />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A' }}>Enviar Chamado</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal Visualizar Ticket e Resposta */}
        <Modal visible={ticketSelecionado !== null} animationType="slide" transparent onRequestClose={() => setTicketSelecionado(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, maxHeight: '85%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{ticketSelecionado?.assunto}</Text>
                  <Text style={{ fontSize: 12, color: '#888' }}>{ticketSelecionado?.categoria} • {ticketSelecionado?.criadoEm}</Text>
                </View>
                <TouchableOpacity onPress={() => setTicketSelecionado(null)}>
                  <Text style={{ fontSize: 18, color: '#888', fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Mensagem Enviada */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 4 }}>SUA SOLICITAÇÃO</Text>
                <View style={{ backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, color: '#333', lineHeight: 18 }}>{ticketSelecionado?.mensagem}</Text>
                </View>

                {/* Resposta do Suporte */}
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 4 }}>RESPOSTA DA EQUIPE</Text>
                <View style={{ backgroundColor: ticketSelecionado?.respostaAdmin ? '#FFFDF5' : '#F5F5F5', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: ticketSelecionado?.respostaAdmin ? '#FCE7B8' : '#EEE', marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, color: ticketSelecionado?.respostaAdmin ? '#1A1A1A' : '#777', lineHeight: 19 }}>
                    {ticketSelecionado?.respostaAdmin || 'Sua solicitação está na fila de atendimento. Em breve nossa equipe enviará uma resposta por aqui.'}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}