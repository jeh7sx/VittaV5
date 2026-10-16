import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { Medicamento } from '@/hooks/useMedicamentos';
import { lembreteModalStyles as styles } from '@/styles/components/lembreteModal';

const idsLembretesIgnorados = new Set<string>();

interface Props {
  medicamentos: Medicamento[];
  nomeFilho?: string;
  onMarcarDoseTomada?: (id: string, doseTimestamp: number) => Promise<boolean | void>;
  onFechado?: () => void;
}

interface DoseAlerta {
  medicamento: Medicamento;
  dataHoraDose: Date;
  statusDose: 'proximo' | 'atrasado';
}

function parseDataHora(dataStr: string, horaStr: string): Date | null {
  if (!dataStr || !horaStr) return null;
  const [d, m, a] = dataStr.split('/').map(Number);
  const [h, min] = horaStr.split(':').map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(a) || isNaN(h) || isNaN(min)) return null;
  return new Date(a, m - 1, d, h, min, 0);
}

function calcularDoses(item: Medicamento): Date[] {
  const inicio = parseDataHora(item.dataInicio, item.horario);
  if (!inicio) return [];

  let fim: Date;
  if (item.dataTermino) {
    const [dT, mT, aT] = item.dataTermino.split('/').map(Number);
    fim = new Date(aT, mT - 1, dT, 23, 59, 59);
  } else {
    fim = new Date(inicio);
    fim.setDate(fim.getDate() + 30);
  }

  let addHoras = 0;
  let addDias = 0;
  const match = (item.frequencia || '').match(/(\d+)\s*(.*)/);

  if (match) {
    const qtd = parseInt(match[1], 10);
    const und = match[2]?.trim();
    if (und === 'Horas') addHoras = qtd;
    else if (und === 'Dias') addDias = qtd;
    else if (und === 'Semanas') addDias = qtd * 7;
    else addDias = 1;
  } else {
    addDias = 1;
  }
  if (addHoras === 0 && addDias === 0) addDias = 1;

  const doses: Date[] = [];
  let atual = new Date(inicio);
  while (atual <= fim && doses.length < 300) {
    doses.push(new Date(atual));
    if (addHoras > 0) atual.setHours(atual.getHours() + addHoras);
    else atual.setDate(atual.getDate() + addDias);
  }
  return doses;
}

