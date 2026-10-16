export type UsuarioDashboard = {
  nome?: string;
  email?: string;
  cpf?: string;
  [chave: string]: unknown;
};

export type FilhoDashboard = {
  id: string;
  nome?: string;
  responsavelId?: string;
  [chave: string]: unknown;
};

export type ExameDashboard = {
  id: string;
  filhoId?: string;
  responsavelId?: string;

  titulo?: string;
  nomeFilho?: string;
  descricao?: string;
  dataExame?: string;

  nome?: string;
  tipo?: string;
  status?: string;
};

export type LogDashboard = {
  id: string;
  acao?: string;
  descricao?: string;
  criadoEm?: unknown;
  [chave: string]: unknown;
};

export type AvisoDashboard = {
  id: string;
  titulo?: string;
  mensagem?: string;
  responsavelId?: string;
  criadoEm?: unknown;
  [chave: string]: unknown;
};

export type StatusDia = 'hoje' | 'concluido' | 'agendado' | null;
