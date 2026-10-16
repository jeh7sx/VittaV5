export type DadosCadastro = {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
};

export type CamposErro = Partial<
  Record<keyof DadosCadastro, string>
>;