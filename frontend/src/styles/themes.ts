export type PaletaId = 'vermelho' | 'ouro' | 'lavanda' | 'menta' | 'oceano' | 'pessego';
export type ModoTema = 'claro' | 'escuro';

export interface ThemeColors {
	id: string;
	paletaId: PaletaId;
	modo: ModoTema;
	nome: string;
	corDestaque: string; // Para prévia no seletor

	bg: string;
	cardBg: string;
	white: string;
	black: string;
	textPrimary: string;
	textSecondary: string;
	border: string;
	inputBg: string;

	gray5: string;
	gray4: string;
	gray3: string;
	gray1: string;

	// Cores de Ação Principal (substituem o amarelo/amarelo-ouro dependendo do tema)
	yellow1: string;
	yellow2: string;
	yellow5: string;
	yellow6: string;
	yellow7: string;
	yellow9: string;

	Med: string;
	bgMed: string;
	Consul: string;
	bgConsul: string;
	Exame: string;
	bgExame: string;
	Calendario: string;
	bgCalendario: string;
	Filhos: string;
	bgFilhos: string;

	delete: string;

}

export const PALETAS_INFO: { id: PaletaId; nome: string; cor: string }[] = [
	{ id: 'ouro', nome: 'Vitta Ouro', cor: '#F59E0B' },
	{ id: 'vermelho', nome: 'Vermelho Rubi', cor: '#E11D48' },
	{ id: 'lavanda', nome: 'Lavanda', cor: '#8B5CF6' },
	{ id: 'menta', nome: 'Menta & Esmeralda', cor: '#10B981' },
	{ id: 'oceano', nome: 'Oceano Azul', cor: '#2563EB' },
	{ id: 'pessego', nome: 'Pêssego & Coral', cor: '#F97316' },
];

