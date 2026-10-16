// Tipos usados nas páginas do painel administrativo (Dashboard, Usuários, Personalizar)

export type StatusUsuarioAdmin = 'ativo' | 'bloqueado';

export interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string;
  dataNascimento: string; // dd/mm/aaaa
  cargo: string;
  cpf: string;
  status: StatusUsuarioAdmin;
  fotoUri?: string | null;
  criadoEm?: string | null; // dd/mm/aaaa
}

export type PeriodoDashboard = '7dias' | '30dias' | '6meses' | '1ano';

export interface PontoSerie {
  rotulo: string;
  valor: number;
}

export interface IndicadoresDashboard {
  usuariosCadastrados: number;
  usuariosVariacaoPercentual: number;
  criancasCadastradas: number;
  criancasVariacaoPercentual: number;
}

export interface IndicadoresUsuarios {
  totalUsuarios: number;
  usuariosAtivos: number;
  novosEsteMes: number;
  bloqueados: number;
}

export type FiltroStatusUsuario = 'todos' | 'ativos' | 'bloqueados';

export type AcaoUsuarioAdmin = 'visualizar' | 'editar' | 'bloquear' | 'desbloquear';

export type AbaPersonalizacao = 'aparencia' | 'logo' | 'fonte' | 'preVisualizacao';

export type FonteSistema = 'Padrão (Sans)' | 'Serifada' | 'Arredondada' | 'Monoespaçada';

export interface TemaPersonalizacao {
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  fonte: FonteSistema;
  logoUri: string | null;
}