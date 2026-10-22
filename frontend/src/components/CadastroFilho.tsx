import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Platform,
	ScrollView,
	Text,
	TextInput,
	// TextInputProps,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { tipografia } from '@/styles/tipografia';
import ButtonPrimary from './Buttons/ButtonPrimary';
import logoVittaF from '../img/logoVittaFundo.svg';
import { auth, db } from '../services/firebase';
import { registrarLog } from '../utils/logs';
import { criarNotificacao } from '../utils/notificacao';
import { calcularIdadeNumero, dataValida, formatarData, } from '../hooks/useFilhos';
import styles from '../styles/CadFilho';
import { FilhoCadastro, CadastroFilhoProps, CampoProps, } from '../types/filhos';
import { notificarAdmin } from '../utils/notificacaoAdmin';
import { colors } from '@/styles/colors';
import ButtonSecondary from './Buttons/ButtonSecondary';

const FILHO_VAZIO: FilhoCadastro = {
	nome: '',
	dataNascimento: '',
	tipoNeoplasia: '',
};
/**
 * Tela de cadastro isolada e pronta para ser reutilizada dentro de um Modal.
 * Não possui Header, Sidebar, navegação ou dependência do contexto de filhos.
 */
export default function CadastroFilho({
	onConcluir,
	onCancelar,
	mostrarCancelar = false,
}: CadastroFilhoProps) {
	const { width, height } = useWindowDimensions();
	const compacto = width < 700;

	const [filhos, setFilhos] = useState<FilhoCadastro[]>([{ ...FILHO_VAZIO }]);
	const [salvando, setSalvando] = useState(false);

	const formularioValido = useMemo(
		() => filhos.every(filho =>
			filho.nome.trim().length >= 2 &&
			dataValida(filho.dataNascimento) &&
			filho.tipoNeoplasia.trim().length >= 2
		),
		[filhos],
	);

	const { theme } = useTheme();

	function atualizarFilho(
		index: number,
		campo: keyof FilhoCadastro,
		valor: string,
	) {
		setFilhos(atuais => atuais.map((filho, i) =>
			i === index ? { ...filho, [campo]: valor } : filho,
		));
	}

	function adicionarOutroFilho() {
		const atual = filhos[filhos.length - 1];
		if (!atual.nome.trim() || !dataValida(atual.dataNascimento) || !atual.tipoNeoplasia.trim()) {
			Alert.alert('Atenção', 'Preencha corretamente os dados atuais antes de adicionar outro filho.');
			return;
		}
		setFilhos(atuais => [...atuais, { ...FILHO_VAZIO }]);
	}

	function removerFilho(index: number) {
		if (filhos.length === 1) return;
		setFilhos(atuais => atuais.filter((_, i) => i !== index));
	}

	async function cadastrarFilhos() {
		const usuario = auth.currentUser;
		if (!usuario) {
			Alert.alert('Sessão expirada', 'Entre novamente para cadastrar um filho.');
			return;
		}
		if (!formularioValido) {
			Alert.alert(
				'Dados incompletos',
				'Preencha nome, uma data de nascimento válida e o tipo de neoplasia de cada filho.',
			);
			return;
		}

		setSalvando(true);
		const ids: string[] = [];

		try {
			// Mantém o mesmo padrão do cadastro original. Cada filho é um documento.
			for (const filho of filhos) {
				const novoDoc = await addDoc(collection(db, 'filhos'), {
					nome: filho.nome.trim(),
					dataNascimento: filho.dataNascimento,
					idade: calcularIdadeNumero(filho.dataNascimento),
					tipoNeoplasia: filho.tipoNeoplasia.trim(),
					altura: '',
					peso: '',
					fotoBase64: '',
					responsavelId: usuario.uid,
					criadoEm: serverTimestamp(),
					atualizadoEm: serverTimestamp(),
				});

				ids.push(novoDoc.id);
				await criarNotificacao(
					usuario.uid,
					novoDoc.id,
					'Novo Filho',
					`${filho.nome.trim()} foi cadastrado.`,
				);
			}

			setFilhos([{ ...FILHO_VAZIO }]);
			onConcluir?.(ids);
		} catch (erro: any) {
			await registrarLog(usuario.uid, 'CADASTRO_FILHO', erro?.message ?? 'Erro desconhecido');
			Alert.alert('Erro', erro?.message ?? 'Não foi possível concluir o cadastro.');
		} finally {
			setSalvando(false);
		}

		await notificarAdmin({
			titulo: 'Novo Dependente Cadastrado',
			descricao: `${filhos[0].nome.trim()} foi cadastrado pelo responsável.`,
			tipo: 'filho',
		});
	}

	return (
		<View style={styles.pagina}>
			

			<ScrollView
				style={{ width: '100%' }}
				contentContainerStyle={{
					minHeight: height,
					justifyContent: 'center',
					alignItems: 'center',
					paddingHorizontal: compacto ? 16 : 32,
					paddingVertical: 34,
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={[styles.card, compacto && styles.cardCompacto]}>
					<View style={{ marginBottom: 32 }}>
						<Text style={[tipografia.h2, { marginBottom: 16 }]}>
							Cadastre uma Criança ou adolescente

						</Text>

						{filhos.map((filho, index) => (
							<View key={index} style={index > 0 ? styles.filhoAdicional : undefined}>
								{filhos.length > 1 && (
									<View style={styles.cabecalhoFilho}>
										<Text style={styles.numeroFilho}>Filho(a) {index + 1}</Text>
										{index > 0 && (
											<TouchableOpacity onPress={() => removerFilho(index)} disabled={salvando}>
												<Text style={styles.remover}>Remover</Text>
											</TouchableOpacity>
										)}
									</View>
								)}

								<Campo
									label="Nome"
									placeholder="Ex: Jeferson Silva"
									value={filho.nome}
									onChangeText={valor => atualizarFilho(index, 'nome', valor)}
									editable={!salvando}
								/>
								<Campo
									label="Data de nascimento"
									placeholder="Ex: 01/08/2008"
									value={filho.dataNascimento}
									onChangeText={valor => atualizarFilho(index, 'dataNascimento', formatarData(valor))}
									keyboardType="numeric"
									maxLength={10}
									editable={!salvando}
								/>
								<Campo
									label="Tipo de Câncer"
									placeholder="Ex: Leucemia"
									value={filho.tipoNeoplasia}
									onChangeText={valor => atualizarFilho(index, 'tipoNeoplasia', valor)}
									editable={!salvando}
								/>
							</View>
						))}
						<ButtonSecondary
							texto='Adicionar outro filho'
							onPress={adicionarOutroFilho}

						>

						</ButtonSecondary>

					</View>
					<View style={styles.acoes}>
						{mostrarCancelar && (
							<TouchableOpacity
								onPress={onCancelar}
								disabled={salvando}
								style={styles.botaoCancelar}
							>
								<Text style={styles.textoCancelar}>Cancelar</Text>
							</TouchableOpacity>
						)}

					</View>

					<ButtonPrimary
						texto={salvando ? (
							<ActivityIndicator size="small" color="#222" />
						) :
							'Cadastrar'

						}
						onPress={cadastrarFilhos}
						icone={require('@/img/icons/add-01.svg')}
						style={{ width: '100%' }}
					>

					</ButtonPrimary>
				</View>
			</ScrollView>
		</View>
	);
}

function Campo({
	label,
	style,
	...inputProps
}: CampoProps) {
	return (

		<View style={{ gap: 4, marginBottom: 16 }}>
			<Text style={tipografia.body}>{label}</Text>

			<TextInput
				{...inputProps}
				placeholderTextColor={colors.gray4}
				style={[styles.input, style]}
			/>
		</View>


	);
}

function Circulo({ tamanho, ...posicao }: any) {
	const { opacidade, ...resto } = posicao;
	return (
		<View
			style={{
				position: 'absolute',
				width: tamanho,
				height: tamanho,
				borderRadius: tamanho / 2,
				backgroundColor: `rgba(255, 244, 194, ${opacidade})`,
				...resto,
			}}
		/>
	);
}