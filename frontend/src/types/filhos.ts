import { TextInputProps } from 'react-native';

export type Filho = {
  id: string;
  nome: string;
  idade: number;
  dataNascimento: string;
  tipoNeoplasia: string;
  responsavelId: string;
  altura: string;
  peso: string;
  fotoBase64: string;
};

type FormFilho = Omit<Filho, 'id' | 'idade' | 'responsavelId'>;

export type FilhoCadastro = {
  nome: string;
  dataNascimento: string;
  tipoNeoplasia: string;
};

export type CadastroFilhoProps = {
  /** Chamado depois que todos os filhos forem cadastrados. */
  onConcluir?: (filhosIds: string[]) => void;
  /** Útil quando o componente for colocado dentro de um Modal. */
  onCancelar?: () => void;
  /** Exibe o botão Cancelar quando usado dentro de outra tela/modal. */
  mostrarCancelar?: boolean;
};

export type CampoProps = TextInputProps & {
  label: string;
};