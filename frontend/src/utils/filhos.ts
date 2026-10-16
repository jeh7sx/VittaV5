export function formatarData(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function dataValida(valor: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    return false;
  }

  const [dia, mes, ano] = valor.split('/').map(Number);

  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  hoje.setHours(23, 59, 59, 999);

  return (
    data.getDate() === dia &&
    data.getMonth() === mes - 1 &&
    data.getFullYear() === ano &&
    data <= hoje &&
    ano >= 1900
  );
}

export function calcularIdadeNumero(
  dataNascimento: string,
): number {
  if (!dataValida(dataNascimento)) {
    return 0;
  }

  const [dia, mes, ano] = dataNascimento
    .split('/')
    .map(Number);

  const hoje = new Date();
  let idade = hoje.getFullYear() - ano;

  const aindaNaoFezAniversario =
    hoje.getMonth() < mes - 1 ||
    (
      hoje.getMonth() === mes - 1 &&
      hoje.getDate() < dia
    );

  if (aindaNaoFezAniversario) {
    idade--;
  }

  return idade;
}