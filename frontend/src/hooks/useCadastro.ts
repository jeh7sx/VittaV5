// ta no useAuth, mas não sei se vou usar

// import { useState } from 'react';

// import { Alert } from 'react-native';

// import { router } from 'expo-router';

// import { createUserWithEmailAndPassword, deleteUser, User } from 'firebase/auth';

// import { doc, getDoc, serverTimestamp, writeBatch} from 'firebase/firestore';

// import { auth, db } from '../services/firebase';

// import { formatarCPF, limparCPF } from '../utils/cadCpf';

// import { DadosCadastro , CamposErro } from '../types/cadastro';

// export function useCadastro() {
//   const [nome, setNome] = useState('');
//   const [cpf, setCpf] = useState('');
//   const [email, setEmail] = useState('');
//   const [senha, setSenha] = useState('');
//   const [confirmarSenha, setConfirmarSenha] = useState('');

//   const [mostrarSenha, setMostrarSenha] = useState(false);
//   const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
//     useState(false);

//   const [carregando, setCarregando] = useState(false);
//   const [erros, setErros] = useState<CamposErro>({});

//   function validarCampos(): boolean {
//     const novosErros: CamposErro = {};

//     const nomeFormatado = nome.trim();
//     const emailFormatado = email.trim().toLowerCase();
//     const cpfLimpo = limparCPF(cpf);

//     if (!nomeFormatado) {
//       novosErros.nome = 'Informe seu nome completo.';
//     }

//     if (!cpfLimpo) {
//       novosErros.cpf = 'Informe seu CPF.';
//     } else if (cpfLimpo.length !== 11) {
//       novosErros.cpf = 'CPF inválido. Digite os 11 números.';
//     }

//     if (!emailFormatado) {
//       novosErros.email = 'Informe seu email.';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormatado)) {
//       novosErros.email = 'Digite um email válido.';
//     }

//     if (!senha) {
//       novosErros.senha = 'Crie uma senha.';
//     } else if (senha.length < 6) {
//       novosErros.senha =
//         'A senha precisa ter pelo menos 6 caracteres.';
//     }

//     if (!confirmarSenha) {
//       novosErros.confirmarSenha = 'Confirme sua senha.';
//     } else if (senha !== confirmarSenha) {
//       novosErros.confirmarSenha = 'As senhas não coincidem.';
//     }

//     setErros(novosErros);

//     return Object.keys(novosErros).length === 0;
//   }

//   function limparErro(campo: keyof CamposErro) {
//     setErros((errosAtuais) => {
//       if (!errosAtuais[campo]) {
//         return errosAtuais;
//       }

//       return {
//         ...errosAtuais,
//         undefined,
//       };
//     });
//   }

//   async function cadastrar() {
//     if (carregando) {
//       return;
//     }

//     if (!validarCampos()) {
//       return;
//     }

//     let usuarioCriadoNoAuth: User | null = null;

//     try {
//       setCarregando(true);

//       const nomeFormatado = nome.trim();
//       const emailFormatado = email.trim().toLowerCase();
//       const cpfLimpo = limparCPF(cpf);

//       const cpfRef = doc(db, 'cpfs', cpfLimpo);
//       const cpfSnap = await getDoc(cpfRef);

//       if (cpfSnap.exists()) {
//         setErros((errosAtuais) => ({
//           ...errosAtuais,
//           cpf: 'Este CPF já está cadastrado.',
//         }));

//         return;
//       }

//       const credencial = await createUserWithEmailAndPassword(
//         auth,
//         emailFormatado,
//         senha,
//       );

//       usuarioCriadoNoAuth = credencial.user;

//       const uid = credencial.user.uid;
//       const batch = writeBatch(db);

//       batch.set(doc(db, 'usuarios', uid), {
//         uid,
//         nome: nomeFormatado,
//         cpf: cpfLimpo,
//         email: emailFormatado,
//         criadoEm: serverTimestamp(),
//       });

//       batch.set(doc(db, 'cpfs', cpfLimpo), {
//         uid,
//         criadoEm: serverTimestamp(),
//       });

//       try {
//         await batch.commit();
//       } catch (erroFirestore) {
//         console.error(
//           'Erro ao salvar dados no Firestore:',
//           erroFirestore,
//         );

//         try {
//           await deleteUser(credencial.user);
//           usuarioCriadoNoAuth = null;
//         } catch (erroDelete) {
//           console.error(
//             'Erro ao excluir usuário do Auth:',
//             erroDelete,
//           );
//         }

//         Alert.alert(
//           'Erro',
//           'Não foi possível concluir o cadastro. Tente novamente.',
//         );

//         return;
//       }

//       Alert.alert('Sucesso', 'Conta criada com sucesso!', [
//         {
//           text: 'Entrar',
//           onPress: () => router.replace('/login'),
//         },
//       ]);
//     } catch (erro: unknown) {
//       console.error('Erro no cadastro:', erro);

//       const codigo =
//         typeof erro === 'object' &&
//         erro !== null &&
//         'code' in erro &&
//         typeof erro.code === 'string'
//           ? erro.code
//           : undefined;

//       if (codigo === 'auth/email-already-in-use') {
//         setErros((errosAtuais) => ({
//           ...errosAtuais,
//           email: 'Este email já está cadastrado.',
//         }));

//         return;
//       }

//       if (codigo === 'auth/invalid-email') {
//         setErros((errosAtuais) => ({
//           ...errosAtuais,
//           email: 'Digite um email válido.',
//         }));

//         return;
//       }

//       if (codigo === 'auth/weak-password') {
//         setErros((errosAtuais) => ({
//           ...errosAtuais,
//           senha: 'A senha precisa ter pelo menos 6 caracteres.',
//         }));

//         return;
//       }

//       if (usuarioCriadoNoAuth) {
//         try {
//           await deleteUser(usuarioCriadoNoAuth);
//         } catch (erroDelete) {
//           console.error(
//             'Erro ao excluir usuário do Auth:',
//             erroDelete,
//           );
//         }
//       }

//       Alert.alert(
//         'Erro',
//         'Não foi possível criar a conta. Tente novamente.',
//       );
//     } finally {
//       setCarregando(false);
//     }
//   }

//   return {
//     nome,
//     setNome,

//     cpf,
//     setCpf,

//     email,
//     setEmail,

//     senha,
//     setSenha,

//     confirmarSenha,
//     setConfirmarSenha,

//     mostrarSenha,
//     setMostrarSenha,

//     mostrarConfirmarSenha,
//     setMostrarConfirmarSenha,

//     carregando,
//     erros,

//     limparErro,
//     cadastrar,
//   };
// }