import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PublicNavbar } from '@/components/PublicNavbar';
import { PublicFooter } from '@/components/PublicFooter';
import { useTheme } from '@/context/ThemeContext';
import { gerarTema } from '@/styles/themes';
import { tipografia } from '@/styles/tipografia';

type CategoriaRecurso = 'todos' | 'cuidados' | 'direitos' | 'apoio' | 'glossario';

interface ItemRecurso {
  id: string;
  categoria: CategoriaRecurso;
  titulo: string;
  descricao: string;
  icone: string;
  badge: string;
  detalhes?: string;
  linkExterno?: string;
}

const RECURSOS_DATA: ItemRecurso[] = [
  {
    id: '1',
    categoria: 'cuidados',
    icone: '🌡️',
    badge: 'Protocolo de Emergência',
    titulo: 'Febre Neutropênica e Sinais de Alarme',
    descricao: 'Como agir imediatamente quando a temperatura passar de 37.8°C em pacientes imunossuprimidos.',
    detalhes: 'Pacientes em quimioterapia têm contagem reduzida de glóbulos brancos. Febre persistente é uma emergência médica oncológica que exige ida imediata ao pronto-atendimento.',
  },
  {
    id: '2',
    categoria: 'direitos',
    icone: '⚖️',
    badge: 'Benefício Social',
    titulo: 'BPC / LOAS e Auxílios Governamentais',
    descricao: 'Passo a passo para solicitar o Benefício de Prestação Continuada no INSS para crianças em tratamento.',
    detalhes: 'Crianças e adolescentes com diagnóstico oncológico têm direito ao benefício mensal de um salário mínimo caso a família se enquadre no critério de renda.',
    linkExterno: 'https://meu.inss.gov.br',
  },
  {
    id: '3',
    categoria: 'direitos',
    icone: '🚗',
    badge: 'Isenções Fiscais',
    titulo: 'Isenção de IPVA, IPI/ICMS e Transporte',
    descricao: 'Direitos dos responsáveis legais sobre isenções de impostos veiculares e passe livre no transporte público.',
    detalhes: 'Responsáveis legais de pacientes em tratamento possuem isenção tarifária em transporte intermunicipal e isenção tributária para aquisição e manutenção de veículos adaptados.',
  },
  {
    id: '4',
    categoria: 'apoio',
    icone: '🏠',
    badge: 'Rede de Apoio',
    titulo: 'Casas de Apoio e Hospedagem Gratuita',
    descricao: 'Instituições que oferecem estadia, alimentação e suporte psicológico para famílias de fora da cidade.',
    detalhes: 'Redes como GRAACC, Casa Ronald McDonald e TUCCA acolhem famílias de outras cidades durante longos ciclos de quimioterapia ou transplante.',
  },
  {
    id: '5',
    categoria: 'glossario',
    icone: '📖',
    badge: 'Glossário Médico',
    titulo: 'Dicionário Oncológico Descomplicado',
    descricao: 'Entenda o que são mielograma, cateter Port-a-Cath, neutrófilos, leucócitos e biópsias sem termos difíceis.',
    detalhes: 'Port-a-Cath é um cateter totalmente implantado sob a pele para administração segura de medicações e quimioterapia sem necessidade de furar a veia repetidamente.',
  },
  {
    id: '6',
    categoria: 'cuidados',
    icone: '🍎',
    badge: 'Nutrição & Higiene',
    titulo: 'Higienização de Alimentos e Dieta Neutropênica',
    descricao: 'Cuidados essenciais no preparo de refeições para evitar contaminação bacteriana em períodos de imunidade baixa.',
    detalhes: 'Evite alimentos crus sem higienização com hipoclorito, prefira carnes bem passadas e alimentos recém-preparados.',
  },
];

const defaultTheme = gerarTema('ouro', 'claro');

