export function gerarDosesDoMedicamento(medicamento: any): Date[] {
    if (!medicamento.dataInicio || !medicamento.horario) return [];

    // Parse Data Início
    const [diaI, mesI, anoI] = medicamento.dataInicio.split('/');
    const [hora, min] = medicamento.horario.split(':');
    let doseAtual = new Date(Number(anoI), Number(mesI) - 1, Number(diaI), Number(hora), Number(min));

    // Parse Data Fim (se não tiver, estipula 30 dias de limite para não travar o app)
    let fimTratamento = new Date(doseAtual);
    fimTratamento.setDate(fimTratamento.getDate() + 30); 
    
    if (medicamento.dataTermino) {
        const [diaT, mesT, anoT] = medicamento.dataTermino.split('/');
        fimTratamento = new Date(Number(anoT), Number(mesT) - 1, Number(diaT), 23, 59, 59);
    }

    // Identificar a frequência
    let addHoras = 0;
    let addDias = 0;
    const match = (medicamento.frequencia || '').match(/(\d+)\s*(.*)/);
    
    if (match) {
        const qtd = parseInt(match[1], 10);
        const und = match[2]?.trim();
        
        if (und === 'Horas') addHoras = qtd;
        else if (und === 'Dias') addDias = qtd;
        else if (und === 'Semanas') addDias = qtd * 7;
        else addDias = 1; // Personalizado cai para 1x ao dia no mesmo horário
    } else {
        addDias = 1; 
    }

    const arrayDoses: Date[] = [];

    // Loop que "explode" as doses desde o inicio até o fim
    while (doseAtual <= fimTratamento) {
        arrayDoses.push(new Date(doseAtual));

        if (addHoras > 0) {
            doseAtual.setHours(doseAtual.getHours() + addHoras);
        } else {
            doseAtual.setDate(doseAtual.getDate() + addDias);
        }
    }

    return arrayDoses;
}