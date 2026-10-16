import { useMemo, useState } from 'react';
import { TipoOrdenacao } from '../components/Header';

interface OpcoesFiltro<T> {
  // Função que retorna os campos em texto a serem pesquisados
  obterCamposTexto: (item: T) => (string | undefined | null)[];
  // Campo de texto principal usado para ordenação A-Z / Z-A (ex: nome, titulo)
  obterTituloParaOrdem?: (item: T) => string;
  // Campo de data (formato DD/MM/AAAA) usado para ordenação por data
  obterData?: (item: T) => string;
}

export function useHeaderSearch<T>(
  listaOriginal: T[],
  opcoes: OpcoesFiltro<T>
) {
  const [termoBusca, setTermoBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>('recentes');

  const listaFiltrada = useMemo(() => {
    let resultado = [...(listaOriginal || [])];

    // 1. Filtragem por termo de busca (pesquisa inteligente em múltiplos campos)
    if (termoBusca && termoBusca.trim() !== '') {
      const termo = termoBusca.toLowerCase().trim();
      resultado = resultado.filter((item) => {
        const campos = opcoes.obterCamposTexto(item);
        return campos.some((campo) => {
          if (!campo) return false;
          return campo.toLowerCase().includes(termo);
        });
      });
    }

    // 2. Ordenação
    resultado.sort((a, b) => {
      // Ordenação Alfabética A-Z / Z-A
      if (opcoes.obterTituloParaOrdem) {
        const titA = (opcoes.obterTituloParaOrdem(a) || '').toLowerCase();
        const titB = (opcoes.obterTituloParaOrdem(b) || '').toLowerCase();

        if (ordenacao === 'az') return titA.localeCompare(titB);
        if (ordenacao === 'za') return titB.localeCompare(titA);
      }

      // Ordenação por Data (Mais recentes / Mais antigos)
      if (opcoes.obterData) {
        const converterParaMs = (dataStr?: string) => {
          if (!dataStr) return 0;
          const partes = dataStr.split('/');
          if (partes.length === 3) {
            return new Date(
              Number(partes[2]),
              Number(partes[1]) - 1,
              Number(partes[0])
            ).getTime();
          }
          return 0;
        };

        const msA = converterParaMs(opcoes.obterData(a));
        const msB = converterParaMs(opcoes.obterData(b));

        if (ordenacao === 'antigos') return msA - msB;
        return msB - msA; // recentes (padrão)
      }

      return 0;
    });

    return resultado;
  }, [listaOriginal, termoBusca, ordenacao, opcoes]);

  return {
    termoBusca,
    setTermoBusca,
    ordenacao,
    setOrdenacao,
    listaFiltrada,
    // Objeto pronto para repassar direto ao componente <Header {...headerProps} />
    headerProps: {
      termoBusca,
      setTermoBusca,
      ordenacao,
      setOrdenacao,
    },
  };
}