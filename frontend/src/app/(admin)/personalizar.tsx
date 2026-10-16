import { ActivityIndicator, Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/admin/Button';
import Card from '../../components/admin/Card';
import ColorField from '../../components/admin/ColorField';
import ErrorState from '../../components/admin/ErrorState';
import { IconImageIcon, IconPalette, IconPreview, IconTrash, IconType, IconUpload } from '../../components/Icons';
import Tabs from '../../components/admin/Tabs';
import { useAdminPersonalizacao } from '../../hooks/useAdminPersonalizacao';
import { AbaPersonalizacao, FonteSistema } from '../../types/admin';

const ABAS: { valor: AbaPersonalizacao; rotulo: string; Icone: any }[] = [
  { valor: 'aparencia', rotulo: 'Aparência', Icone: IconPalette },
  { valor: 'logo', rotulo: 'Logo', Icone: IconImageIcon },
  { valor: 'fonte', rotulo: 'Fonte', Icone: IconType },
  { valor: 'preVisualizacao', rotulo: 'Pré-visualização', Icone: IconPreview },
];

const FONTES: FonteSistema[] = ['Padrão (Sans)', 'Serifada', 'Arredondada', 'Monoespaçada'];

export default function PersonalizarAdmin() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const {
    abaAtiva,
    setAbaAtiva,
    rascunho,
    atualizarCampo,
    definirFonte,
    selecionarLogo,
    removerLogo,
    salvar,
    carregando,
    salvando,
    erro,
    erros,
    houveAlteracoes,
    salvoComSucesso,
    recarregar,
  } = useAdminPersonalizacao();

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5', minHeight: '100%' }}>
      <AdminSidebar />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: isMobile ? 16 : 28, paddingTop: isMobile ? 70 : 28 }}>
        <View style={{ marginBottom: 22 }}>
          <AdminHeader />
        </View>

        {erro ? (
          <Card>
            <ErrorState mensagem={erro} aoTentarNovamente={recarregar} />
          </Card>
        ) : carregando ? (
          <Card style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color="#F7B500" />
          </Card>
        ) : (
          <>
            <View style={{ marginBottom: 4 }}>
              <Tabs
                abas={ABAS.map((a) => ({ valor: a.valor, rotulo: a.rotulo, icone: <a.Icone size={16} color={abaAtiva === a.valor ? '#F7B500' : '#999'} /> }))}
                ativa={abaAtiva}
                onSelecionar={setAbaAtiva}
              />
            </View>

            <View style={{ marginTop: 20, flexDirection: isMobile ? 'column' : 'row', gap: 20, alignItems: 'flex-start' }}>
              <Card style={{ flex: 1, width: '100%' }}>
                {abaAtiva === 'aparencia' && (
                  <AbaAparencia
                    rascunho={rascunho}
                    erros={erros}
                    atualizarCampo={atualizarCampo}
                    onSalvar={salvar}
                    salvando={salvando}
                    houveAlteracoes={houveAlteracoes}
                    salvoComSucesso={salvoComSucesso}
                  />
                )}
                {abaAtiva === 'logo' && (
                  <AbaLogo
                    logoUri={rascunho.logoUri}
                    onSelecionar={selecionarLogo}
                    onRemover={removerLogo}
                    onSalvar={salvar}
                    salvando={salvando}
                    houveAlteracoes={houveAlteracoes}
                  />
                )}
                {abaAtiva === 'fonte' && (
                  <AbaFonte fonteAtual={rascunho.fonte} onSelecionar={definirFonte} onSalvar={salvar} salvando={salvando} houveAlteracoes={houveAlteracoes} />
                )}
                {abaAtiva === 'preVisualizacao' && <AbaPreVisualizacao tema={rascunho} />}
              </Card>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Aba Aparência ──────────────────────────────────────────────────────────

function AbaAparencia({
  rascunho,
  erros,
  atualizarCampo,
  onSalvar,
  salvando,
  houveAlteracoes,
  salvoComSucesso,
}: any) {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 }}>Cores</Text>
      <Text style={{ fontSize: 13, color: '#999', marginBottom: 22 }}>Escolha as principais cores do sistema</Text>

      <ColorField
        label="Cor Primária"
        descricao="Usada em botões, links e destaques"
        valor={rascunho.corPrimaria}
        onChange={(hex: string) => atualizarCampo('corPrimaria', hex)}
        erro={erros.corPrimaria}
      />
      <ColorField
        label="Cor Secundária"
        descricao="Usada em elementos secundários"
        valor={rascunho.corSecundaria}
        onChange={(hex: string) => atualizarCampo('corSecundaria', hex)}
        erro={erros.corSecundaria}
      />
      <ColorField
        label="Cor do fundo"
        descricao="Cor do fundo das páginas"
        valor={rascunho.corFundo}
        onChange={(hex: string) => atualizarCampo('corFundo', hex)}
        erro={erros.corFundo}
      />
      <ColorField
        label="Cor do Texto"
        descricao="Cor principal do texto"
        valor={rascunho.corTexto}
        onChange={(hex: string) => atualizarCampo('corTexto', hex)}
        erro={erros.corTexto}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
        <Button
          label={salvoComSucesso && !houveAlteracoes ? 'Salvo!' : 'Salvar'}
          icone={<IconType size={15} color="#1A1A1A" />}
          onPress={onSalvar}
          carregando={salvando}
          desabilitado={!houveAlteracoes && !salvando}
        />
        {houveAlteracoes && !salvando && (
          <Text style={{ fontSize: 12, color: '#999' }}>Você tem alterações não salvas.</Text>
        )}
      </View>
    </View>
  );
}

