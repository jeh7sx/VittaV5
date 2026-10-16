import { useState } from 'react';
import { Text, View } from 'react-native';
import { PontoSerie } from '../../types/admin';

interface LineChartProps {
  dados: PontoSerie[];
  cor?: string;
  altura?: number;
}

const VIEW_W = 1000;

function calcularEixoY(valores: number[]) {
  const max = Math.max(...valores, 1);
  // Arredonda o topo do eixo para um número "redondo" (múltiplo de 300, 500, etc.)
  const passoBase = max <= 10 ? 2 : Math.pow(10, Math.floor(Math.log10(max)) - 1) * (max > 1000 ? 3 : 1);
  const passo = passoBase > 0 ? Math.ceil(max / 5 / passoBase) * passoBase : Math.ceil(max / 5);
  const topo = passo * 5;
  return { topo: topo || max, passo: passo || Math.ceil(max / 5) };
}

export default function LineChart({ dados, cor = '#F7B500', altura = 260 }: LineChartProps) {
  const [pontoAtivo, setPontoAtivo] = useState<number | null>(null);

  if (!dados || dados.length === 0) {
    return (
      <View style={{ height: altura, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 13 }}>Sem dados para o período selecionado.</Text>
      </View>
    );
  }

  const paddingEsq = 60;
  const paddingDir = 20;
  const paddingTopo = 20;
  const paddingBase = 34;
  const larguraUtil = VIEW_W - paddingEsq - paddingDir;
  const alturaUtil = altura - paddingTopo - paddingBase;

  const valores = dados.map((d) => d.valor);
  const { topo, passo } = calcularEixoY(valores);
  const ticks = [0, 1, 2, 3, 4, 5].map((i) => passo * i).filter((v) => v <= topo);
  if (ticks[ticks.length - 1] !== topo) ticks.push(topo);

  const escalaX = (i: number) =>
    dados.length === 1 ? paddingEsq + larguraUtil / 2 : paddingEsq + (i / (dados.length - 1)) * larguraUtil;
  const escalaY = (v: number) => paddingTopo + alturaUtil - (v / topo) * alturaUtil;

  const pontosLinha = dados.map((d, i) => `${escalaX(i)},${escalaY(d.valor)}`).join(' ');
  const pontosArea = `${paddingEsq},${paddingTopo + alturaUtil} ${pontosLinha} ${escalaX(dados.length - 1)},${paddingTopo + alturaUtil}`;

  return (
    <View>
      <div style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${VIEW_W} ${altura}`} style={{ width: '100%', height: altura, display: 'block' }}>
          <defs>
            <linearGradient id="gradienteArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.22} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Linhas de grade horizontais + rótulos do eixo Y */}
          {ticks.map((tick) => {
            const y = escalaY(tick);
            return (
              <g key={tick}>
                <line x1={paddingEsq} y1={y} x2={VIEW_W - paddingDir} y2={y} stroke="#EFEFEF" strokeWidth={1} strokeDasharray="4 4" />
                <text x={paddingEsq - 12} y={y + 4} fontSize={12} fill="#999" textAnchor="end">
                  {tick.toLocaleString('pt-BR')}
                </text>
              </g>
            );
          })}

          {/* Área sob a linha */}
          <polygon points={pontosArea} fill="url(#gradienteArea)" />

          {/* Linha principal */}
          <polyline points={pontosLinha} fill="none" stroke={cor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Pontos + rótulos do eixo X */}
          {dados.map((d, i) => {
            const x = escalaX(i);
            const y = escalaY(d.valor);
            const ativo = pontoAtivo === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setPontoAtivo(i)}
                onMouseLeave={() => setPontoAtivo(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={x} cy={y} r={16} fill="transparent" />
                <circle cx={x} cy={y} r={ativo ? 7 : 5} fill="#FFFFFF" stroke={cor} strokeWidth={3} />
                <text x={x} y={altura - 10} fontSize={12} fill="#888" textAnchor="middle">
                  {d.rotulo}
                </text>
                {ativo && (
                  <g>
                    <rect x={x - 28} y={y - 38} width={56} height={24} rx={6} fill="#1A1A1A" />
                    <text x={x} y={y - 22} fontSize={12} fill="#FFF" textAnchor="middle" fontWeight={700}>
                      {d.valor.toLocaleString('pt-BR')}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </View>
  );
}