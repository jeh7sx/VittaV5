import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { Consulta, StatusConsulta } from '@/hooks/useConsultas';
import { lembreteModalStyles as styles } from '@/styles/components/lembreteModal';

const idsConsultasIgnoradas = new Set<string>();

interface Props {
  consultas: Consulta[];
  nomeFilho?: string;
  onAlterarStatus?: (id: string, novoStatus: StatusConsulta) => Promise<boolean | void>;
  onFechado?: () => void;
}

interface ConsultaAlerta {
  consulta: Consulta;
  dataHora: Date;
  statusAlerta: 'proximo' | 'atrasado';
}

function parseDataHora(dataStr: string, horaStr: string): Date | null {
  if (!dataStr || !horaStr) return null;
  const [d, m, a] = dataStr.split('/').map(Number);
  const [h, min] = horaStr.split(':').map(Number);
  if (isNaN(d) || isNaN(m) || isNaN(a) || isNaN(h) || isNaN(min)) return null;
  return new Date(a, m - 1, d, h, min, 0);
}

export default function ModalLembreteConsulta({
  consultas,
  nomeFilho,
  onAlterarStatus,
  onFechado,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();

  const [visivel, setVisivel] = useState(false);
  const [alertas, setAlertas] = useState<ConsultaAlerta[]>([]);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!consultas || consultas.length === 0) return;

    const agora = new Date();
    const pendentes: ConsultaAlerta[] = [];

    consultas.forEach((item) => {
      if (item.status === 'Concluído' || item.status === 'Atrasado') return;
      if (idsConsultasIgnoradas.has(item.id)) return;

      const dataHora = parseDataHora(item.dataConsulta, item.horario);
      if (!dataHora) return;

      const diffMinutos = (dataHora.getTime() - agora.getTime()) / (1000 * 60);

      if (diffMinutos > 0 && diffMinutos <= 120) {
        pendentes.push({
          consulta: item,
          dataHora,
          statusAlerta: 'proximo',
        });
      } else if (diffMinutos <= 0 && diffMinutos >= -1440) {
        pendentes.push({
          consulta: item,
          dataHora,
          statusAlerta: 'atrasado',
        });
      }
    });

    if (pendentes.length > 0) {
      setAlertas(pendentes);
      setVisivel(true);
    } else {
      setAlertas([]);
      setVisivel(false);
      onFechado?.();
    }
  }, [consultas]);

  function fecharELembrarDepois() {
    alertas.forEach((a) => idsConsultasIgnoradas.add(a.consulta.id));
    setVisivel(false);
    onFechado?.();
  }

  function handleAdiar(item: ConsultaAlerta) {
    idsConsultasIgnoradas.add(item.consulta.id);
    const restantes = alertas.filter((a) => a.consulta.id !== item.consulta.id);
    setAlertas(restantes);
    if (restantes.length === 0) setVisivel(false);
  }

  async function handleMarcarRealizada(item: ConsultaAlerta) {
    setProcessandoId(item.consulta.id);
    idsConsultasIgnoradas.add(item.consulta.id);

    const restantes = alertas.filter((a) => a.consulta.id !== item.consulta.id);
    setAlertas(restantes);
    if (restantes.length === 0) setVisivel(false);

    if (onAlterarStatus) {
      await onAlterarStatus(item.consulta.id, 'Concluído');
    }
    setProcessandoId(null);
  }

  if (!visivel || alertas.length === 0) return null;

  return (
    <Modal animationType="slide" transparent visible={visivel} onRequestClose={fecharELembrarDepois}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.cardBg, borderColor: theme.border, borderWidth: 1 }]}>
          <View style={[styles.indicador, { backgroundColor: theme.border }]} />

          <View style={styles.header}>
            <View style={[styles.circuloIcone, { backgroundColor: theme.bgConsul }]}>
              <Image
                source={require('@/img/icons/stethoscope-02.svg')}
                style={{ width: 26, height: 26, tintColor: theme.Consul }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Lembrete de Consulta</Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                {nomeFilho ? `Compromisso agendado para ${nomeFilho}:` : 'Compromisso agendado:'}
              </Text>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {alertas.map((alerta, idx) => {
              const ehAtrasado = alerta.statusAlerta === 'atrasado';
              const hora = `${String(alerta.dataHora.getHours()).padStart(2, '0')}:${String(
                alerta.dataHora.getMinutes()
              ).padStart(2, '0')}`;
              const dia = `${String(alerta.dataHora.getDate()).padStart(2, '0')}/${String(
                alerta.dataHora.getMonth() + 1
              ).padStart(2, '0')}`;
              const processando = processandoId === alerta.consulta.id;

              return (
                <View key={idx} style={[styles.cardItem, { backgroundColor: theme.inputBg, borderColor: theme.border, borderWidth: 1 }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[tipografia.body, { fontWeight: '700', color: theme.textPrimary }]}>
                      {alerta.consulta.consulta}
                    </Text>
                    <Text style={[tipografia.caption, { color: theme.textSecondary }]}>
                      {alerta.consulta.hospital || 'Clínica/Hospital'} • {dia} às {hora}
                    </Text>
                    {!!alerta.consulta.nomeMedico && (
                      <Text style={[tipografia.caption, { color: theme.gray4, marginTop: 2 }]}>
                        Dr(a). {alerta.consulta.nomeMedico}
                      </Text>
                    )}
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
                        {ehAtrasado ? 'Horário já passou' : 'Chegando a hora'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      disabled={processando}
                      onPress={() => handleAdiar(alerta)}
                      style={[styles.btnAindaNao, { backgroundColor: theme.cardBg, borderColor: theme.border }]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>
                        Depois
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={processando}
                      onPress={() => handleMarcarRealizada(alerta)}
                      style={styles.btnRealizado}
                    >
                      {processando ? (
                        <ActivityIndicator size="small" color="#166534" />
                      ) : (
                        <>
                          <Image
                            source={require('@/img/icons/check.svg')}
                            style={{ width: 14, height: 14, tintColor: '#166534' }}
                          />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#166534' }}>
                            Compareceu
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
              texto="Ver consultas"
              onPress={() => {
                fecharELembrarDepois();
                router.push('/(user)/consultas');
              }}
            />
            <ButtonSecondary texto="Fechar" onPress={fecharELembrarDepois} />
          </View>
        </View>
      </View>
    </Modal>
  );
}