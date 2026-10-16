import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { MedicamentoData } from '@/types/vittaIa';
import { calcularTurno, formatarHorario, ICONE_TURNO } from '@/hooks/useMedicamentos';

interface Props {
  dados: MedicamentoData;
  onChange: (campo: keyof MedicamentoData, valor: string) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  salvando: boolean;
}

const OPCOES_UNIDADE_FREQ = ['Horas', 'Dias', 'Semanas', 'Personalizado'];
const OPCOES_DOSAGEM = [
  'Comprimido(s)',
  'Gotas',
  'ml',
  'mg',
  'Cápsula(s)',
  'Colher(es)',
  'Injeção/Ampola',
  'Outro',
];

export const ReviewMedicamentoCard: React.FC<Props> = ({
  dados,
  onChange,
  onSalvar,
  onCancelar,
  salvando,
}) => {
  const { theme } = useTheme();

  const matchDosagem = (dados.dosagem ?? '').match(/^(\d+)\s*(.*)$/);
  const [dosagemValor, setDosagemValor] = useState(
    matchDosagem ? matchDosagem[1] : (dados.dosagem ?? '').replace(/\D/g, '') || '1'
  );
  const [dosTipo, setDosTipo] = useState(
    matchDosagem && matchDosagem[2] && OPCOES_DOSAGEM.includes(matchDosagem[2].trim())
      ? matchDosagem[2].trim()
      : 'Comprimido(s)'
  );

  const matchFreq = (dados.frequencia ?? '').match(/^(\d+)\s*(.*)$/);
  const [freqQtd, setFreqQtd] = useState(matchFreq ? parseInt(matchFreq[1], 10) || 8 : 8);
  const [freqUnidade, setFreqUnidade] = useState(
    matchFreq && matchFreq[2] && OPCOES_UNIDADE_FREQ.includes(matchFreq[2].trim())
      ? matchFreq[2].trim()
      : 'Horas'
  );

  const [dropdownAberto, setDropdownAberto] = useState<'freq' | 'dos' | null>(null);
  const [modalCalendario, setModalCalendario] = useState<{
    visivel: boolean;
    campo: 'inicio' | 'termino' | null;
  }>({ visivel: false, campo: null });

  useEffect(() => {
    if (!dados.dosagem) onChange('dosagem', `${dosagemValor} ${dosTipo}`);
    if (!dados.frequencia) onChange('frequencia', `${freqQtd} ${freqUnidade}`);
  }, []);

  function handleAtualizarDosagem(num: string, tipo: string) {
    const limpo = num.replace(/\D/g, '');
    setDosagemValor(limpo);
    onChange('dosagem', limpo ? `${limpo} ${tipo}` : '');
  }

  function handleAtualizarFrequencia(qtd: number, unidade: string) {
    const q = Math.max(1, qtd);
    setFreqQtd(q);
    setFreqUnidade(unidade);
    onChange('frequencia', `${q} ${unidade}`);
  }

  function aplicarData(dataStr: string) {
    if (modalCalendario.campo === 'inicio') onChange('dataInicio', dataStr);
    if (modalCalendario.campo === 'termino') onChange('dataTermino', dataStr);
    setModalCalendario({ visivel: false, campo: null });
  }

  const turno = calcularTurno(dados.horario ?? '');

  return (
    <View
      style={{
        backgroundColor: theme.cardBg,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.border,
        maxWidth: 580,
        width: '100%',
        alignSelf: 'center',
        marginVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <View style={{ backgroundColor: theme.bgMed, borderRadius: 999, padding: 8 }}>
          <Image
            source={require('@/img/icons/medicamento.svg')}
            style={{ width: 28, height: 28, tintColor: theme.Med }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Adicionar medicamento</Text>
          <Text style={[tipografia.caption, { color: theme.textSecondary }]}>Sugerido automaticamente pela IA</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }} keyboardShouldPersistTaps="handled">
        {/* Medicamento */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Medicamento <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text>
          </Text>
          <TextInput
            placeholder="Ex: Dipirona"
            placeholderTextColor={theme.gray4}
            value={dados.nome ?? ''}
            onChangeText={(v) => onChange('nome', v)}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              height: 48,
              fontSize: 15,
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
            }}
          />
        </View>

        {/* Dosagem */}
        <View style={{ marginBottom: 14, zIndex: 50 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Dosagem <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="Ex: 1, 500, 2..."
              placeholderTextColor={theme.gray4}
              value={dosagemValor}
              keyboardType="numeric"
              onChangeText={(texto) => handleAtualizarDosagem(texto, dosTipo)}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 48,
                fontSize: 15,
                backgroundColor: theme.inputBg,
                color: theme.textPrimary,
                flex: 1,
              }}
            />
            <View style={{ position: 'relative', width: 170 }}>
              <TouchableOpacity
                onPress={() => setDropdownAberto(dropdownAberto === 'dos' ? null : 'dos')}
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  height: 48,
                  backgroundColor: theme.inputBg,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.textPrimary }}>{dosTipo}</Text>
                <Text style={{ fontSize: 12, color: theme.gray4 }}>▼</Text>
              </TouchableOpacity>
              {dropdownAberto === 'dos' && (
                <View style={{ position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: theme.cardBg, borderRadius: 12, borderWidth: 1, borderColor: theme.border, zIndex: 1000, elevation: 6 }}>
                  {OPCOES_DOSAGEM.map((opc) => (
                    <TouchableOpacity
                      key={opc}
                      onPress={() => {
                        setDosTipo(opc);
                        handleAtualizarDosagem(dosagemValor, opc);
                        setDropdownAberto(null);
                      }}
                      style={{ paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: theme.border }}
                    >
                      <Text style={{ color: theme.textPrimary }}>{opc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Horário Inicial */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Horário inicial <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text>
          </Text>
          <TextInput
            placeholder="Ex: 09:00"
            placeholderTextColor={theme.gray4}
            value={dados.horario ?? ''}
            onChangeText={(v) => onChange('horario', formatarHorario(v))}
            maxLength={5}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              height: 48,
              fontSize: 15,
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
            }}
          />
          {!!turno && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Image source={ICONE_TURNO[turno]} style={{ width: 16, height: 16, tintColor: theme.gray4 }} resizeMode="contain" />
              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{turno}</Text>
            </View>
          )}
        </View>

        {/* Frequência */}
        <View style={{ marginBottom: 14, zIndex: 40 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Frequência <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBg, borderWidth: 1, borderColor: theme.border, borderRadius: 14, height: 48, width: 130, justifyContent: 'space-between', paddingHorizontal: 8 }}>
              <TouchableOpacity onPress={() => handleAtualizarFrequencia(freqQtd - 1, freqUnidade)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.cardBg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.textPrimary }}>{freqQtd}</Text>
              <TouchableOpacity onPress={() => handleAtualizarFrequencia(freqQtd + 1, freqUnidade)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: theme.cardBg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary }}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={{ position: 'relative', flex: 1 }}>
              <TouchableOpacity
                onPress={() => setDropdownAberto(dropdownAberto === 'freq' ? null : 'freq')}
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  height: 48,
                  backgroundColor: theme.inputBg,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.textPrimary }}>{freqUnidade}</Text>
                <Text style={{ fontSize: 12, color: theme.gray4 }}>▼</Text>
              </TouchableOpacity>
              {dropdownAberto === 'freq' && (
                <View style={{ position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: theme.cardBg, borderRadius: 12, borderWidth: 1, borderColor: theme.border, zIndex: 1000, elevation: 6 }}>
                  {OPCOES_UNIDADE_FREQ.map((opc) => (
                    <TouchableOpacity
                      key={opc}
                      onPress={() => {
                        handleAtualizarFrequencia(freqQtd, opc);
                        setDropdownAberto(null);
                      }}
                      style={{ paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: theme.border }}
                    >
                      <Text style={{ color: theme.textPrimary }}>{opc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Datas */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
              Data de Início <Text style={{ color: '#D93025' }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setModalCalendario({ visivel: true, campo: 'inicio' })}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 48,
                backgroundColor: theme.inputBg,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: dados.dataInicio ? theme.textPrimary : '#AAA' }}>
                {dados.dataInicio || 'Selecionar data'}
              </Text>
              <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
              Data de Término
            </Text>
            <TouchableOpacity
              onPress={() => setModalCalendario({ visivel: true, campo: 'termino' })}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 14,
                paddingHorizontal: 16,
                height: 48,
                backgroundColor: theme.inputBg,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: dados.dataTermino ? theme.textPrimary : '#AAA' }}>
                {dados.dataTermino || 'Selecionar data'}
              </Text>
              <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hospital */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Hospital / Farmácia / Clínica
          </Text>
          <TextInput
            placeholder="Ex: Drogasil, Farmácia Central"
            placeholderTextColor={theme.gray4}
            value={dados.hospital ?? ''}
            onChangeText={(v) => onChange('hospital', v)}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              height: 48,
              fontSize: 15,
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
            }}
          />
        </View>
      </ScrollView>

      {/* Ações inferiores */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <ButtonSecondary texto="Cancelar" onPress={onCancelar} style={{ flex: 1 }} icone={require('@/img/icons/x.svg')} />
        <ButtonPrimary
          texto={salvando ? 'Salvando...' : 'Adicionar'}
          onPress={() => {
            onChange('dosagem', `${dosagemValor} ${dosTipo}`);
            onChange('frequencia', `${freqQtd} ${freqUnidade}`);
            onSalvar();
          }}
          style={{ flex: 1 }}
          icone={require('@/img/icons/add-01.svg')}
        />
      </View>

      <ModalSeletorData
        visivel={modalCalendario.visivel}
        onFechar={() => setModalCalendario({ visivel: false, campo: null })}
        onConfirmar={aplicarData}
        titulo={modalCalendario.campo === 'inicio' ? 'Selecione a Data de Início' : 'Selecione a Data de Término'}
      />
    </View>
  );
};

