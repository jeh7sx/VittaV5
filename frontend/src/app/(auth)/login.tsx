import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Image
} from 'react-native';
// Importa as cores 
import { colors } from '@/styles/colors';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useSenha } from '../../hooks/useSenha';
import LogoVittaF from '../../img/logoVittaFundo.svg';
import { styles } from '../../styles/app/(auth)/login';
import { Ionicons } from '@expo/vector-icons';
import { tipografia } from '@/styles/tipografia';
// Botões
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonBlack from '@/components/Buttons/ButtonBlack';
import ButtonWhite from '@/components/Buttons/ButtonWhite';

export default function Login() {
  const {
    login,
    setLogin,
    senha,
    setSenha,
    mostrarSenha,
    setMostrarSenha,
    carregando,
    signIn,
  } = useAuth();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const { enviandoEmail, enviarRedefinicaoSenha } = useSenha();

  // Intercepta a tecla Enter na Web e no Mobile
  function handleKeyPress(e: any) {
    if (e.key === 'Enter' || e.nativeEvent?.key === 'Enter') {
      signIn();
    }
  }

  async function recuperarSenha() {
    await enviarRedefinicaoSenha(login);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={isDesktop ? styles.conteudoDesktop : styles.conteudoMobile}>

            {/* PAINEL ESQUERDO: Card Branco com o Formulário */}
            <View style={styles.leftPanel}>
              <View
                style={[
                  styles.cardFormulario,
                  !isDesktop && styles.cardFormularioMobile,
                ]}
              >
                {/* Logo + Título */}
                {/*<View style={styles.logoWrapper}>
                  <img src={LogoVittaF} alt="Logo Vitta" style={{ width: 34, height: 34 }} />
                  <Text style={tipografia.h2}>Vitta</Text>
                  <Text style={tipografia.h2}>.</Text>
                </View>*/}

                <View style={{ gap: 8, marginBottom: 24 }}>
                  <Text style={[tipografia.h1, { width: '100%', minWidth: 500, lineHeight: 56 }]}>Entre com sua conta</Text>
                  <Text style={tipografia.bodySecondary}>
                    Comece a organizar o cuidado com mais tranquilidade.
                  </Text>
                </View>

                <View style={{ gap: 56 }}>
                  <View style={{ gap: 16 }}>
                    {/* Email / CPF */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>Email ou CPF</Text>
                      <TextInput
                        placeholder="Insira seu endereço de email ou CPF"
                        placeholderTextColor={colors.gray4}
                        value={login}
                        onChangeText={setLogin}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                        // @ts-ignore - Interceptação Web
                        onKeyDown={handleKeyPress}
                        onKeyPress={handleKeyPress}
                        style={[styles.input, tipografia.bodySecondary]}
                      />
                    </View>

                    {/* Senha */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>Senha</Text>
                      <View style={styles.passwordWrapper}>
                        <TextInput
                          placeholder="Insira sua senha"
                          placeholderTextColor={colors.gray4}
                          secureTextEntry={!mostrarSenha}
                          value={senha}
                          onChangeText={setSenha}
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="go"
                          onSubmitEditing={signIn}
                          // @ts-ignore - Interceptação Web
                          onKeyDown={handleKeyPress}
                          onKeyPress={handleKeyPress}
                          style={[styles.input, tipografia.bodySecondary]}

                        />
                        <TouchableOpacity
                          onPress={() => setMostrarSenha(!mostrarSenha)}
                          style={styles.eyeButton}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={
                              mostrarSenha
                                ? require('@/img/icons/view.svg')
                                : require('@/img/icons/eye-off.svg')
                            }
                            style={{
                              width: 24,
                              height: 24,
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Esqueci minha senha */}

                  </View>


                  <View style={{
                    gap: 24,
                    width: '100%'

                  }}>
                    {/* Botão Entrar */}
                    <ButtonPrimary
                      // disabled={carregando}
                      texto={carregando ? 'Entrando...' : 'Entrar'}
                      onPress={signIn}
                      icone={require('@/img/icons/logIn.svg')}
                      style={{
                        width: 'auto'
                      }}
                    />
                    {/* Footer */}
                    <View style={styles.footer}>
                      <Text style={tipografia.body}>Ainda não possui uma conta?</Text>
                      <TouchableOpacity
                        onPress={() => router.push('/cadastro')}
                        activeOpacity={0.7}
                      >
                        <Text style={[tipografia.body, { color: colors.yellow6 }]}> Cadastre</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>



              </View>
            </View>

            {/* PAINEL DIREITO: Ilustração com Círculos */}
            {isDesktop && (
              <View style={styles.leftPanel}>
                <Image source={require('@/img/logotipo/vittaBlack.svg')}></Image>
              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}