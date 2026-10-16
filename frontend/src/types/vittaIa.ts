export type TipoMensagem =
  | 'mensagem'
  | 'acao_exame'
  | 'acao_medicamento'
  | 'acao_consulta'
  | 'acao_suporte';

export type ModoIA = 'assistente' | 'suporte';

export interface SuporteData { // <-- Adicionado
  email?: string;
  assunto?: string;
  corpo?: string;
}

export interface MensagemIA {
  autor: 'usuario' | 'ia';
  texto: string;
  data?: Date | string;
  tipo?: TipoMensagem;
  dados?: ExameData | MedicamentoData | ConsultaData | SuporteData | null;
}

export interface ChatSession {
  id: string;
  titulo?: string;
  primeiraMensagem?: string;
  mensagens?: MensagemIA[];
  fixado?: boolean;
  criadoEm?: any;
  atualizadoEm?: any;
}

export interface MedicamentoData {
  id?: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  horario?: string;
  dataInicio?: string;
  dataTermino?: string;
  hospital?: string;
  instrucoes?: string;
  criadoPorIA?: boolean;
}

export interface ConsultaData {
  id?: string;
  consulta?: string;
  especialidade?: string;
  nomeMedico?: string;
  nomeDoutor?: string;
  hospital?: string;
  dataConsulta: string;
  horario?: string;
  descricao?: string;
  motivo?: string;
  criadoPorIA?: boolean;
}

export interface ExameData {
  id?: string;
  titulo: string;
  hospital?: string;
  dataExame: string;
  horario?: string;
  nomeDoutor?: string;
  descricao?: string;
  criadoPorIA?: boolean;
}

export interface SidebarIAProps {
  chats: ChatSession[];
  chatIdAtual: string;
  onNovoChat: () => void;
  onSelecionarChat: (chatId: string) => void;
  onAbrirBiblioteca: () => void;
  onAlternarFixarChat: (chatId: string) => void; // <-- Adicionado
  abaAtiva?: 'chat' | 'biblioteca';
}

export interface RespostaVittaIABackend {
  tipo: TipoMensagem;
  mensagem: string;
  dados?: any;
  erro?: string;
}