function ModalSeletorData({
  visivel,
  onFechar,
  onConfirmar,
  titulo,
}: {
  visivel: boolean;
  onFechar: () => void;
  onConfirmar: (data: string) => void;
  titulo: string;
}) {
  const { theme } = useTheme();
  const [dataAtual, setDataAtual] = useState(new Date());
  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth();

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const diasGrade: (number | null)[] = [];
  for (let i = 0; i < primeiroDiaSemana; i++) diasGrade.push(null);
  for (let d = 1; d <= diasNoMes; d++) diasGrade.push(d);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ backgroundColor: theme.cardBg, borderRadius: 20, padding: 20, width: '100%', maxWidth: 360, borderColor: theme.border, borderWidth: 1 }}>
          <Text style={[tipografia.h3, { marginBottom: 16, textAlign: 'center', color: theme.textPrimary }]}>{titulo}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setDataAtual(new Date(ano, mes - 1, 1))} style={{ padding: 8, borderRadius: 8, backgroundColor: theme.inputBg }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>◀</Text>
            </TouchableOpacity>
            <Text style={[tipografia.body, { fontWeight: '600', color: theme.textPrimary }]}>{nomesMeses[mes]} {ano}</Text>
            <TouchableOpacity onPress={() => setDataAtual(new Date(ano, mes + 1, 1))} style={{ padding: 8, borderRadius: 8, backgroundColor: theme.inputBg }}>
              <Text style={{ fontWeight: '700', color: theme.textPrimary }}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {diasGrade.map((dia, idx) => (
              <View key={idx} style={{ width: `${100 / 7}%`, height: 38, justifyContent: 'center', alignItems: 'center' }}>
                {dia !== null && (
                  <TouchableOpacity
                    onPress={() => {
                      const d = String(dia).padStart(2, '0');
                      const m = String(mes + 1).padStart(2, '0');
                      onConfirmar(`${d}/${m}/${ano}`);
                    }}
                    style={{ width: 34, height: 34, justifyContent: 'center', alignItems: 'center', borderRadius: 17 }}
                  >
                    <Text style={{ color: theme.textPrimary, fontSize: 14 }}>{dia}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={onFechar} style={{ marginTop: 16, alignItems: 'center', paddingVertical: 10, backgroundColor: theme.inputBg, borderRadius: 12 }}>
            <Text style={{ fontWeight: '600', color: theme.textSecondary }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}