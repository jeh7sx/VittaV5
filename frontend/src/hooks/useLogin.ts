// ta no useAuth, mas não sei se vou usar

// import { useState } from 'react';

// import { Alert } from 'react-native';
// import { router } from 'expo-router';

// import { signInWithEmailAndPassword } from 'firebase/auth';

// import {
//   collection,
//   getDocs,
//   query,
//   where,
// } from 'firebase/firestore';

// import { auth, db } from '../services/firebase';
// import { registrarLog } from '../utils/logs';
// import { limparCPF } from '../utils/cadCpf';

// export function useLogin() {
//   const [login, setLogin] = useState('');
//   const [senha, setSenha] = useState('');
//   const [mostrarSenha, setMostrarSenha] = useState(false);
//   const [carregando, setCarregando] = useState(false);

//   async function entrar() {
//     if (carregando) {
//       return;
//     }

//     const loginFormatado = login.trim();

//     if (!loginFormatado || !senha) {
//       Alert.alert('Erro', 'Preencha todos os campos.');
//       return;
//     }

//     try {
//       setCarregando(true);

//       let email = loginFormatado.toLowerCase();

//       /*
//        * Se não tiver "@", considera que o usuário digitou um CPF.
//        * O CPF é limpo antes da consulta porque ele é salvo sem formatação.
//        */
//       if (!email.includes('@')) {
//         const cpfLimpo = limparCPF(loginFormatado);

//         if (cpfLimpo.length !== 11) {
//           Alert.alert(
//             'Erro',
//             'Digite um CPF válido com 11 números.',
//           );

//           return;
//         }

//         const consultaCPF = query(
//           collection(db, 'usuarios'),
//           where('cpf', '==', cpfLimpo),
//         );

//         const resultado = await getDocs(consultaCPF);

//         if (resultado.empty) {
//           Alert.alert('Erro', 'CPF não encontrado.');
//           return;
//         }

//         const dadosUsuario = resultado.docs[0].data();
//         const emailEncontrado = dadosUsuario.email;

//         if (
//           typeof emailEncontrado !== 'string' ||
//           !emailEncontrado.trim()
//         ) {
//           Alert.alert(
//             'Erro',
//             'O usuário não possui um email válido cadastrado.',
//           );

//           return;
//         }

//         email = emailEncontrado.trim().toLowerCase();
//       }

//       const credencial = await signInWithEmailAndPassword(
//         auth,
//         email,
//         senha,
//       );

//       try {
//         await registrarLog(
//           credencial.user.uid,
//           'Login',
//           'Usuário realizou login.',
//         );
//       } catch (erroLog) {
//         /*
//          * Uma falha no registro do log não deve impedir o login.
//          */
//         console.error('Erro ao registrar log de login:', erroLog);
//       }

//       router.replace('/visaoGeral');
//     } catch (erro: unknown) {
//       console.error('Erro ao realizar login:', erro);

//       const mensagemErro =
//         erro instanceof Error
//           ? erro.message
//           : 'Erro desconhecido ao realizar login.';

//       try {
//         await registrarLog(
//           'LOGIN',
//           'Erro no login',
//           mensagemErro,
//         );
//       } catch (erroLog) {
//         console.error('Erro ao registrar falha de login:', erroLog);
//       }

//       Alert.alert(
//         'Erro',
//         'Email/CPF ou senha inválidos.',
//       );
//     } finally {
//       setCarregando(false);
//     }
//   }

//   function alternarVisibilidadeSenha() {
//     setMostrarSenha((estadoAtual) => !estadoAtual);
//   }

//   return {
//     login,
//     setLogin,

//     senha,
//     setSenha,

//     mostrarSenha,
//     setMostrarSenha,
//     alternarVisibilidadeSenha,

//     carregando,
//     entrar,
//   };
// }