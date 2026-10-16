import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Platform,
} from 'react-native';

import { auth } from '../services/firebase';

function validarEmail(email: string): boolean {
  const formatoEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return formatoEmail.test(email);
}

function exibirAlerta(
  titulo: string,
  mensagem: string,
) {
  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined'
  ) {
    window.alert(`${titulo}\n\n${mensagem}`);
    return;
  }

  Alert.alert(titulo, mensagem);
}

function obterMensagemErro(
  erro: unknown,
): string {
  if (!(erro instanceof FirebaseError)) {
    return 'Não foi possível enviar o e-mail. Tente novamente.';
  }

  switch (erro.code) {
    case 'auth/invalid-email':
      return 'O endereço de e-mail informado é inválido.';

    case 'auth/missing-email':
      return 'Informe seu endereço de e-mail.';

    case 'auth/too-many-requests':
      return 'Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.';

    case 'auth/network-request-failed':
      return 'Não foi possível conectar. Verifique sua internet.';

    case 'auth/user-disabled':
      return 'Esta conta está desativada.';

    default:
      return `Não foi possível enviar o e-mail. Código: ${erro.code}`;
  }
}

export function useSenha() {
  const [enviandoEmail, setEnviandoEmail] =
    useState(false);

  /*
   * Evita chamadas repetidas antes de o React
   * atualizar o estado enviandoEmail.
   */
  const envioEmAndamento = useRef(false);

  const enviarRedefinicaoSenha = useCallback(
    async (email: string): Promise<boolean> => {
      console.log(
        '[useSenha] Função executada. E-mail recebido:',
        email,
      );

      const emailFormatado = email
        .trim()
        .toLowerCase();

      console.log(
        '[useSenha] E-mail formatado:',
        emailFormatado,
      );

      if (!emailFormatado) {
        exibirAlerta(
          'E-mail obrigatório',
          'Informe o e-mail utilizado no cadastro.',
        );

        return false;
      }

      if (!validarEmail(emailFormatado)) {
        exibirAlerta(
          'E-mail inválido',
          'Informe um endereço de e-mail válido.',
        );

        return false;
      }

      if (envioEmAndamento.current) {
        console.log(
          '[useSenha] Já existe um envio em andamento.',
        );

        return false;
      }

      try {
        envioEmAndamento.current = true;
        setEnviandoEmail(true);

        console.log(
          '[useSenha] Chamando sendPasswordResetEmail...',
        );

        await sendPasswordResetEmail(
          auth,
          emailFormatado,
        );

        console.log(
          '[useSenha] Solicitação enviada com sucesso.',
        );

        exibirAlerta(
          'Verifique seu e-mail',
          'Se existir uma conta vinculada ao endereço informado, você receberá as instruções para redefinir sua senha.',
        );

        return true;
      } catch (erro: unknown) {
        console.error(
          '[useSenha] Erro completo:',
          erro,
        );

        if (erro instanceof FirebaseError) {
          console.error(
            '[useSenha] Código Firebase:',
            erro.code,
          );

          console.error(
            '[useSenha] Mensagem Firebase:',
            erro.message,
          );
        }

        exibirAlerta(
          'Não foi possível enviar',
          obterMensagemErro(erro),
        );

        return false;
      } finally {
        envioEmAndamento.current = false;
        setEnviandoEmail(false);
      }
    },
    [],
  );

  return {
    enviandoEmail,
    enviarRedefinicaoSenha,
  };
}