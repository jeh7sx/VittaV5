import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebase';

export interface FilhoContextItem {
  id: string;
  nome: string;
  idade: number;
  responsavelId: string;
  responsaveisIds?: string[];
  permissoesResponsaveis?: Record<string, any>;
  fotoBase64?: string;
  foto?: string;
}

interface FilhoContextData {
  filhos: FilhoContextItem[];
  filhoSelecionado: FilhoContextItem | null;
  setFilhoSelecionado: (filho: FilhoContextItem | null) => void;
  carregandoContext: boolean;
  minhaPermissaoNoFilho: 'admin' | 'editor' | 'leitor';
  podeEditarFilhoSelecionado: boolean;
}

const STORAGE_KEY = '@vitta_filho_selecionado_ativo_v1';
const FilhoContext = createContext<FilhoContextData>({} as FilhoContextData);

function obterStorage(): string | null {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
  return null;
}

function salvarStorage(id: string | null) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
  if (id) AsyncStorage.setItem(STORAGE_KEY, id);
  else AsyncStorage.removeItem(STORAGE_KEY);
}

export const FilhoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filhos, setFilhos] = useState<FilhoContextItem[]>([]);
  const [filhoSelecionado, setFilhoSelecionadoState] = useState<FilhoContextItem | null>(null);
  const [carregandoContext, setCarregandoContext] = useState(true);

  // Inicializa o ID imediatamente no milissegundo zero via localStorage síncrono
  const idGuardadoInicial = useRef<string | null>(obterStorage());

  const setFilhoSelecionado = (filho: FilhoContextItem | null) => {
    const novoId = filho?.id ?? null;
    idGuardadoInicial.current = novoId;
    salvarStorage(novoId);
    setFilhoSelecionadoState(filho);
  };

  useEffect(() => {
    // Para Mobile (AsyncStorage assíncrono)
    if (Platform.OS !== 'web') {
      AsyncStorage.getItem(STORAGE_KEY).then((id) => {
        if (id) idGuardadoInicial.current = id;
      });
    }

    let cancel1: (() => void) | undefined;
    let cancel2: (() => void) | undefined;

    const unsubAuth = auth.onAuthStateChanged((usuario) => {
      cancel1?.();
      cancel2?.();

      if (!usuario) {
        // NÃO limpamos idGuardadoInicial.current aqui!
        // No reload (F5) o Firebase emite null por alguns instantes antes do login.
        setFilhos([]);
        setFilhoSelecionadoState(null);
        setCarregandoContext(false);
        return;
      }

      setCarregandoContext(true);

      const qArray = query(
        collection(db, 'filhos'),
        where('responsaveisIds', 'array-contains', usuario.uid)
      );

      const qLegado = query(
        collection(db, 'filhos'),
        where('responsavelId', '==', usuario.uid)
      );

      let docsArray: FilhoContextItem[] = [];
      let docsLegado: FilhoContextItem[] = [];

      const mapear = (docSnap: any): FilhoContextItem => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          nome: d.nome || 'Sem nome',
          idade: d.idade || 0,
          responsavelId: d.responsavelId || '',
          responsaveisIds: d.responsaveisIds || [d.responsavelId],
          permissoesResponsaveis: d.permissoesResponsaveis || {},
          fotoBase64: d.fotoBase64 || d.foto || '',
        };
      };

      const sincronizar = () => {
        const mapa = new Map<string, FilhoContextItem>();
        [...docsArray, ...docsLegado].forEach((f) => mapa.set(f.id, f));
        const lista = Array.from(mapa.values());

        setFilhos(lista);

        if (lista.length === 0) {
          setFilhoSelecionadoState(null);
          setCarregandoContext(false);
          return;
        }

        // 1. Tenta recuperar o ID da memória ou do localStorage
        const idDesejado = idGuardadoInicial.current || obterStorage();
        const filhoEncontrado = idDesejado ? lista.find((f) => f.id === idDesejado) : null;

        if (filhoEncontrado) {
          // Mantém exatamente o selecionado
          idGuardadoInicial.current = filhoEncontrado.id;
          salvarStorage(filhoEncontrado.id);
          setFilhoSelecionadoState(filhoEncontrado);
        } else if (!idDesejado) {
          // SÓ assume o primeiro se o utilizador NUNCA tiver selecionado nenhum antes
          const primeiro = lista[0];
          idGuardadoInicial.current = primeiro.id;
          salvarStorage(primeiro.id);
          setFilhoSelecionadoState(primeiro);
        }
        // Se idDesejado existe mas ainda não bateu na lista (ex: snapshot parcial), não força o índice 0!

        setCarregandoContext(false);
      };

      cancel1 = onSnapshot(
        qArray,
        (snap) => {
          docsArray = snap.docs.map(mapear);
          sincronizar();
        },
        () => setCarregandoContext(false)
      );

      cancel2 = onSnapshot(
        qLegado,
        (snap) => {
          docsLegado = snap.docs.map(mapear);
          sincronizar();
        },
        () => setCarregandoContext(false)
      );
    });

    return () => {
      cancel1?.();
      cancel2?.();
      unsubAuth();
    };
  }, []);

  const uidAtual = auth.currentUser?.uid;
  const souTitular = Boolean(
    uidAtual &&
      filhoSelecionado &&
      (filhoSelecionado.responsavelId === uidAtual ||
        filhoSelecionado.responsaveisIds?.[0] === uidAtual)
  );

  const minhaPermissaoNoFilho: 'admin' | 'editor' | 'leitor' = souTitular
    ? 'admin'
    : (filhoSelecionado?.permissoesResponsaveis?.[uidAtual || '']?.papel as any) || 'editor';

  const podeEditarFilhoSelecionado =
    souTitular || minhaPermissaoNoFilho === 'admin' || minhaPermissaoNoFilho === 'editor';

  return (
    <FilhoContext.Provider
      value={{
        filhos,
        filhoSelecionado,
        setFilhoSelecionado,
        carregandoContext,
        minhaPermissaoNoFilho,
        podeEditarFilhoSelecionado,
      }}
    >
      {children}
    </FilhoContext.Provider>
  );
};

export function useFilho() {
  return useContext(FilhoContext);
}