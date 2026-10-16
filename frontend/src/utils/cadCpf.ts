export function limparCPF(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function formatarCPF(valor: string): string {
  const cpfLimpo = limparCPF(valor);

  if (cpfLimpo.length <= 3) {
    return cpfLimpo;
  }

  if (cpfLimpo.length <= 6) {
    return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`;
  }

  if (cpfLimpo.length <= 9) {
    return (
      `${cpfLimpo.slice(0, 3)}.` +
      `${cpfLimpo.slice(3, 6)}.` +
      cpfLimpo.slice(6)
    );
  }

  return (
    `${cpfLimpo.slice(0, 3)}.` +
    `${cpfLimpo.slice(3, 6)}.` +
    `${cpfLimpo.slice(6, 9)}-` +
    cpfLimpo.slice(9, 11)
  );
}