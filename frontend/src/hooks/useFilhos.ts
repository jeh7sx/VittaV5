import * as ImagePicker from 'expo-image-picker';
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Alert } from 'react-native';
import {
	addDoc,
	collection,
	doc,
	onSnapshot,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from 'firebase/firestore';

import { useFilho } from '@/context/FilhoContext';
import { auth, db } from '@/services/firebase';
import { registrarLog } from '@/utils/logs';
import { criarNotificacao } from '@/utils/notificacao';
import { notificarAdmin } from '@/utils/notificacaoAdmin';

export type Filho = {
	id: string;
	nome: string;
	idade: number;
	dataNascimento: string;
	tipoNeoplasia: string;
	responsavelId: string;
	responsaveisIds: string[];
	permissoesResponsaveis?: Record<string, any>;
	altura: string;
	peso: string;
	fotoBase64: string;
};

export type FormFilho = Omit<
	Filho,
	'id' | 'idade' | 'responsavelId' | 'responsaveisIds' | 'permissoesResponsaveis'
>;

export type ContadoresFilho = {
	medicamentos: number;
	consultas: number;
	exames: number;
};

export type ClassificacaoIMC = {
	texto: string;
	cor: string;
};

export const FORM_FILHO_VAZIO: FormFilho = {
	nome: '',
	dataNascimento: '',
	tipoNeoplasia: '',
	altura: '',
	peso: '',
	fotoBase64: '',
};

const CONTADORES_VAZIOS: ContadoresFilho = {
	medicamentos: 0,
	consultas: 0,
	exames: 0,
};

export function formatarData(valor: string): string {
	if (!valor) return '';
	const numeros = valor.replace(/\D/g, '').slice(0, 8);
	if (numeros.length <= 2) return numeros;
	if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
	return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

export function formatarAltura(valor: string): string {
	if (!valor) return '';
	const limpo = valor.replace(/[^0-9]/g, '');
	if (!limpo) return '';
	if (limpo.length === 1) return limpo;
	const metros = limpo.slice(0, 1);
	const centimetros = limpo.slice(1, 3);
	return `${metros}.${centimetros}`;
}

export function formatarPeso(valor: string): string {
	if (!valor) return '';
	const limpo = valor.replace(/[^0-9.]/g, '');
	const partes = limpo.split('.');
	if (partes.length > 2) {
		return `${partes[0]}.${partes.slice(1).join('')}`;
	}
	if (partes.length === 2) {
		return `${partes[0].slice(0, 3)}.${partes[1].slice(0, 2)}`;
	}
	return partes[0].slice(0, 3);
}

export function dataValida(valor: string): boolean {
	if (!valor || !/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;
	const [dia, mes, ano] = valor.split('/').map(Number);
	const data = new Date(ano, mes - 1, dia);
	const hoje = new Date();
	hoje.setHours(23, 59, 59, 999);
	return (
		data.getDate() === dia &&
		data.getMonth() === mes - 1 &&
		data.getFullYear() === ano &&
		data <= hoje
	);
}

export function idadeDetalhada(dataNascimento: string): string {
	if (!dataValida(dataNascimento)) return '';
	const [dia, mes, ano] = dataNascimento.split('/').map(Number);
	const hoje = new Date();
	let anos = hoje.getFullYear() - ano;
	let meses = hoje.getMonth() - (mes - 1);

	if (hoje.getDate() < dia) meses--;
	if (meses < 0) {
		anos--;
		meses += 12;
	}
	return `${anos} ${anos === 1 ? 'ano' : 'anos'}, ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}

export function calcularIdadeNumero(dataNascimento: string): number {
	if (!dataValida(dataNascimento)) return 0;
	const [dia, mes, ano] = dataNascimento.split('/').map(Number);
	const hoje = new Date();
	let idade = hoje.getFullYear() - ano;
	const aindaNaoFezAniversario =
		hoje.getMonth() < mes - 1 ||
		(hoje.getMonth() === mes - 1 && hoje.getDate() < dia);

	if (aindaNaoFezAniversario) idade--;
	return idade;
}

// CORREÇÃO CRÍTICA DO ERRO DE .replace
export function calcularIMC(altura?: string | null, peso?: string | null): string {
	if (!altura || !peso) return '—';
	const altStr = String(altura).trim();
	const pesoStr = String(peso).trim();
	if (!altStr || !pesoStr) return '—';

	const alturaNumero = Number(altStr.replace(',', '.'));
	const pesoNumero = Number(pesoStr.replace(',', '.'));
	if (isNaN(alturaNumero) || isNaN(pesoNumero) || alturaNumero <= 0 || pesoNumero <= 0) {
		return '—';
	}
	return (pesoNumero / (alturaNumero * alturaNumero)).toFixed(1);
}

export function classificacaoIMC(imc: string): ClassificacaoIMC {
	const valor = Number(imc);
	if (!Number.isFinite(valor) || isNaN(valor)) return { texto: 'Não informado', cor: '#999999' };
	if (valor < 18.5) return { texto: 'Abaixo do peso', cor: '#1A73E8' };
	if (valor < 25) return { texto: 'Adequado', cor: '#1E8C45' };
	if (valor < 30) return { texto: 'Sobrepeso', cor: '#F7B500' };
	return { texto: 'Obesidade', cor: '#D93025' };
}

function obterMensagemErro(erro: unknown): string {
	if (erro instanceof Error) return erro.message;
	return 'Ocorreu um erro inesperado.';
}

export function useFilhos() {
	const usuario = auth.currentUser;
	const { filhos: listaContext, filhoSelecionado, setFilhoSelecionado, carregandoContext } = useFilho();

	const [filhos, setFilhos] = useState<Filho[]>([]);
	const [carregando, setCarregando] = useState(true);
	const [salvando, setSalvando] = useState(false);

	const [modalCadastro, setModalCadastro] = useState(false);
	const [modalEditar, setModalEditar] = useState(false);
	const [form, setForm] = useState<FormFilho>(FORM_FILHO_VAZIO);
	const [editandoId, setEditandoId] = useState<string | null>(null);
	const [contadores, setContadores] = useState<ContadoresFilho>(CONTADORES_VAZIOS);

	const selecionarFilho = useCallback(
		(filho: Filho) => {
			setFilhoSelecionado({
				id: filho.id,
				nome: filho.nome,
				idade: filho.idade,
				responsavelId: filho.responsavelId,
				responsaveisIds: filho.responsaveisIds,
				permissoesResponsaveis: filho.permissoesResponsaveis,
				fotoBase64: filho.fotoBase64,
			});
		},
		[setFilhoSelecionado],
	);

	useEffect(() => {
		if (!usuario) {
			setFilhos([]);
			setCarregando(false);
			return;
		}

		setCarregando(true);

		const consultaNovoPadrao = query(
			collection(db, 'filhos'),
			where('responsaveisIds', 'array-contains', usuario.uid)
		);

		const consultaLegado = query(
			collection(db, 'filhos'),
			where('responsavelId', '==', usuario.uid)
		);

		const mapearDoc = (d: any): Filho => {
			const dados = d.data();
			const dataNascimento = typeof dados.dataNascimento === 'string' ? dados.dataNascimento : '';
			const listaResponsaveis = Array.isArray(dados.responsaveisIds)
				? dados.responsaveisIds
				: dados.responsavelId
					? [dados.responsavelId]
					: [];

			return {
				id: d.id,
				nome: dados.nome || '',
				idade: typeof dados.idade === 'number' ? dados.idade : calcularIdadeNumero(dataNascimento),
				dataNascimento,
				tipoNeoplasia: dados.tipoNeoplasia || '',
				responsavelId: dados.responsavelId || listaResponsaveis[0] || '',
				responsaveisIds: listaResponsaveis,
				permissoesResponsaveis: dados.permissoesResponsaveis || {},
				altura: dados.altura || '',
				peso: dados.peso || '',
				fotoBase64: dados.fotoBase64 || '',
			};
		};

		let docsArrayContains: Filho[] = [];
		let docsLegado: Filho[] = [];

		const sincronizarListas = () => {
			const map = new Map<string, Filho>();
			[...docsArrayContains, ...docsLegado].forEach((f) => map.set(f.id, f));
			const listaFinal = Array.from(map.values());

			setFilhos(listaFinal);

			// Se ainda não houver nenhum filho selecionado no contexto global, define o primeiro uma única vez
			if (!filhoSelecionado && listaFinal.length > 0) {
				setFilhoSelecionado(listaFinal[0]);
			}

			setCarregando(false);
		};

		const unsub1 = onSnapshot(consultaNovoPadrao, (snap) => {
			docsArrayContains = snap.docs.map(mapearDoc);
			sincronizarListas();
		});

		const unsub2 = onSnapshot(consultaLegado, (snap) => {
			docsLegado = snap.docs.map(mapearDoc);
			sincronizarListas();
		});

		return () => {
			unsub1();
			unsub2();
		};
	}, [usuario?.uid]);

	// Garante que o filho atual respeita estritamente o selecionado
	const filhoAtual = useMemo(() => {
		if (filhos.length === 0) {
			return filhoSelecionado ? (filhoSelecionado as Filho) : null;
		}

		if (filhoSelecionado?.id) {
			const correspondente = filhos.find((f) => f.id === filhoSelecionado.id);
			if (correspondente) return correspondente;
		}

		return filhoSelecionado ? (filhoSelecionado as Filho) : filhos[0] ?? null;
	}, [filhos, filhoSelecionado]);

	useEffect(() => {
		if (!usuario || !filhoAtual) {
			setContadores(CONTADORES_VAZIOS);
			return;
		}

		setContadores(CONTADORES_VAZIOS);
		const colecoes: Array<keyof ContadoresFilho> = ['medicamentos', 'consultas', 'exames'];

		const cancelamentos = colecoes.map((nomeColecao) => {
			const consulta = query(
				collection(db, nomeColecao),
				where('filhoId', '==', filhoAtual.id),
			);

			return onSnapshot(
				consulta,
				(snapshot) => {
					setContadores((estadoAtual) => ({
						...estadoAtual,
						[nomeColecao]: snapshot.size,
					}));
				},
				(erro) => {
					console.error(`Erro ao consultar ${nomeColecao}:`, erro);
				},
			);
		});

		return () => {
			cancelamentos.forEach((cancelar) => cancelar());
		};
	}, [usuario?.uid, filhoAtual?.id]);

	function alterarCampo(campo: keyof FormFilho, valor: string) {
		setForm((estadoAtual) => ({
			...estadoAtual,
			[campo]: valor,
		}));
	}

	function limparFormulario() {
		setForm({ ...FORM_FILHO_VAZIO });
	}

	function validarFormulario(): string | null {
		if (!form.nome.trim()) return 'Informe o nome.';
		if (!dataValida(form.dataNascimento)) return 'Informe uma data de nascimento válida.';
		if (!form.tipoNeoplasia.trim()) return 'Informe o tipo de neoplasia.';

		const alturaInformada = form.altura ? String(form.altura).trim() : '';
		if (alturaInformada && Number(alturaInformada.replace(',', '.')) <= 0) {
			return 'Informe uma altura válida.';
		}

		const pesoInformado = form.peso ? String(form.peso).trim() : '';
		if (pesoInformado && Number(pesoInformado.replace(',', '.')) <= 0) {
			return 'Informe um peso válido.';
		}

		return null;
	}

	function abrirCadastro() {
		setEditandoId(null);
		limparFormulario();
		setModalCadastro(true);
	}

	function fecharCadastro() {
		if (salvando) return;
		setModalCadastro(false);
		limparFormulario();
	}

	function abrirEdicao(filho: Filho) {
		setEditandoId(filho.id);
		setForm({
			nome: filho.nome,
			dataNascimento: filho.dataNascimento,
			tipoNeoplasia: filho.tipoNeoplasia,
			altura: filho.altura,
			peso: filho.peso,
			fotoBase64: filho.fotoBase64,
		});
		setModalEditar(true);
	}

	function fecharEdicao() {
		if (salvando) return;
		setModalEditar(false);
		setEditandoId(null);
		limparFormulario();
	}

	async function salvarCadastro() {
		if (!usuario || salvando) return;
		const erroValidacao = validarFormulario();
		if (erroValidacao) {
			Alert.alert('Atenção', erroValidacao);
			return;
		}

		try {
			setSalvando(true);
			const nomeFormatado = form.nome.trim();

			const novoFilho = await addDoc(collection(db, 'filhos'), {
				...form,
				nome: nomeFormatado,
				tipoNeoplasia: form.tipoNeoplasia.trim(),
				altura: (form.altura || '').trim(),
				peso: (form.peso || '').trim(),
				idade: calcularIdadeNumero(form.dataNascimento),
				responsavelId: usuario.uid,
				responsaveisIds: [usuario.uid],
				permissoesResponsaveis: {
					[usuario.uid]: {
						parentesco: 'mae',
						papel: 'admin',
						nome: usuario.displayName || 'Responsável Titular',
						email: usuario.email || '',
						adicionadoEm: new Date().toISOString(),
					},
				},
				criadoEm: serverTimestamp(),
				atualizadoEm: serverTimestamp(),
			});

			try {
				await criarNotificacao(
					usuario.uid,
					novoFilho.id,
					'Novo Filho',
					`${nomeFormatado} foi cadastrado.`,
				);
			} catch (erroNotificacao) {
				console.error('Erro ao criar notificação:', erroNotificacao);
			}

			await notificarAdmin({
				titulo: 'Novo Dependente Cadastrado',
				descricao: `${nomeFormatado} foi cadastrado como novo filho/dependente.`,
				tipo: 'filho',
			});

			setModalCadastro(false);
			limparFormulario();
			Alert.alert('Sucesso', 'Filho cadastrado com sucesso.');
		} catch (erro: unknown) {
			const mensagem = obterMensagemErro(erro);
			console.error('Erro ao cadastrar filho:', erro);
			try {
				await registrarLog(usuario.uid, 'CADASTRO_FILHO', mensagem);
			} catch (erroLog) {
				console.error('Erro ao registrar log:', erroLog);
			}
			Alert.alert('Erro', 'Não foi possível cadastrar o filho.');
		} finally {
			setSalvando(false);
		}
	}

	async function salvarEdicao() {
		if (!usuario || !editandoId || salvando) return;
		const erroValidacao = validarFormulario();
		if (erroValidacao) {
			Alert.alert('Atenção', erroValidacao);
			return;
		}

		try {
			setSalvando(true);
			await updateDoc(doc(db, 'filhos', editandoId), {
				...form,
				nome: form.nome.trim(),
				tipoNeoplasia: form.tipoNeoplasia.trim(),
				altura: (form.altura || '').trim(),
				peso: (form.peso || '').trim(),
				idade: calcularIdadeNumero(form.dataNascimento),
				atualizadoEm: serverTimestamp(),
			});

			setModalEditar(false);
			setEditandoId(null);
			limparFormulario();
			Alert.alert('Sucesso', 'Dados do filho atualizados.');
		} catch (erro: unknown) {
			const mensagem = obterMensagemErro(erro);
			console.error('Erro ao editar filho:', erro);
			try {
				await registrarLog(usuario.uid, 'EDICAO_FILHO', mensagem);
			} catch (erroLog) {
				console.error('Erro ao registrar log:', erroLog);
			}
			Alert.alert('Erro', 'Não foi possível atualizar os dados do filho.');
		} finally {
			setSalvando(false);
		}
	}

	async function escolherFoto() {
		const resultado = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true,
			aspect: [1, 1], quality: 0.2, base64: true,
		});
		if (!resultado.canceled && resultado.assets[0]?.base64) {
			const tipo = resultado.assets[0].mimeType ?? 'image/jpeg';
			setForm(atual => ({ ...atual, fotoBase64: `data:${tipo};base64,${resultado.assets[0].base64}` }));
		}
	}

	// Tratamento seguro do IMC sem erro quando altura ou peso forem nulos
	const imc = useMemo(() => {
		if (!filhoAtual || !filhoAtual.altura || !filhoAtual.peso) return '—';
		return calcularIMC(filhoAtual.altura, filhoAtual.peso);
	}, [filhoAtual?.altura, filhoAtual?.peso]);

	const imcInfo = useMemo(() => {
		return classificacaoIMC(imc);
	}, [imc]);

	return {
		usuario,
		filhos,
		filhoAtual,
		filhoSelecionado,
		carregando,
		salvando,
		modalCadastro,
		modalEditar,
		form,
		setForm: setForm as Dispatch<SetStateAction<FormFilho>>,
		editandoId,
		contadores,
		imc,
		imcInfo,
		selecionarFilho,
		alterarCampo,
		limparFormulario,
		validarFormulario,
		abrirCadastro,
		fecharCadastro,
		abrirEdicao,
		fecharEdicao,
		salvarCadastro,
		salvarEdicao,
		escolherFoto,
		setModalCadastro,
		setModalEditar,
	};
}