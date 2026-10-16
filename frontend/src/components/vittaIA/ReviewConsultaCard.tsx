import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import { ConsultaData } from '@/types/vittaIa';
import { formatarHorario } from '@/hooks/useMedicamentos';

interface Props {
  dados: ConsultaData;
  onChange: (campo: keyof ConsultaData, valor: string) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  salvando: boolean;
}

export const ReviewConsultaCard: React.FC<Props> = ({
  dados,
  onChange,
  onSalvar,
  onCancelar,
  salvando,
}) => {
  const { theme } = useTheme();
  const [modalCalendario, setModalCalendario] = useState(false);

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
        <View style={{ backgroundColor: theme.bgConsul, borderRadius: 999, padding: 8 }}>
          <Image
            source={require('@/img/icons/stethoscope-02.svg')}
            style={{ width: 28, height: 28, tintColor: theme.Consul }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Adicionar consulta</Text>
          <Text style={[tipografia.caption, { color: theme.textSecondary }]}>Sugerido automaticamente pela IA</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled">
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Consulta / Especialidade <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text>
          </Text>
          <TextInput
            placeholder="Ex: Pediatria Geral, Retorno, Oftalmologia"
            placeholderTextColor={theme.gray4}
            value={dados.consulta || dados.especialidade || ''}
            onChangeText={(v) => {
              onChange('consulta', v);
              onChange('especialidade', v);
            }}
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

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Médico(a)
          </Text>
          <TextInput
            placeholder="Ex: Dr(a). Camila Rocha"
            placeholderTextColor={theme.gray4}
            value={dados.nomeMedico || dados.nomeDoutor || ''}
            onChangeText={(v) => {
              onChange('nomeMedico', v);
              onChange('nomeDoutor', v);
            }}
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

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Hospital / Clínica
          </Text>
          <TextInput
            placeholder="Ex: Hospital Infantil São Lucas"
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

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
              Data <Text style={{ color: '#D93025' }}>* (Obrigatório)</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setModalCalendario(true)}
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
              <Text style={{ color: dados.dataConsulta ? theme.textPrimary : '#AAA' }}>
                {dados.dataConsulta || 'Selecionar data'}
              </Text>
              <Image source={require('@/img/icons/calendar-02.svg')} style={{ width: 20, height: 20, tintColor: theme.gray4 }} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
              Horário
            </Text>
            <TextInput
              placeholder="Ex: 14:30"
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
          </View>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 }}>
            Descrição / Observações
          </Text>
          <TextInput
            placeholder="Ex: Levar exames anteriores e carteirinha..."
            placeholderTextColor={theme.gray4}
            value={dados.descricao || dados.motivo || ''}
            onChangeText={(v) => {
              onChange('descricao', v);
              onChange('motivo', v);
            }}
            multiline
            numberOfLines={2}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              minHeight: 70,
              fontSize: 15,
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
              textAlignVertical: 'top',
            }}
          />
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <ButtonSecondary texto="Cancelar" onPress={onCancelar} style={{ flex: 1 }} icone={require('@/img/icons/x.svg')} />
        <ButtonPrimary
          texto={salvando ? 'Salvando...' : 'Adicionar'}
          onPress={onSalvar}
          style={{ flex: 1 }}
          icone={require('@/img/icons/add-01.svg')}
        />
      </View>

      <ModalSeletorData
        visivel={modalCalendario}
        onFechar={() => setModalCalendario(false)}
        onConfirmar={(dt) => {
          onChange('dataConsulta', dt);
          setModalCalendario(false);
        }}
        titulo="Selecione a Data da Consulta"
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