export function gerarTema(paleta: PaletaId, modo: ModoTema): ThemeColors {
	const isDark = modo === 'escuro';

	const baseNeutros = isDark
		? {
			bg: '#121212',
			cardBg: '#1E1E1E',
			white: '#1E1E1E',
			black: '#F5F5F5',
			textPrimary: '#F3F4F6',
			textSecondary: '#A0A0A0',
			border: '#2C2C2C',
			inputBg: '#262626',
			gray5: '#CCCCCC',
			gray4: '#A0A0A0',
			gray3: '#757575',
			gray1: '#2C2C2C',
			delete: '#C31F1F',
		}
		: {
			bg: '#F4F4F4',
			cardBg: '#FFFFFF',
			white: '#FFFFFF',
			black: '#1D1D1D',
			textPrimary: '#1D1D1D',
			textSecondary: '#6C6C6C',
			border: '#EDEDED',
			inputBg: '#F8F9FA',
			gray5: '#4A4A4A',
			gray4: '#777777',
			gray3: '#9E9E9E',
			gray1: '#EDEDED',
			delete: '#C31F1F',
		};

	switch (paleta) {
		case 'ouro':
			return {
				...baseNeutros,
				id: `ouro_${modo}`,
				paletaId: 'ouro',
				modo,
				nome: `Vitta Ouro (${isDark ? 'Escuro' : 'Claro'})`,
				corDestaque: '#F59E0B',
				yellow1: isDark ? '#2E220F' : '#FFF7EB',
				yellow2: isDark ? '#4A3716' : '#F3E5C4',
				yellow5: '#F8B137',
				yellow6: '#D99A00',
				yellow7: '#A86B00',
				yellow9: isDark ? '#FFE082' : '#452D03',
				Med: '#B25900',
				bgMed: isDark ? '#2C1D0F' : '#FFF4E9',
				Consul: '#5E147E',
				bgConsul: isDark ? '#2A1733' : '#F9EBFF',
				Exame: '#1A9494',
				bgExame: isDark ? '#DFFFFF' : '#F4FFFF',
				Calendario: '#0F677B',
				bgCalendario: isDark ? '#0E2830' : '#f6feff',
				Filhos: '#0F267B',
				bgFilhos: isDark ? '#161B30' : '#E9EEFF',
			};

		case 'vermelho':
			return {
				...baseNeutros,
				id: `vermelho_${modo}`,
				paletaId: 'vermelho',
				modo,
				nome: `Vermelho Rubi (${isDark ? 'Escuro' : 'Claro'})`,
				corDestaque: '#E11D48',
				yellow1: isDark ? '#2D0E14' : '#FFF1F2',
				yellow2: isDark ? '#4A1520' : '#FFE4E6',
				yellow5: '#E11D48',
				yellow6: '#BE123C',
				yellow7: '#9F1239',
				yellow9: isDark ? '#FDA4AF' : '#881337',
				Med: '#F59E0B',
				bgMed: isDark ? '#2B1A0A' : '#FEF3C7',
				Consul: '#8B5CF6',
				bgConsul: isDark ? '#231438' : '#F3E8FF',
				Exame: '#2563EB',
				bgExame: isDark ? '#0F1E38' : '#DBEAFE',
				Calendario: '#059669',
				bgCalendario: isDark ? '#0C261A' : '#D1FAE5',
				Filhos: '#BE123C',
				bgFilhos: isDark ? '#3D0F18' : '#FFE4E6',
			};

		case 'lavanda':
			return {
				...baseNeutros,
				id: `lavanda_${modo}`,
				paletaId: 'lavanda',
				modo,
				nome: `Lavanda (${isDark ? 'Escuro' : 'Claro'})`,
				corDestaque: '#8B5CF6',
				yellow1: isDark ? '#1E1436' : '#F4EEFC',
				yellow2: isDark ? '#34215E' : '#E7DCF8',
				yellow5: '#8B5CF6',
				yellow6: '#7C3AED',
				yellow7: '#6D28D9',
				yellow9: isDark ? '#DDD6FE' : '#3B1379',
				Med: '#D97706',
				bgMed: isDark ? '#2E1A08' : '#FEF3C7',
				Consul: '#7C3AED',
				bgConsul: isDark ? '#271242' : '#F3E8FF',
				Exame: '#2563EB',
				bgExame: isDark ? '#0E1E3B' : '#DBEAFE',
				Calendario: '#059669',
				bgCalendario: isDark ? '#0A2419' : '#D1FAE5',
				Filhos: '#6D28D9',
				bgFilhos: isDark ? '#25103E' : '#EDE9FE',
			};

		case 'menta':
			return {
				...baseNeutros,
				id: `menta_${modo}`,
				paletaId: 'menta',
				modo,
				nome: `Menta (${isDark ? 'Escuro' : 'Claro'})`,
				corDestaque: '#10B981',
				yellow1: isDark ? '#0C261B' : '#E8F6EF',
				yellow2: isDark ? '#173D2C' : '#CEECDF',
				yellow5: '#10B981',
				yellow6: '#059669',
				yellow7: '#047857',
				yellow9: isDark ? '#A7F3D0' : '#064E3B',
				Med: '#E11D48',
				bgMed: isDark ? '#330D16' : '#FFE4E6',
				Consul: '#059669',
				bgConsul: isDark ? '#0C2B1D' : '#D1FAE5',
				Exame: '#0284C7',
				bgExame: isDark ? '#0A2536' : '#E0F2FE',
				Calendario: '#D97706',
				bgCalendario: isDark ? '#301B08' : '#FEF3C7',
				Filhos: '#047857',
				bgFilhos: isDark ? '#0B291C' : '#CCFBF1',
			};

		case 'oceano':
			return {
				...baseNeutros,
				id: `oceano_${modo}`,
				paletaId: 'oceano',
				modo,
				nome: `Oceano (${isDark ? 'Escuro' : 'Claro'})`,
				corDestaque: '#2563EB',
				yellow1: isDark ? '#0F1F38' : '#EAF2FB',
				yellow2: isDark ? '#19335E' : '#CFE2F7',
				yellow5: '#2563EB',
				yellow6: '#1D4ED8',
				yellow7: '#1E40AF',
				yellow9: isDark ? '#BFDBFE' : '#172554',
				Med: '#EA580C',
				bgMed: isDark ? '#331508' : '#FFEDD5',
				Consul: '#9333EA',
				bgConsul: isDark ? '#2B0E47' : '#F3E8FF',
				Exame: '#0284C7',
				bgExame: isDark ? '#0A273B' : '#E0F2FE',
				Calendario: '#0D9488',
				bgCalendario: isDark ? '#092B27' : '#CCFBF1',
				Filhos: '#1D4ED8',
				bgFilhos: isDark ? '#12264C' : '#DBEAFE',
			};

		case 'pessego':
			return {
				...baseNeutros,
				id: `pessego_${modo}`,
				paletaId: 'pessego',
				modo,
				nome: `Pêssego (${isDark ? 'Escuro' : 'Claro'})`,
				corDestaque: '#F97316',
				yellow1: isDark ? '#2E150A' : '#FCEEE8',
				yellow2: isDark ? '#4D2412' : '#F8D8CB',
				yellow5: '#F97316',
				yellow6: '#EA580C',
				yellow7: '#C2410C',
				yellow9: isDark ? '#FED7AA' : '#431407',
				Med: '#C026D3',
				bgMed: isDark ? '#330B38' : '#FAE8FF',
				Consul: '#EA580C',
				bgConsul: isDark ? '#3B180A' : '#FFEDD5',
				Exame: '#2563EB',
				bgExame: isDark ? '#0C1C38' : '#DBEAFE',
				Calendario: '#16A34A',
				bgCalendario: isDark ? '#0B2B16' : '#DCFCE7',
				Filhos: '#C2410C',
				bgFilhos: isDark ? '#3B170B' : '#FFE4E6',
			};
	}
}