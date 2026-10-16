import {
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import { DadosCadastro } from '../types/cadastro';
import { limparCPF } from '../utils/cadCpf';
import { auth, db } from './firebase';

export class CpfJaCadastradoError extends Error {
  constructor() {
    super('Este CPF já está cadastrado.');
    this.name = 'CpfJaCadastradoError';
  }
}

export async function cadastrarUsuario(
  dados: DadosCadastro,
): Promise<void> {
  const nome = dados.nome.trim();
  const email = dados.email.trim().toLowerCase();
  const cpf = limparCPF(dados.cpf);

  const cpfRef = doc(db, 'cpfs', cpf);
  const cpfSnapshot = await getDoc(cpfRef);

  if (cpfSnapshot.exists()) {
    throw new CpfJaCadastradoError();
  }

  const credencial = await createUserWithEmailAndPassword(
    auth,
    email,
    dados.senha,
  );

  const usuario = credencial.user;

  try {
    const batch = writeBatch(db);

    batch.set(doc(db, 'usuarios', usuario.uid), {
      uid: usuario.uid,
      nome,
      cpf,
      email,
      criadoEm: serverTimestamp(),
    });

    batch.set(doc(db, 'cpfs', cpf), {
      uid: usuario.uid,
      criadoEm: serverTimestamp(),
    });

    await batch.commit();
  } catch (erro) {
    try {
      await deleteUser(usuario);
    } catch (erroDelete) {
      console.error(
        'Erro ao remover usuário do Firebase Auth:',
        erroDelete,
      );
    }

    throw erro;
  }
}