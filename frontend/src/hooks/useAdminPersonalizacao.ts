import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AbaPersonalizacao, FonteSistema, TemaPersonalizacao } from '../types/admin';

const STORAGE_KEY = '@vitta_admin_tema';

export const TEMA_PADRAO: TemaPersonalizacao = {
  corPrimaria: '#1660CF',
  corSecundaria: '#E66718',
  corFundo: '#F4F4F4',
  corTexto: '#1D1D1D',
  fonte: 'Padrão (Sans)',
  logoUri: null,
};

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

function validarTema(tema: TemaPersonalizacao): Partial<Record<keyof TemaPersonalizacao, string>> {
  const erros: Partial<Record<keyof TemaPersonalizacao, string>> = {};
  if (!HEX_REGEX.test(tema.corPrimaria)) erros.corPrimaria = 'Informe um hexadecimal válido (ex: #1660CF).';
  if (!HEX_REGEX.test(tema.corSecundaria)) erros.corSecundaria = 'Informe um hexadecimal válido (ex: #E66718).';
  if (!HEX_REGEX.test(tema.corFundo)) erros.corFundo = 'Informe um hexadecimal válido (ex: #F4F4F4).';
  if (!HEX_REGEX.test(tema.corTexto)) erros.corTexto = 'Informe um hexadecimal válido (ex: #1D1D1D).';
  return erros;
}

export function useAdminPersonalizacao() {
  const [abaAtiva, setAbaAtiva] = useState<AbaPersonalizacao>('aparencia');

  // "rascunho" é o que o usuário está editando; "temaSalvo" é o que já foi persistido
  const [rascunho, setRascunho] = useState<TemaPersonalizacao>(TEMA_PADRAO);
  const [temaSalvo, setTemaSalvo] = useState<TemaPersonalizacao>(TEMA_PADRAO);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Partial<Record<keyof TemaPersonalizacao, string>>>({});
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  const carregarTema = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const salvo = await AsyncStorage.getItem(STORAGE_KEY);
      const tema = salvo ? { ...TEMA_PADRAO, ...JSON.parse(salvo) } : TEMA_PADRAO;
      setTemaSalvo(tema);
      setRascunho(tema);
    } catch (e) {
      console.error('Erro ao carregar tema de personalização:', e);
      setErro('Não foi possível carregar as configurações de personalização.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarTema();
  }, [carregarTema]);

  function atualizarCampo<K extends keyof TemaPersonalizacao>(campo: K, valor: TemaPersonalizacao[K]) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setSalvoComSucesso(false);
  }

  function definirFonte(fonte: FonteSistema) {
    atualizarCampo('fonte', fonte);
  }

  function definirLogo(uri: string | null) {
    atualizarCampo('logoUri', uri);
  }

  async function selecionarLogo() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para escolher uma logo.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (resultado.canceled) return;

      const imagem = resultado.assets[0];

      if (!imagem.base64) {
        Alert.alert('Erro', 'Não foi possível processar a imagem selecionada.');
        return;
      }

      const mime = imagem.mimeType ?? 'image/png';
      definirLogo(`data:${mime};base64,${imagem.base64}`);
    } catch (e) {
      console.error('Erro ao selecionar logo:', e);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  function removerLogo() {
    definirLogo(null);
  }

  function restaurarPadrao() {
    setRascunho(TEMA_PADRAO);
    setSalvoComSucesso(false);
  }

  async function salvar() {
    const novosErros = validarTema(rascunho);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return false;

    try {
      setSalvando(true);
      // TODO: substituir por chamada real (ex.: setDoc em 'configuracoes/tema')
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rascunho));
      setTemaSalvo(rascunho);
      setSalvoComSucesso(true);
      return true;
    } catch (e) {
      console.error('Erro ao salvar personalização:', e);
      setErro('Não foi possível salvar as configurações. Tente novamente.');
      return false;
    } finally {
      setSalvando(false);
    }
  }

  const houveAlteracoes = JSON.stringify(rascunho) !== JSON.stringify(temaSalvo);

  return {
    abaAtiva,
    setAbaAtiva,
    rascunho,
    temaSalvo,
    atualizarCampo,
    definirFonte,
    definirLogo,
    selecionarLogo,
    removerLogo,
    restaurarPadrao,
    salvar,
    carregando,
    salvando,
    erro,
    erros,
    houveAlteracoes,
    salvoComSucesso,
    recarregar: carregarTema,
  };
}