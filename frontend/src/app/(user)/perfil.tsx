import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type KeyboardTypeOptions,
} from 'react-native';

import { usePerfil } from '../../hooks/usePerfil';
import { styles } from '../../styles/app/(user)/perfil';
import { useTheme } from '@/context/ThemeContext';

import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonTertiary from '@/components/Buttons/ButtonTertiary';
import ModalVisualizarImagem from '@/components/Modal/ModalVisualizarImagem';
import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';

import { tipografia } from '@/styles/tipografia';

export default function Perfil() {
  const { width } = useWindowDimensions();
  const isNarrow = width < 768;

  const { theme } = useTheme();

  const {
    dadosSalvos,
    nome,
    setNome,
    dataNascimento,
    alterarDataNascimento,
    email,
    setEmail,
    foto,
    carregando,
    carregandoFoto,
    salvando,
    mostrarSenha,
    alternarCamposSenha,
    senhaAtual,
    setSenhaAtual,
    senhaNova,
    setSenhaNova,
    senhaConfirm,
    setSenhaConfirm,
    escolherFoto,
    salvarPerfil,
    cancelar,
  } = usePerfil();

  const [visualizandoPreview, setVisualizandoPreview] = useState(false);

  const senhasDiferentes =
    senhaConfirm.length > 0 && senhaNova !== senhaConfirm;

  return (
    <View style={[styles.pagina, { flex: 1, backgroundColor: theme.bg }]}>
      <BotaoVittaIA />
      <View style={[styles.conteudo, { flex: 1, padding: isNarrow ? 16 : 28 }]}>
        <View style={{ marginBottom: isNarrow ? 16 : 24 }}>
          <Text style={[tipografia.h2, { color: theme.textPrimary }]}>Perfil</Text>
          <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>Altere suas informações pessoais</Text>
        </View>

        <ScrollView
          style={[styles.scrollView, { backgroundColor: theme.bg }]}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBg,
                borderRadius: 24,
                padding: isNarrow ? 16 : 28,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 20,
                width: '100%',
                maxWidth: isNarrow ? '100%' : 680,
              },
            ]}
          >
            {carregando ? (
              <View style={[styles.carregamentoContainer, { paddingVertical: 40, alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#F7B500" />
              </View>
            ) : (
              <>
                {/* Header de Perfil */}
                <View
                  style={{
                    flexDirection: isNarrow ? 'column' : 'row',
                    alignItems: isNarrow ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    paddingBottom: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: isNarrow ? 'column' : 'row',
                      alignItems: 'center',
                      gap: 16,
                      flex: 1,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={foto ? 0.75 : 1}
                      onPress={() => {
                        if (foto) setVisualizandoPreview(true);
                      }}
                      style={{
                        width: isNarrow ? 80 : 96,
                        height: isNarrow ? 80 : 96,
                        borderRadius: 48,
                        backgroundColor: theme.inputBg,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 2,
                        borderColor: theme.border,
                      }}
                    >
                      {carregandoFoto ? (
                        <ActivityIndicator size="small" color={theme.yellow5} />
                      ) : foto ? (
                        <Image
                          source={{ uri: foto }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Image
                          source={require('@/img/icons/user.svg')}
                          style={{ width: 36, height: 36, tintColor: theme.gray4 }}
                        />
                      )}
                    </TouchableOpacity>

                    <View style={{ alignItems: isNarrow ? 'center' : 'flex-start', flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={[tipografia.h3, { color: theme.textPrimary }, isNarrow && { textAlign: 'center' }]}
                      >
                        {dadosSalvos?.nome || 'Usuário'}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={[tipografia.bodySecondary, { marginTop: 4, color: theme.textSecondary }, isNarrow && { textAlign: 'center' }]}
                      >
                        {dadosSalvos?.email || ''}
                      </Text>

                      {Boolean(foto) && (
                        <Text style={[tipografia.caption, { color: theme.yellow6, marginTop: 4, fontSize: 11 }]}>
                          Toque na foto para ampliar
                        </Text>
                      )}
                    </View>
                  </View>

                  <ButtonTertiary
                    texto="Alterar foto"
                    onPress={() => void escolherFoto()}
                    style={isNarrow ? { width: '100%', alignSelf: 'stretch' } : undefined}
                  />
                </View>

                {/* Campos Pessoais */}
                <FormField
                  label="Nome completo"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChangeText={setNome}
                  editable={!salvando}
                  theme={theme}
                />

                <FormField
                  label="Data de nascimento"
                  placeholder="DD/MM/AAAA"
                  value={dataNascimento}
                  onChangeText={alterarDataNascimento}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!salvando}
                  theme={theme}
                />

                <FormField
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!salvando}
                  theme={theme}
                />

                {/* Seção de Senha */}
                <View
                  style={{
                    backgroundColor: theme.cardBg,
                    borderRadius: 16,
                    padding: isNarrow ? 14 : 20,
                    borderWidth: 1,
                    borderColor: theme.border,
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: isNarrow ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isNarrow ? 'flex-start' : 'center',
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[tipografia.h3, { color: theme.textPrimary }]}>Segurança da conta</Text>
                      <Text style={[tipografia.caption, { marginTop: 2, color: theme.textSecondary }]}>Altere ou redefina sua senha</Text>
                    </View>

                    <ButtonTertiary
                      texto={mostrarSenha ? 'Fechar' : 'Alterar senha'}
                      onPress={alternarCamposSenha}
                      icone={mostrarSenha ? require('@/img/icons/x.svg') : require('@/img/icons/reset-password.svg')}
                      style={isNarrow ? { width: '100%' } : undefined}
                    />
                  </View>

                  {mostrarSenha && (
                    <View style={{ gap: 16 }}>
                      <PasswordField
                        label="Senha atual"
                        placeholder="Digite sua senha atual"
                        value={senhaAtual}
                        onChangeText={setSenhaAtual}
                        editable={!salvando}
                        theme={theme}
                      />

                      <PasswordField
                        label="Nova senha"
                        placeholder="Mínimo 6 caracteres"
                        value={senhaNova}
                        onChangeText={setSenhaNova}
                        editable={!salvando}
                        theme={theme}
                      />

                      <PasswordField
                        label="Confirmar nova senha"
                        placeholder="Repita a nova senha"
                        value={senhaConfirm}
                        onChangeText={setSenhaConfirm}
                        possuiErro={senhasDiferentes}
                        mensagemErro={
                          senhasDiferentes ? 'As senhas não coincidem' : undefined
                        }
                        editable={!salvando}
                        theme={theme}
                      />
                    </View>
                  )}
                </View>

                {/* Ações */}
                <View
                  style={{
                    flexDirection: isNarrow ? 'column-reverse' : 'row',
                    justifyContent: 'flex-end',
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <ButtonSecondary
                    onPress={cancelar}
                    texto="Cancelar"
                    style={{ width: isNarrow ? '100%' : 160 }}
                  />
                  <ButtonPrimary
                    texto={salvando ? 'Salvando...' : 'Salvar alterações'}
                    onPress={() => void salvarPerfil()}
                    style={{ width: isNarrow ? '100%' : 220 }}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>

      <ModalVisualizarImagem
        imagemUri={visualizandoPreview ? foto : null}
        nomeArquivo="foto-perfil"
        onClose={() => setVisualizandoPreview(false)}
      />
    </View>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  editable = true,
  autoCapitalize,
  autoCorrect,
  theme,
}: any) {
  return (
    <View style={{ gap: 8, width: '100%' }}>
      <Text style={[tipografia.body, { color: theme.textPrimary }]}>{label}</Text>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.gray4}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        style={[
          styles.input,
          {
            height: 48,
            backgroundColor: theme.inputBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            color: theme.textPrimary,
            width: '100%',
          },
          !editable && { opacity: 0.6 },
        ]}
      />
    </View>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  possuiErro = false,
  mensagemErro,
  editable = true,
  theme,
}: any) {
  return (
    <View style={{ gap: 6, width: '100%' }}>
      <Text style={[tipografia.caption, { fontWeight: '600', color: theme.textPrimary }]}>{label}</Text>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.gray4}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            height: 48,
            backgroundColor: theme.inputBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: possuiErro ? '#DC2626' : theme.border,
            color: theme.textPrimary,
            width: '100%',
          },
          !editable && { opacity: 0.6 },
        ]}
      />

      {mensagemErro ? (
        <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 2 }}>
          {mensagemErro}
        </Text>
      ) : null}
    </View>
  );
}