export default function RecursosScreen() {
  const router = useRouter();

  // Fallback seguro caso o contexto do tema ainda não esteja pronto
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;
  const isDark = themeContext?.isDark ?? false;

  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaRecurso>('todos');
  const [busca, setBusca] = useState('');
  const [itemExpandido, setItemExpandido] = useState<string | null>(null);

  const recursosFiltrados = RECURSOS_DATA.filter((item) => {
    const combinaCategoria = categoriaAtiva === 'todos' || item.categoria === categoriaAtiva;
    const combinaBusca =
      item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase());
    return combinaCategoria && combinaBusca;
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <PublicNavbar />

      <ScrollView
        style={{ flex: 1, width: '100%', backgroundColor: theme.bg }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MIOLO CENTRALIZADO COM LARGURA MÁXIMA */}
        <View style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                alignSelf: 'flex-start',
                marginBottom: 16,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: theme.cardBg,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary }}>← Voltar</Text>
            </TouchableOpacity>

            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: theme.yellow1,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: theme.yellow5,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FFF' : theme.yellow9, textTransform: 'uppercase' }}>
                Central de Apoio
              </Text>
            </View>
            <Text style={[tipografia.h2, { color: theme.textPrimary, marginBottom: 8 }]}>
              Recursos e Orientações
            </Text>
            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 22 }]}>
              Guias práticos, direitos dos pais, cuidados diários e suporte humanizado para sua família.
            </Text>
          </View>

          {/* Barra de Busca */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.cardBg,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 16,
            }}
          >
            <TextInput
              placeholder="Buscar por febre, direitos, BPC, cateter..."
              placeholderTextColor={theme.gray4}
              value={busca}
              onChangeText={setBusca}
              style={{
                flex: 1,
                fontSize: 14,
                color: theme.textPrimary,
                ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
              }}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca('')}>
                <Text style={{ color: theme.textSecondary, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filtros por Categoria */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { key: 'todos', label: 'Todos os Recursos' },
                { key: 'cuidados', label: '🩺 Cuidados em Casa' },
                { key: 'direitos', label: '⚖️ Direitos & Leis' },
                { key: 'apoio', label: '🏠 Casas de Apoio' },
                { key: 'glossario', label: '📖 Termos Médicos' },
              ].map((cat) => {
                const ativo = categoriaAtiva === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: ativo ? theme.yellow5 : theme.cardBg,
                      borderWidth: 1,
                      borderColor: ativo ? theme.yellow5 : theme.border,
                    }}
                    onPress={() => setCategoriaAtiva(cat.key as CategoriaRecurso)}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: ativo ? (isDark ? '#000000' : '#FFFFFF') : theme.textSecondary,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Grid de Cards */}
          <View style={{ gap: 14 }}>
            {recursosFiltrados.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                  Nenhum recurso encontrado para esta busca.
                </Text>
              </View>
            ) : (
              recursosFiltrados.map((item) => {
                const expandido = itemExpandido === item.id;
                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: theme.cardBg,
                      padding: 20,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          backgroundColor: theme.inputBg,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>{item.icone}</Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: theme.yellow1,
                          borderWidth: 1,
                          borderColor: theme.yellow5,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#FFF' : theme.yellow9 }}>
                          {item.badge}
                        </Text>
                      </View>
                    </View>

                    <Text style={[tipografia.h3, { color: theme.textPrimary, marginBottom: 6 }]}>
                      {item.titulo}
                    </Text>
                    <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, lineHeight: 20, marginBottom: 14 }]}>
                      {item.descricao}
                    </Text>

                    {expandido && item.detalhes && (
                      <View
                        style={{
                          backgroundColor: theme.inputBg,
                          padding: 14,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: theme.border,
                          marginBottom: 12,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: theme.textPrimary, lineHeight: 20 }}>
                          {item.detalhes}
                        </Text>
                        {item.linkExterno && (
                          <TouchableOpacity
                            style={{ marginTop: 10, alignSelf: 'flex-start' }}
                            onPress={() => Linking.openURL(item.linkExterno!)}
                          >
                            <Text style={{ fontSize: 12.5, fontWeight: '700', color: theme.yellow6 }}>
                              Acessar Portal Oficial ↗
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <TouchableOpacity
                      style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border }}
                      onPress={() => setItemExpandido(expandido ? null : item.id)}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.yellow6 }}>
                        {expandido ? 'Ocultar detalhes ↑' : 'Ler orientação completa ➔'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

          {/* Banner Vitta IA de Dúvidas */}
          <View
            style={{
              marginTop: 30,
              backgroundColor: theme.cardBg,
              padding: 20,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: theme.yellow1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>💛</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 }}>
                Ficou com alguma dúvida específica?
              </Text>
              <Text style={{ fontSize: 12.5, color: theme.textSecondary, lineHeight: 18 }}>
                Entre em contato com nossa equipe em vittaetec@gmail.com ou consulte nosso assistente Vitta IA.
              </Text>
            </View>
          </View>
        </View>

        {/* ESPAÇADOR E FOOTER EM LARGURA TOTAL (100%) */}
        <View style={{ height: 40 }} />
        <PublicFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 18,
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 24,
  },
});