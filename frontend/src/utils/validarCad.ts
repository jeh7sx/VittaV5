import {
  CamposErro,
  DadosCadastro,
} from '../types/cadastro';

import { limparCPF } from './cadCpf';

export function validarCadastro(
  dados: DadosCadastro,
): CamposErro {
  const erros: CamposErro = {};

  const nome = dados.nome.trim();
  const cpf = limparCPF(dados.cpf);
  const email = dados.email.trim().toLowerCase();

  if (!nome) {
    erros.nome = 'Informe seu nome completo.';
  }

  if (!cpf) {
    erros.cpf = 'Informe seu CPF.';
  } else if (cpf.length !== 11) {
    erros.cpf = 'CPF inválido. Digite os 11 números.';
  }

  if (!email) {
    erros.email = 'Informe seu email.';
  } else if (!validarEmail(email)) {
    erros.email = 'Digite um email válido.';
  }

  if (!dados.senha) {
    erros.senha = 'Crie uma senha.';
  } else if (dados.senha.length < 6) {
    erros.senha =
      'A senha precisa ter pelo menos 6 caracteres.';
  }

  if (!dados.confirmarSenha) {
    erros.confirmarSenha = 'Confirme sua senha.';
  } else if (dados.senha !== dados.confirmarSenha) {
    erros.confirmarSenha = 'As senhas não coincidem.';
  }

  return erros;
}

function validarEmail(email: string): boolean {
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return formatoEmail.test(email);
}