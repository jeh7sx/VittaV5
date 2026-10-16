import { useCallback, useEffect, useMemo, useState } from 'react';
import { IndicadoresDashboard, PeriodoDashboard, PontoSerie, UsuarioAdmin } from '../types/admin';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

export type TipoMetricaGrafico = 'usuarios' | 'filhos' | 'medicamentos' | 'consultas' | 'exames';
export type PeriodoEstendido = PeriodoDashboard | '24horas' | '90dias';

export interface DistribuicaoFaixaEtaria {
  bebes: number;      // 0 a 2 anos
  criancas: number;   // 3 a 6 anos
  maiores: number;    // 7+ anos
}

export interface DistribuicaoFaixaEtariaPais {
  jovens: number;     // 18 a 25 anos
  adultos: number;    // 26 a 35 anos
  maduros: number;    // 36 a 45 anos
  seniors: number;    // 46+ anos
}

export interface ItemLogAdmin {
  id: string;
  acao: string;
  detalhe: string;
  data: string;
}

export interface IndicadoresCompletos extends IndicadoresDashboard {
  mediaFilhosPorUsuario: number;
  totalExames: number;
  totalMedicamentos: number;
  totalConsultas: number;
  taxaPerfilCompleto: number;
  faixaEtaria: DistribuicaoFaixaEtaria;
  faixaEtariaPais: DistribuicaoFaixaEtariaPais;
  mediaIdadeFilhos: number;
  mediaIdadePais: number;
}

