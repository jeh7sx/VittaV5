import { useMemo } from 'react';
import { useVisaoGeral } from '../hooks/useVisaoGeral';
import { colors } from '@/styles/colors';

export const CORES_CATEGORIA = {
  medicamento: {
    dot: colors.Med,
    label: 'Medicamentos',
  },
  consulta: {
    dot: colors.Consul,
    label: 'Consultas',
  },
  exame: {
    dot: colors.Exame,
    label: 'Exames',
  },
};

export const CORES_STATUS = {
  agendado: {
    dot: '#F7B500',
    label: 'Agendado',
  },
  concluido: {
    dot: '#10B981',
    label: 'Concluído / Tomado',
  },
  atrasado: {
    dot: colors.delete,
    label: 'Atrasado / Pendente',
  },
  hoje: {
    dot: '#2563EB',
    label: 'Hoje',
  },
};

export function obterConfigTipo(tipo: string) {
  if (tipo === 'medicamento') {
    return {
      label: 'Medicamento',
      cor: CORES_CATEGORIA.medicamento.dot,
      fundo: '#F5EAF9',
      icone: require('@/img/icons/medicamento.svg'),
    };
  }

  if (tipo === 'consulta') {
    return {
      label: 'Consulta',
      cor: CORES_CATEGORIA.consulta.dot,
      fundo: '#E5F5F3',
      icone: require('@/img/icons/stethoscope-02.svg'),
    };
  }

  return {
    label: 'Exame',
    cor: CORES_CATEGORIA.exame.dot,
    fundo: '#FFF0E6',
    icone: require('@/img/icons/microscope.svg'),
  };
}

export function obterStatusVisual(evento: any) {
  const status = String(evento?.status || '').toLowerCase().trim();

  if (
    evento?.concluido ||
    status === 'concluido' ||
    status === 'concluído' ||
    status === 'tomado' ||
    status === 'realizado' ||
    status === 'finalizado'
  ) {
    return {
      label: 'Concluído',
      cor: '#15803D',
      fundo: '#DCFCE7',
    };
  }

  if (status === 'atrasado' || status === 'expirado') {
    return {
      label: 'Atrasado',
      cor: '#B91C1C',
      fundo: '#FEE2E2',
    };
  }

  if (status === 'cancelado') {
    return {
      label: 'Cancelado',
      cor: '#4B5563',
      fundo: '#F3F4F6',
    };
  }

  return {
    label: 'Agendado',
    cor: '#8A5B00',
    fundo: '#FFF4D6',
  };
}

export function useCalendarioController() {
  const visaoGeral = useVisaoGeral();

  const dataSelecionada = visaoGeral.diaSelecionado
    ? `${String(visaoGeral.diaSelecionado).padStart(2, '0')}/${String(
        visaoGeral.mesAtual.getMonth() + 1
      ).padStart(2, '0')}/${visaoGeral.mesAtual.getFullYear()}`
    : null;

  function obterTiposNoDiaSimplificado(dia: number) {
    const evs = visaoGeral.eventosFiltrados.filter((ev: any) => {
      if (!ev.data) return false;
      const partes = ev.data.split('/');
      return (
        Number(partes[0]) === dia &&
        Number(partes[1]) === visaoGeral.mesAtual.getMonth() + 1 &&
        Number(partes[2]) === visaoGeral.mesAtual.getFullYear()
      );
    });

    const medicamentosUnicos = new Set<string>();
    let totalConsultas = 0;
    let totalExames = 0;

    evs.forEach((ev: any) => {
      if (ev.tipo === 'medicamento') {
        const baseId = ev.id?.split('-')[0] || ev.titulo;
        medicamentosUnicos.add(baseId);
      } else if (ev.tipo === 'consulta') {
        totalConsultas++;
      } else if (ev.tipo === 'exame') {
        totalExames++;
      }
    });

    const totalItensUnicos = medicamentosUnicos.size + totalConsultas + totalExames;

    return {
      temMedicamento: medicamentosUnicos.size > 0,
      temConsulta: totalConsultas > 0,
      temExame: totalExames > 0,
      total: totalItensUnicos,
    };
  }

  // Agrupa múltiplas doses do mesmo medicamento num único card de exibição
  const atividadesAgrupadas = useMemo(() => {
    const mapa = new Map<string, any>();
    const resultado: any[] = [];

    visaoGeral.eventosDoDia.forEach((ev: any) => {
      if (ev.tipo === 'medicamento') {
        const baseId = ev.id.split('-')[0] || ev.titulo;

        if (!mapa.has(baseId)) {
          const itemAgrupado = {
            ...ev,
            idAgrupado: baseId,
            horariosDoses: [ev.horario],
          };
          mapa.set(baseId, itemAgrupado);
          resultado.push(itemAgrupado);
        } else {
          const existente = mapa.get(baseId);
          if (ev.horario && !existente.horariosDoses.includes(ev.horario)) {
            existente.horariosDoses.push(ev.horario);
            existente.horariosDoses.sort();
          }
        }
      } else {
        resultado.push(ev);
      }
    });

    return resultado;
  }, [visaoGeral.eventosDoDia]);

  return {
    ...visaoGeral,
    dataSelecionada,
    atividadesAgrupadas,
    obterTiposNoDiaSimplificado,
  };
}