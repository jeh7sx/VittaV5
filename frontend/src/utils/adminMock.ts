import { IndicadoresDashboard, IndicadoresUsuarios, PeriodoDashboard, PontoSerie, UsuarioAdmin } from '../types/admin';

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function obterIndicadoresDashboardMock(): IndicadoresDashboard {
  return {
    usuariosCadastrados: 50,
    usuariosVariacaoPercentual: 12,
    criancasCadastradas: 30,
    criancasVariacaoPercentual: 15,
  };
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function obterSerieUsuariosMock(periodo: PeriodoDashboard): PontoSerie[] {
  switch (periodo) {
    case '7dias':
      return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((rotulo, i) => ({
        rotulo,
        valor: [1180, 1210, 1225, 1260, 1280, 1300, 1320][i],
      }));
    case '30dias':
      return MESES.map((rotulo, i) => ({
        rotulo,
        valor: [620, 680, 760, 900, 970, 1010, 1080, 1150, 1330, 1420, 1480, 1470][i],
      }));
    case '6meses':
      return ['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago'].map((rotulo, i) => ({
        rotulo,
        valor: [760, 900, 970, 1010, 1080, 1150][i],
      }));
    case '1ano':
    default:
      return MESES.map((rotulo, i) => ({
        rotulo,
        valor: [300, 420, 500, 610, 700, 780, 860, 950, 1080, 1220, 1400, 1500][i],
      }));
  }
}

// ─── Usuários ───────────────────────────────────────────────────────────────

export function obterIndicadoresUsuariosMock(): IndicadoresUsuarios {
  return {
    totalUsuarios: 50,
    usuariosAtivos: 24,
    novosEsteMes: 2,
    bloqueados: 1,
  };
}

const NOMES_EXTRA = [
  'Ana Beatriz', 'Carlos Eduardo', 'Fernanda Lima', 'Gustavo Souza', 'Helena Martins',
  'Igor Almeida', 'Juliana Costa', 'Kaique Ferreira', 'Larissa Pinto', 'Marcos Vinícius',
  'Natália Rocha', 'Otávio Barbosa', 'Patrícia Nunes', 'Rafael Teixeira', 'Sabrina Ramos',
  'Thiago Moreira', 'Vanessa Dias', 'William Cardoso', 'Yasmin Correia', 'Bruno Cavalcanti',
  'Camila Azevedo', 'Diego Farias', 'Elaine Batista', 'Felipe Nogueira', 'Gabriela Xavier',
  'Henrique Duarte', 'Isabela Freitas', 'João Pedro', 'Karina Vieira', 'Leandro Castro',
  'Mariana Borges', 'Nicolas Andrade', 'Olívia Peixoto', 'Paulo Ribeiro', 'Renata Guimarães',
  'Sérgio Monteiro', 'Tatiane Lopes', 'Vitor Hugo', 'Amanda Siqueira', 'Bernardo Melo',
  'Débora Sales', 'Eduardo Prado', 'Fabíola Reis', 'Gilberto Tavares',
];

function gerarEmail(nome: string, indice: number): string {
  const base = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
  return `${base}${indice}@gmail.com`;
}

export function obterUsuariosMock(): UsuarioAdmin[] {
  const base: UsuarioAdmin[] = [
    { id: 'u1', nome: 'Lucas Gabriel', email: 'lucas23@gmail.com', nascimento: '01/12/2007', cpf: '324.566.788-09', status: 'ativo' },
    { id: 'u2', nome: 'Pedro Henrique', email: 'henriquepedro@gmail.com', nascimento: '01/12/2007', cpf: '324.566.788-09', status: 'ativo' },
    { id: 'u3', nome: 'Maria Clara', email: 'maria123@gmail.com', nascimento: '01/12/2007', cpf: '324.566.788-09', status: 'bloqueado' },
    { id: 'u4', nome: 'Roberto Carlos', email: 'carlos.ro408@gmail.com', nascimento: '01/12/2007', cpf: '324.566.788-09', status: 'ativo' },
    { id: 'u5', nome: 'Jéssica Santos Alves', email: 'je.santos@gmail.com', nascimento: '01/12/2007', cpf: '324.566.788-09', status: 'ativo' },
  ];

  const extras: UsuarioAdmin[] = NOMES_EXTRA.map((nome, i) => ({
    id: `u${i + 6}`,
    nome,
    email: gerarEmail(nome, i + 6),
    nascimento: `${String((i % 27) + 1).padStart(2, '0')}/${String((i % 12) + 1).padStart(2, '0')}/${1985 + (i % 20)}`,
    cpf: `${String(300 + i).padStart(3, '0')}.${String(100 + i).padStart(3, '0')}.${String(200 + i).padStart(3, '0')}-${String(i % 90).padStart(2, '0')}`,
    status: 'ativo',
  }));

  return [...base, ...extras];
}