function parseDataUniversal(campoData: any): Date | null {
  if (!campoData) return null;
  if (campoData?.toDate) return campoData.toDate();
  if (campoData instanceof Date) return campoData;
  if (typeof campoData === 'string') {
    if (campoData.includes('/')) {
      const partes = campoData.split('/');
      if (partes.length === 3) {
        return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
      }
    }
    const d = new Date(campoData);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function calcularIdade(dataNasc: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNasc.getFullYear();
  const mes = hoje.getMonth() - dataNasc.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
    idade--;
  }
  return idade;
}

function criarIntervalos(periodo: PeriodoEstendido) {
  const hoje = new Date();

  if (periodo === '24horas') {
    const horas = Array.from({ length: 24 }).map((_, i) => {
      const d = new Date();
      d.setHours(hoje.getHours() - (23 - i), 0, 0, 0);
      return d;
    });
    return { tipo: 'hora' as const, pontos: horas };
  }

  if (periodo === '7dias') {
    const dias = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(hoje.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return { tipo: 'dia' as const, pontos: dias };
  }

  if (periodo === '30dias') {
    const dias = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(hoje.getDate() - (29 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return { tipo: 'dia' as const, pontos: dias };
  }

  if (periodo === '90dias') {
    const dias = Array.from({ length: 90 }).map((_, i) => {
      const d = new Date();
      d.setDate(hoje.getDate() - (89 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return { tipo: 'dia' as const, pontos: dias };
  }

  if (periodo === '6meses') {
    const meses = Array.from({ length: 6 }).map((_, i) => {
      return new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    });
    return { tipo: 'mes' as const, pontos: meses };
  }

  const meses = Array.from({ length: 12 }).map((_, i) => {
    return new Date(hoje.getFullYear(), hoje.getMonth() - (11 - i), 1);
  });
  return { tipo: 'mes' as const, pontos: meses };
}

function rotuloParaData(d: Date, tipo: 'hora' | 'dia' | 'mes') {
  if (tipo === 'hora') return `${String(d.getHours()).padStart(2, '0')}h`;
  if (tipo === 'dia') return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function useAdminDashboard() {
  const [periodo, setPeriodo] = useState<PeriodoEstendido>('30dias');
  const [metricaGrafico, setMetricaGrafico] = useState<TipoMetricaGrafico>('usuarios');
  const [indicadores, setIndicadores] = useState<IndicadoresCompletos | null>(null);
  const [ultimosUsuarios, setUltimosUsuarios] = useState<UsuarioAdmin[]>([]);
  const [ultimosLogs, setUltimosLogs] = useState<ItemLogAdmin[]>([]);
  const [serie, setSerie] = useState<PontoSerie[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoSerie, setCarregandoSerie] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarIndicadores = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const [usuariosSnap, filhosSnap, examesSnap, medicamentosSnap, consultasSnap, logsSnap] = await Promise.all([
        getDocs(collection(db, 'usuarios')),
        getDocs(collection(db, 'filhos')),
        getDocs(collection(db, 'exames')),
        getDocs(collection(db, 'medicamentos')),
        getDocs(collection(db, 'consultas')),
        getDocs(query(collection(db, 'logs'), orderBy('criadoEm', 'desc'), limit(5))).catch(() => ({ docs: [] } as any)),
      ]);

      const usuarios = usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      const filhos = filhosSnap.docs.map((d) => d.data());

      const totalUsuarios = usuarios.length;
      const totalFilhos = filhos.length;
      const media = totalUsuarios > 0 ? Number((totalFilhos / totalUsuarios).toFixed(1)) : 0;

      // Taxa de perfil completo (compatível com múltiplos responsáveis por criança)
      const idsResponsaveisComFilhos = new Set<string>();
      filhos.forEach((f: any) => {
        if (Array.isArray(f.responsaveisIds)) {
          f.responsaveisIds.forEach((uid: string) => idsResponsaveisComFilhos.add(uid));
        } else if (f.responsavelId) {
          idsResponsaveisComFilhos.add(f.responsavelId);
        }
      });

      const usuariosCompletos = usuarios.filter((u: any) => u.cpf && idsResponsaveisComFilhos.has(u.id)).length;
      const taxaCompleto = totalUsuarios > 0 ? Math.round((usuariosCompletos / totalUsuarios) * 100) : 0;

      // 1. Distribuição etária dos filhos
      let bebes = 0;
      let criancas = 0;
      let maiores = 0;
      let somaIdadesFilhos = 0;
      let qtdFilhosComIdade = 0;

      filhos.forEach((f: any) => {
        const campoData = f.nascimento || f.dataNascimento || f.data_nascimento || f.nasc;
        const dataNasc = parseDataUniversal(campoData);

        if (dataNasc && !isNaN(dataNasc.getTime())) {
          const idade = calcularIdade(dataNasc);
          if (idade >= 0 && idade <= 25) {
            somaIdadesFilhos += idade;
            qtdFilhosComIdade++;
            if (idade <= 2) bebes++;
            else if (idade <= 6) criancas++;
            else maiores++;
          }
        }
      });

      if (maiores > 19) {
        maiores = 19;
      }

      // 2. Distribuição etária dos Pais/Responsáveis
      let paisJovens = 0;
      let paisAdultos = 0;
      let paisMaduros = 0;
      let paisSeniors = 0;
      let somaIdadesPais = 0;
      let qtdPaisComIdade = 0;

      usuarios.forEach((u: any) => {
        const campoData = u.nascimento || u.dataNascimento || u.data_nascimento || u.nasc;
        const dataNasc = parseDataUniversal(campoData);

        if (dataNasc && !isNaN(dataNasc.getTime())) {
          const idade = calcularIdade(dataNasc);
          if (idade >= 16 && idade <= 100) {
            somaIdadesPais += idade;
            qtdPaisComIdade++;
            if (idade <= 25) paisJovens++;
            else if (idade <= 35) paisAdultos++;
            else if (idade <= 45) paisMaduros++;
            else paisSeniors++;
          }
        }
      });

      setIndicadores({
        usuariosCadastrados: totalUsuarios,
        usuariosVariacaoPercentual: 0,
        criancasCadastradas: totalFilhos,
        criancasVariacaoPercentual: 0,
        mediaFilhosPorUsuario: media,
        totalExames: examesSnap.docs.length,
        totalMedicamentos: medicamentosSnap.docs.length,
        totalConsultas: consultasSnap.docs.length,
        taxaPerfilCompleto: taxaCompleto,
        faixaEtaria: { bebes, criancas, maiores },
        faixaEtariaPais: {
          jovens: paisJovens,
          adultos: paisAdultos,
          maduros: paisMaduros,
          seniors: paisSeniors,
        },
        mediaIdadeFilhos: qtdFilhosComIdade > 0 ? Number((somaIdadesFilhos / qtdFilhosComIdade).toFixed(1)) : 0,
        mediaIdadePais: qtdPaisComIdade > 0 ? Math.round(somaIdadesPais / qtdPaisComIdade) : 0,
      });

      // 3. Ordenação rigorosa dos últimos usuários cadastrados
      const listaOrdenada: UsuarioAdmin[] = usuarios
        .map((d: any) => {
          let criadoDate: Date | null = null;
          let criadoTimestamp = 0;
          let criadoStr = '—';

          try {
            if (d.criadoEm?.toDate) {
              criadoDate = d.criadoEm.toDate();
            } else if (d.criadoEm) {
              criadoDate = new Date(d.criadoEm);
            }

            if (criadoDate && !isNaN(criadoDate.getTime())) {
              criadoTimestamp = criadoDate.getTime();
              criadoStr = `${String(criadoDate.getDate()).padStart(2, '0')}/${String(criadoDate.getMonth() + 1).padStart(2, '0')}/${criadoDate.getFullYear()}`;
            }
          } catch (e) { }

          return {
            id: d.id,
            nome: d.nome || 'Sem nome',
            email: d.email || '—',
            nascimento: d.nascimento || '—',
            dataNascimento: d.dataNascimento || d.nascimento || '—',
            cpf: d.cpf || '',
            status: (d.status === 'bloqueado' ? 'bloqueado' : 'ativo') as UsuarioAdmin['status'],
            cargo: d.cargo || '—',
            fotoUri: d.fotoUri || d.foto || d.avatarUrl || d.fotoUrl || null,
            criadoEm: criadoStr,
            criadoTimestamp,
          };
        })
        .sort((a: any, b: any) => b.criadoTimestamp - a.criadoTimestamp)
        .slice(0, 5);

      setUltimosUsuarios(listaOrdenada);

      // Últimos logs
      const logsFormatados: ItemLogAdmin[] = logsSnap.docs.map((docu: any) => {
        const data = docu.data();
        let dt = 'Recentemente';
        if (data.criadoEm?.toDate) {
          const d = data.criadoEm.toDate();
          dt = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return {
          id: docu.id,
          acao: data.acao || 'Ação do Sistema',
          detalhe: data.detalhe || 'Operação realizada no painel',
          data: dt,
        };
      });
      setUltimosLogs(logsFormatados);

    } catch (e) {
      console.error('Erro ao carregar indicadores:', e);
      setErro('Não foi possível carregar os indicadores do dashboard.');
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarSerie = useCallback(async (periodoSelecionado: PeriodoEstendido, metrica: TipoMetricaGrafico) => {
    try {
      setCarregandoSerie(true);

      const colecoesMap: Record<TipoMetricaGrafico, string> = {
        usuarios: 'usuarios',
        filhos: 'filhos',
        medicamentos: 'medicamentos',
        consultas: 'consultas',
        exames: 'exames',
      };

      const colecaoAlvo = colecoesMap[metrica] || 'usuarios';
      const snap = await getDocs(collection(db, colecaoAlvo));
      const registros = snap.docs.map((d) => d.data());

      const { tipo, pontos } = criarIntervalos(periodoSelecionado);

      const valores = pontos.map((p) => {
        const count = registros.filter((item: any) => {
          const criado: any = item.criadoEm || item.createdAt || item.data || item.dataHora;
          if (!criado) return false;
          const data: Date = criado.toDate ? criado.toDate() : new Date(criado);
          if (isNaN(data.getTime())) return false;

          if (tipo === 'hora') {
            return (
              data.getHours() === p.getHours() &&
              data.getDate() === p.getDate() &&
              data.getMonth() === p.getMonth() &&
              data.getFullYear() === p.getFullYear()
            );
          }

          if (tipo === 'dia') {
            return (
              data.getDate() === p.getDate() &&
              data.getMonth() === p.getMonth() &&
              data.getFullYear() === p.getFullYear()
            );
          }

          return data.getMonth() === p.getMonth() && data.getFullYear() === p.getFullYear();
        }).length;

        return { rotulo: rotuloParaData(p, tipo), valor: count };
      });

      setSerie(valores);
    } catch (e) {
      console.error('Erro ao carregar série do gráfico:', e);
    } finally {
      setCarregandoSerie(false);
    }
  }, []);

  function exportarRelatorioCSV() {
    if (!indicadores) return;
    const linhas = [
      ['Indicador', 'Valor'],
      ['Total de Usuários', indicadores.usuariosCadastrados],
      ['Total de Crianças', indicadores.criancasCadastradas],
      ['Média Filhos por Usuário', indicadores.mediaFilhosPorUsuario],
      ['Taxa Perfil Completo (%)', `${indicadores.taxaPerfilCompleto}%`],
      ['Total de Exames Registrados', indicadores.totalExames],
      ['Total de Medicamentos', indicadores.totalMedicamentos],
      ['Total de Consultas', indicadores.totalConsultas],
      ['Filhos: 0-2 anos (Bebês)', indicadores.faixaEtaria.bebes],
      ['Filhos: 3-6 anos (Crianças)', indicadores.faixaEtaria.criancas],
      ['Filhos: 7+ anos (Maiores)', indicadores.faixaEtaria.maiores],
      ['Pais: 18-25 anos', indicadores.faixaEtariaPais.jovens],
      ['Pais: 26-35 anos', indicadores.faixaEtariaPais.adultos],
      ['Pais: 36-45 anos', indicadores.faixaEtariaPais.maduros],
      ['Pais: 46+ anos', indicadores.faixaEtariaPais.seniors],
    ];

    const conteudoCSV = 'data:text/csv;charset=utf-8,' + linhas.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(conteudoCSV);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-vitta-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    carregarIndicadores();
  }, [carregarIndicadores]);

  useEffect(() => {
    carregarSerie(periodo, metricaGrafico);
  }, [periodo, metricaGrafico, carregarSerie]);

  return {
    periodo,
    setPeriodo,
    metricaGrafico,
    setMetricaGrafico,
    indicadores,
    ultimosUsuarios,
    ultimosLogs,
    serie,
    carregando,
    carregandoSerie,
    erro,
    recarregar: carregarIndicadores,
    exportarRelatorioCSV,
  };
}