// ─── Aba Logo ───────────────────────────────────────────────────────────────

function AbaLogo({ logoUri, onSelecionar, onRemover, onSalvar, salvando, houveAlteracoes }: any) {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 }}>Logo</Text>
      <Text style={{ fontSize: 13, color: '#999', marginBottom: 22 }}>
        Faça upload da logo que será exibida no sistema
      </Text>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          borderWidth: 1.5,
          borderColor: '#E5E5E5',
          borderStyle: 'dashed',
          borderRadius: 16,
          paddingVertical: 36,
          backgroundColor: '#FAFAFA',
        }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 20,
            backgroundColor: '#FFF',
            borderWidth: 1,
            borderColor: '#EEE',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          ) : (
            <IconImageIcon size={34} color="#CCC" />
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label={logoUri ? 'Trocar logo' : 'Enviar logo'} icone={<IconUpload />} variante="secundaria" tamanho="sm" onPress={onSelecionar} />
          {logoUri && <Button label="Remover" icone={<IconTrash />} variante="perigo" tamanho="sm" onPress={onRemover} />}
        </View>
        <Text style={{ fontSize: 11, color: '#AAA' }}>PNG ou JPG, proporção quadrada recomendada.</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Salvar" onPress={onSalvar} carregando={salvando} desabilitado={!houveAlteracoes && !salvando} />
      </View>
    </View>
  );
}

// ─── Aba Fonte ──────────────────────────────────────────────────────────────

function AbaFonte({ fonteAtual, onSelecionar, onSalvar, salvando, houveAlteracoes }: any) {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 }}>Fonte</Text>
      <Text style={{ fontSize: 13, color: '#999', marginBottom: 22 }}>Escolha a fonte usada no sistema</Text>

      <View style={{ gap: 10 }}>
        {FONTES.map((fonte) => {
          const selecionada = fonte === fonteAtual;
          return (
            <View
              key={fonte}
              onTouchEnd={() => onSelecionar(fonte)}
              // @ts-ignore
              onClick={() => onSelecionar(fonte)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: selecionada ? '#F7B500' : '#E5E5E5',
                backgroundColor: selecionada ? '#FFF8E1' : '#FFF',
                cursor: 'pointer' as any,
              }}
            >
              <Text style={{ fontSize: 15, color: '#1A1A1A', fontWeight: selecionada ? '800' : '500' }}>{fonte}</Text>
              {selecionada && (
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#F7B500', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#1A1A1A', fontSize: 11, fontWeight: '900' }}>✓</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button label="Salvar" onPress={onSalvar} carregando={salvando} desabilitado={!houveAlteracoes && !salvando} />
      </View>
    </View>
  );
}

// ─── Aba Pré-visualização ───────────────────────────────────────────────────

function AbaPreVisualizacao({ tema }: { tema: ReturnType<typeof useAdminPersonalizacao>['rascunho'] }) {
  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 }}>Pré-visualização</Text>
      <Text style={{ fontSize: 13, color: '#999', marginBottom: 22 }}>
        Veja como as configurações escolhidas ficam aplicadas
      </Text>

      <View
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#EAEAEA',
          padding: 20,
          backgroundColor: tema.corFundo,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {tema.logoUri ? (
            <Image source={{ uri: tema.logoUri }} style={{ width: 32, height: 32, borderRadius: 8 }} resizeMode="contain" />
          ) : (
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: tema.corPrimaria }} />
          )}
          <Text style={{ fontSize: 16, fontWeight: '900', color: tema.corTexto }}>Vitta.</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, minWidth: 140, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14 }}>
            <Text style={{ fontSize: 12, color: '#888' }}>Usuários cadastrados</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: tema.corTexto }}>50</Text>
          </View>
          <View style={{ flex: 1, minWidth: 140, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14 }}>
            <Text style={{ fontSize: 12, color: '#888' }}>Crianças cadastradas</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: tema.corTexto }}>30</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: tema.corPrimaria }}>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Ação primária</Text>
          </View>
          <View style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: tema.corSecundaria }}>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Ação secundária</Text>
          </View>
        </View>

        <Text style={{ marginTop: 16, fontSize: 12, color: tema.corTexto }}>
          Fonte selecionada: {tema.fonte}
        </Text>
      </View>
    </View>
  );
}