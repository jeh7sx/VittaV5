import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  gerarTema,
  PaletaId,
  ModoTema,
  PALETAS_INFO,
  ThemeColors,
} from '@/styles/themes';

interface ThemeContextData {
  theme: ThemeColors;
  paletaAtiva: PaletaId;
  modoAtivo: ModoTema;
  isDark: boolean;
  paletasDisponiveis: typeof PALETAS_INFO;
  definirPaleta: (paleta: PaletaId) => void;
  definirModo: (modo: ModoTema) => void;
  alternarModo: () => void;
}

const STORAGE_PALETA_KEY = '@vitta_theme_paleta';
const STORAGE_MODO_KEY = '@vitta_theme_modo';

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletaAtiva, setPaletaAtiva] = useState<PaletaId>('ouro');
  const [modoAtivo, setModoAtivo] = useState<ModoTema>('claro');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_PALETA_KEY),
      AsyncStorage.getItem(STORAGE_MODO_KEY),
    ]).then(([p, m]) => {
      if (p && ['vermelho', 'ouro', 'lavanda', 'menta', 'oceano', 'pessego'].includes(p)) {
        setPaletaAtiva(p as PaletaId);
      }
      if (m && ['claro', 'escuro'].includes(m)) {
        setModoAtivo(m as ModoTema);
      }
    });
  }, []);

  const definirPaleta = async (paleta: PaletaId) => {
    setPaletaAtiva(paleta);
    await AsyncStorage.setItem(STORAGE_PALETA_KEY, paleta);
  };

  const definirModo = async (modo: ModoTema) => {
    setModoAtivo(modo);
    await AsyncStorage.setItem(STORAGE_MODO_KEY, modo);
  };

  const alternarModo = async () => {
    const novo = modoAtivo === 'claro' ? 'escuro' : 'claro';
    setModoAtivo(novo);
    await AsyncStorage.setItem(STORAGE_MODO_KEY, novo);
  };

  const theme = gerarTema(paletaAtiva, modoAtivo);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        paletaAtiva,
        modoAtivo,
        isDark: modoAtivo === 'escuro',
        paletasDisponiveis: PALETAS_INFO,
        definirPaleta,
        definirModo,
        alternarModo,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}