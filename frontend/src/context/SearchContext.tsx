import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type TipoOrdenacao = 'recentes' | 'antigos' | 'az' | 'za';

interface SearchContextData {
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
  ordenacao: TipoOrdenacao;
  setOrdenacao: (ordem: TipoOrdenacao) => void;
  limparBusca: () => void;
}

const SearchContext = createContext<SearchContextData>({
  termoBusca: '',
  setTermoBusca: () => {},
  ordenacao: 'recentes',
  setOrdenacao: () => {},
  limparBusca: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [termoBusca, setTermoBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>('recentes');

  const limparBusca = useCallback(() => {
    setTermoBusca('');
    setOrdenacao('recentes');
  }, []);

  return (
    <SearchContext.Provider
      value={{
        termoBusca,
        setTermoBusca,
        ordenacao,
        setOrdenacao,
        limparBusca,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}