export default function ModalLembreteMedicamento({
  medicamentos,
  nomeFilho,
  onMarcarDoseTomada,
  onFechado,
}: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 768;

  const { theme } = useTheme();

  const [visivel, setVisivel] = useState(false);
  const [dosesAlertas, setDosesAlertas] = useState<DoseAlerta[]>([]);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!medicamentos || medicamentos.length === 0) return;

    const agora = new Date();
    const alertas: DoseAlerta[] = [];

    medicamentos.forEach((med) => {
      if (med.status === 'Concluído') return;

      const doses = calcularDoses(med);
      doses.forEach((dose) => {
        const chaveDose = `${med.id}_${dose.getTime()}`;
        if (idsLembretesIgnorados.has(chaveDose)) return;
        if (med.dosesTomadas?.includes(dose.getTime())) return;

        const diffMinutos = (dose.getTime() - agora.getTime()) / (1000 * 60);

        if (diffMinutos > 0 && diffMinutos <= 60) {
          alertas.push({
            medicamento: med,
            dataHoraDose: dose,
            statusDose: 'proximo',
          });
        } else if (diffMinutos <= 0 && diffMinutos >= -1440) {
          alertas.push({
            medicamento: med,
            dataHoraDose: dose,
            statusDose: 'atrasado',
          });
        }
      });
    });

    if (alertas.length > 0) {
      setDosesAlertas(alertas);
      setVisivel(true);
    } else {
      setDosesAlertas([]);
      setVisivel(false);
      onFechado?.();
    }
  }, [medicamentos]);

  function fecharELembrarDepois() {
    dosesAlertas.forEach((alerta) => {
      idsLembretesIgnorados.add(`${alerta.medicamento.id}_${alerta.dataHoraDose.getTime()}`);
    });
    setVisivel(false);
    onFechado?.();
  }

  function handleAdiarDose(alerta: DoseAlerta) {
    const chave = `${alerta.medicamento.id}_${alerta.dataHoraDose.getTime()}`;
    idsLembretesIgnorados.add(chave);

    const restantes = dosesAlertas.filter(
      (a) => `${a.medicamento.id}_${a.dataHoraDose.getTime()}` !== chave
    );
    setDosesAlertas(restantes);
    if (restantes.length === 0) {
      setVisivel(false);
      onFechado?.();
    }
  }

  async function handleMarcarTomado(alerta: DoseAlerta) {
    const chave = `${alerta.medicamento.id}_${alerta.dataHoraDose.getTime()}`;
    setProcessandoId(chave);
    idsLembretesIgnorados.add(chave);

    const restantes = dosesAlertas.filter(
      (a) => `${a.medicamento.id}_${a.dataHoraDose.getTime()}` !== chave
    );
    setDosesAlertas(restantes);
    if (restantes.length === 0) {
      setVisivel(false);
      onFechado?.();
    }

    if (onMarcarDoseTomada) {
      await onMarcarDoseTomada(alerta.medicamento.id, alerta.dataHoraDose.getTime());
    }
    setProcessandoId(null);
  }

  if (!visivel || dosesAlertas.length === 0) return null;

  return (
    <Modal animationType="fade" transparent visible={visivel} onRequestClose={fecharELembrarDepois}>
      <View style={styles.overlay}>
        <View style={[styles.content, { width: isNarrow ? '92%' : 500, padding: isNarrow ? 18 : 24, backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1 }]}>
          <View style={styles.header}>
            <View style={[styles.circuloIcone, { backgroundColor: theme.bgMed }]}>
              <Image
                source={require('@/img/icons/medicamento.svg')}
                style={{ width: 28, height: 28, tintColor: theme.Med }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Lembrete de Medicamento</Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                {nomeFilho ? `Rotina programada para ${nomeFilho}:` : 'Rotina programada:'}
              </Text>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
            {dosesAlertas.map((alerta, idx) => {
              const chave = `${alerta.medicamento.id}_${alerta.dataHoraDose.getTime()}`;
              const ehAtrasado = alerta.statusDose === 'atrasado';
              const hora = `${String(alerta.dataHoraDose.getHours()).padStart(2, '0')}:${String(
                alerta.dataHoraDose.getMinutes()
              ).padStart(2, '0')}`;
              const dia = `${String(alerta.dataHoraDose.getDate()).padStart(2, '0')}/${String(
                alerta.dataHoraDose.getMonth() + 1
              ).padStart(2, '0')}`;
              const estaProcessando = processandoId === chave;

              return (
                <View
                  key={idx}
                  style={[
                    styles.cardItem,
                    { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 },
                    isNarrow && { flexDirection: 'column', alignItems: 'stretch', gap: 10 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[tipografia.body, { fontWeight: '700', color: theme.textPrimary }]}>
                      {alerta.medicamento.nome}
                    </Text>
                    <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                      {alerta.medicamento.dosagem} • {dia} às {hora}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: ehAtrasado ? '#FEE2E2' : theme.yellow1 },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: ehAtrasado ? '#DC2626' : theme.yellow6,
                        }}
                      >
                        {ehAtrasado ? 'Horário ultrapassado' : 'Próxima dose (< 1h)'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, justifyContent: isNarrow ? 'flex-end' : 'flex-start' }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={estaProcessando}
                      onPress={() => handleAdiarDose(alerta)}
                      style={[styles.btnAindaNao, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>
                        Ainda não
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={estaProcessando}
                      onPress={() => handleMarcarTomado(alerta)}
                      style={styles.btnRealizado}
                    >
                      {estaProcessando ? (
                        <ActivityIndicator size="small" color="#166534" />
                      ) : (
                        <>
                          <Image
                            source={require('@/img/icons/check.svg')}
                            style={{ width: 14, height: 14, tintColor: '#166534' }}
                          />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#166534' }}>
                            Já tomou
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={{ marginTop: 16, gap: 8 }}>
            <ButtonPrimary
              texto="Gerenciar medicamentos"
              onPress={() => {
                fecharELembrarDepois();
                router.push('/(user)/medicamentos');
              }}
            />
            <ButtonSecondary texto="Fechar" onPress={fecharELembrarDepois} />
          </View>
        </View>
      </View>
    </Modal>
  );
}