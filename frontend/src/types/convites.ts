export type PapelResponsavel = 'admin' | 'editor' | 'leitor';

export type ParentescoResponsavel =
  | 'mae'
  | 'pai'
  | 'padrasto'
  | 'madrasta'
  | 'avo'
  | 'cuidador'
  | 'outro';

export interface PermissaoResponsavel {
  parentesco: ParentescoResponsavel;
  papel: PapelResponsavel;
  nome: string;
  email: string;
  adicionadoEm?: any;
}

export interface ConviteResponsavel {
  id: string;
  filhoId: string;
  nomeFilho: string;
  criadoPorUid: string;
  nomeCriador: string;
  emailDestino: string;
  parentescoSugerido: ParentescoResponsavel;
  papel: PapelResponsavel;
  status: 'pendente' | 'aceito' | 'recusado' | 'cancelado';
  criadoEm: any;
}