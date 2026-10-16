import {
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
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import LogoVittaF from '../../img/logoVittaFundo.svg';
import { styles } from '../../styles/app/(auth)/cadastro';
import { Ionicons } from '@expo/vector-icons';
// import Input from '@/components/Forms/input'
import { tipografia } from '@/styles/tipografia';
import { colors } from '@/styles/colors';
// Botões
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonBlack from '@/components/Buttons/ButtonBlack';
import ButtonWhite from '@/components/Buttons/ButtonWhite';

export default function Cadastro() {
  const {
    nome,
    setNome,
    cpf,
    setCpf,
    email,
    setEmail,
    senha,
    setSenha,
    confirmarSenha,
    setConfirmarSenha,
    mostrarSenha,
    setMostrarSenha,
    mostrarConfirmarSenha,
    setMostrarConfirmarSenha,
    carregando,
    erros,
    limparErro,
    signUp,
  } = useAuth();

  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  // Intercepta a tecla Enter na Web e no Mobile
  function handleKeyPress(e: any) {
    if (e.key === 'Enter' || e.nativeEvent?.key === 'Enter') {
      signUp();
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={isDesktop ? styles.conteudoDesktop : styles.conteudoMobile}>
            {/* PAINEL DIREITO: Card Branco Flutuante */}
            <View style={styles.leftPanel}>
              <View
                style={[
                  styles.cardFormulario,
                  !isDesktop && styles.cardFormularioMobile,
                ]}
              >
                {/*Logo + Título*/}
                {/*<View style={styles.logoWrapper}>
                  <img src={LogoVittaF} alt="Logo Vitta" style={{ width: 34, height: 34 }} />
                  <Text style={tipografia.h2}>Vitta</Text>
                  <Text style={tipografia.h2}>.</Text>
                </View>*/}
                <View style={{ marginBottom: 16, gap: 8 }}>
                  <Text style={tipografia.h1}>Crie uma conta</Text>
                  <Text style={[tipografia.body, { color: colors.gray4 }]}>
                    Comece a organizar o cuidado com mais tranquilidade.
                  </Text>
                </View>

                {/* Formulário e botões */}
                <View style={{ gap: 32 }}>
                  <View>
                    {/* Nome completo */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>Nome completo</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          erros.nome && styles.inputErro,
                        ]}
                      >
                        <Image source={require('@/img/icons/user.svg')}></Image>

                        <TextInput
                          placeholder="Ex: João Silva Alves"
                          placeholderTextColor={colors.gray4}
                          value={nome}
                          onChangeText={(v) => {
                            setNome(v);
                            limparErro('nome');
                          }}
                          autoCapitalize="words"
                          returnKeyType="next"
                          // @ts-ignore
                          onKeyDown={handleKeyPress}
                          onKeyPress={handleKeyPress}
                          style={[
                            styles.inputWithIcon,
                            tipografia.bodySecondary,
                          ]}
                        />
                      </View>

                      {erros.nome && (
                        <Text style={styles.textoErro}>
                          {erros.nome}
                        </Text>
                      )}
                    </View>
                    {/* CPF */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>CPF</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          erros.cpf && styles.inputErro,
                        ]}
                      >
                        <Image source={require('@/img/icons/identity-card.svg')} style={{ width: 24, height: 24, tintColor: colors.gray3 }}></Image>

                        <TextInput
                          placeholder="000.000.000-00"
                          placeholderTextColor={colors.gray4}
                          value={cpf}
                          onChangeText={(texto) => {
                            setCpf(texto);
                            limparErro('cpf');
                          }}
                          keyboardType="numeric"
                          maxLength={14}
                          returnKeyType="next"
                          // @ts-ignore
                          onKeyDown={handleKeyPress}
                          onKeyPress={handleKeyPress}
                          style={[
                            styles.inputWithIcon,
                            tipografia.bodySecondary,
                          ]}
                        />
                      </View>

                      {erros.cpf && (
                        <Text style={styles.textoErro}>
                          {erros.cpf}
                        </Text>
                      )}
                    </View>
                    {/* Email */}
                    {/* Email */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>Email</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          erros.email && styles.inputErro,
                        ]}
                      >
                        <Image source={require('@/img/icons/mail-01.svg')} style={{ width: 24, height: 24, tintColor: colors.gray3 }}></Image>

                        <TextInput
                          placeholder="Ex: joao.silva@gmail.com"
                          placeholderTextColor={colors.gray4}
                          value={email}
                          onChangeText={(v) => {
                            setEmail(v);
                            limparErro('email');
                          }}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="next"
                          // @ts-ignore
                          onKeyDown={handleKeyPress}
                          onKeyPress={handleKeyPress}
                          style={[
                            styles.inputWithIcon,
                            tipografia.bodySecondary,
                          ]}
                        />
                      </View>

                      {erros.email && (
                        <Text style={styles.textoErro}>
                          {erros.email}
                        </Text>
                      )}
                    </View>

                    {/* Senha */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>Senha</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          erros.senha && styles.inputErro,
                        ]}
                      >
                        <Image source={require('@/img/icons/key-01.svg')} style={{ width: 24, height: 24, tintColor: colors.gray3 }}></Image>

                        <TextInput
                          placeholder="Insira 8 ou mais caracteres"
                          placeholderTextColor={colors.gray4}
                          secureTextEntry={!mostrarSenha}
                          value={senha}
                          onChangeText={(v) => {
                            setSenha(v);
                            limparErro('senha');
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="next"
                          // @ts-ignore
                          onKeyDown={handleKeyPress}
                          onKeyPress={handleKeyPress}
                          style={[
                            styles.inputWithIcon,
                            styles.passwordInput,
                            tipografia.bodySecondary,
                          ]}
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
                              width: 22,
                              height: 22,
                            }}
                          />
                        </TouchableOpacity>
                      </View>

                      {erros.senha && (
                        <Text style={[tipografia.body, { color: 'red' }]}>
                          {erros.senha}
                        </Text>
                      )}
                    </View>
                    {/* Confirmar Senha */}
                    <View style={styles.fieldGroup}>
                      <Text style={tipografia.body}>Confirmar Senha</Text>

                      <View
                        style={[
                          styles.inputWrapper,
                          erros.confirmarSenha && styles.inputErro,
                        ]}
                      >
                        <Image source={require('@/img/icons/key-01.svg')} style={{ width: 24, height: 24, tintColor: colors.gray3 }}></Image>

                        <TextInput
                          placeholder="Repita sua senha"
                          placeholderTextColor={colors.gray4}
                          secureTextEntry={!mostrarConfirmarSenha}
                          value={confirmarSenha}
                          onChangeText={(v) => {
                            setConfirmarSenha(v);
                            limparErro('confirmarSenha');
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="go"
                          onSubmitEditing={signUp}
                          // @ts-ignore
                          onKeyDown={handleKeyPress}
                          onKeyPress={handleKeyPress}
                          style={[
                            styles.inputWithIcon,
                            styles.passwordInput,
                            tipografia.bodySecondary,
                          ]}
                        />

                        <TouchableOpacity
                          onPress={() =>
                            setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                          }
                          style={styles.eyeButton}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={
                              mostrarConfirmarSenha
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

                      {erros.confirmarSenha && (
                        <Text style={[tipografia.body, { color: 'red' }]}>
                          {erros.confirmarSenha}
                        </Text>
                      )}
                    </View>
                  </View>
                  {/* Botões */}
                  <View style={{ gap: 16 }}>
                    <ButtonPrimary
                      // disabled={carregando}
                      texto={carregando ? 'Criando conta...' : 'Criar conta'}
                      onPress={signUp}
                      icone={require('@/img/icons/setaDireita.svg')}
                      style={{
                       
                        width: '100%'
                      }}
                    />
                    {/* Footer */}
                    <View style={styles.footer}>
                      <Text style={tipografia.body}>Já possui uma conta?</Text>
                      <TouchableOpacity
                        onPress={() => router.push('/login')}
                        activeOpacity={0.7}
                      >
                        <Text style={[tipografia.body, { color: colors.yellow6 }]}> Entre</Text>
                      </TouchableOpacity>
                    </View>
                  </View>



                </View>

              </View>
            </View>

            {/* PAINEL ESQUERDO: Ilustração Proporcional */}
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