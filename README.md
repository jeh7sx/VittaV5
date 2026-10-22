## 📌 Sobre o Projeto

O **Vitta** é uma plataforma multiplataforma (Web, Android) desenvolvida para apoiar famílias, cuidadores e responsáveis na organização médica de crianças e adolescentes em tratamento contínuo ou rotina preventiva.

A aplicação centraliza o controle de medicamentos prescritos, consultas clínicas, exames laboratoriais/imagem, histórico de laudos e conta com a **Vitta IA**, uma assistente inteligente integrada para esclarecer dúvidas de receitas e apoiar o cronograma familiar.

## ✨ Principais Funcionalidades

### 💊 Gestão Completa de Medicamentos

* Registro de posologia, frequência configurável (horas, dias, semanas ou personalizada) e datas de início/término.

* Cálculo automático de horários futuros e previsão de doses.

* Registro visual de status da dose (*Tomado*, *Próximo*, *Atrasado* ou *Agendado*).

* Associação de clínicas, farmácias e hospitais via geolocalização.

* Armazenamento de fotos de bulas e embalagens com visualizador integrado.

### 📅 Calendário & Compromissos

* Visão mensal e diária integrada da rotina médica.

* Filtro por categorias (medicamentos, consultas e exames agendados).

* Notificações de compromissos para evitar esquecimentos.

### 📁 Arquivo & Gestão de Documentos

* Digitalização e armazenamento de receitas, laudos médicos e exames laboratoriais.

* Categorização em pastas estruturadas com compartilhamento rápido em PDF.

### 👶 Multi-Responsáveis & Perfil

* Acompanhamento simultâneo do mesmo paciente por múltiplos responsáveis (pais, avós, babás).

* Sincronização em tempo real das doses administradas entre dispositivos.

### 🤖 Vitta IA (Assistente Integrada)

* Resumo prático de relatórios médicos e termos técnicos complexos.

* Esclarecimento de dúvidas sobre receitas e horários de posologia.

* Modal de teste e demonstração interativo acessível inclusive na página institucional aberta.

## 🎨 UI/UX & Padrões de Design

* **Responsividade Multi-Dispositivo:** Telas, carrosséis e modais contam com larguras dinâmicas (`useWindowDimensions`), garantindo que em monitores grandes os cards permaneçam centralizados com `maxWidth` controlado e rolagem interna, e adaptando-se sem quebra para tablets e telas móveis.

* **Micro-interações Suaves:** Animações nativas de escala e elevação no hover (`onHoverIn` / `onHoverOut` via `Animated.View`), unificando botões primários (`ButtonPrimary`), secundários (`ButtonSecondary`), pretos e brancos.

* **Tematização Centralizada:** Cores semânticas gerenciadas por `ThemeContext` e escala tipográfica padronizada (`tipografia.ts`).

## 🛠️ Tecnologias Utilizadas

* **Framework Principal:** [React Native](https://reactnative.dev/) com [Expo (SDK 56)](https://expo.dev/)

* **Navegação & Roteamento:** [Expo Router](https://docs.expo.dev/router/introduction/) (arquitetura baseada em pastas)

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)

* **Backend & Autenticação:** [Firebase](https://firebase.google.com/) (Auth, Firestore e Storage)

* **Ícones & Vetores:** SVG integrado via `react-native-svg` e componentes vetoriais customizados

* **Fontes:** Google Fonts (`@expo-google-fonts/inter`)

* **Deploy Web:** [Vercel](https://vercel.com/) / Expo Web Export

## 📂 Estrutura de Pastas

```
├── src/
│   ├── app/                    # Rotas e páginas (Expo Router)
│   │   ├── (user)/             # Rotas autenticadas do usuário
│   │   │   ├── medicamentos.tsx # Painel e modais de medicamentos
│   │   │   ├── calendario.tsx  # Agenda e compromissos
│   │   │   └── ...
│   │   ├── _layout.tsx         # Configuração do Stack e Providers
│   │   ├── index.tsx           # Landing page / Home pública
│   │   └── recursos.tsx        # Página pública institucional (Saiba Mais)
│   ├── components/             # Componentes reutilizáveis
│   │   ├── Buttons/            # ButtonPrimary, ButtonSecondary, ButtonWhite, ButtonBlack
│   │   ├── Modal/              # Modais de sucesso, visualização de fotos, etc.
│   │   ├── PublicNavbar.tsx    # Navbar de navegação pública
│   │   └── VittaIADemoModal.tsx # Demonstração da IA
│   ├── context/                # Contextos globais (ThemeContext, FilhoContext)
│   ├── controllers/            # Controladores de regras de negócio (hooks customizados)
│   ├── hooks/                  # Utilitários de lógica e estado
│   ├── img/                    # Ícones SVG, ilustrações e capturas do app
│   └── styles/                 # Cores globais (colors.ts) e tipografia (tipografia.ts)
├── app.json                    # Metadados e configuração da build Expo
├── package.json
└── tsconfig.json

```

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

* Node.js (versão 18 ou superior)

* Gerenciador de pacotes `npm` ou `yarn`

* Expo Go instalado no smartphone (opcional para testes móveis)

### 1. Clonar o repositório

```
git clone https://github.com/seu-usuario/vitta.git
cd vitta

```

### 2. Instalar dependências

```
npm install

```

### 3. Executar o servidor de desenvolvimento

```
npx expo start ou npm run web 

```

* **Pressione `w`** para abrir no navegador (modo Web).

* **Pressione `a`** para emulador Android ou **`i`** para simulador iOS.

* Escaneie o QR Code no app **Expo Go** no dispositivo físico.

## 📦 Build e Exportação Web (Vercel)

Para compilar a versão web para produção estática:

```
npm run build

```

## 📄 Licença e Créditos

Projeto elaborado pelos autores do Vitta.

Contato para suporte e dúvidas: https://www.instagram.com/jeh7.sx/  &  https://www.instagram.com/\_oliveiral\_/
