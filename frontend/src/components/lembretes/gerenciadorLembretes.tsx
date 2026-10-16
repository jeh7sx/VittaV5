import React, { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '@/services/firebase';
import { useFilho } from '@/context/FilhoContext';
import ModalLembreteMedicamento from './lembreteMedicamentos';
import ModalLembreteConsulta from './lembreteConsulta';
import ModalLembreteExame from './lembreteExame';
import { Medicamento } from '@/hooks/useMedicamentos';
import { Consulta } from '@/hooks/useConsultas';
import { Exame } from '@/hooks/useExames';

const STORAGE_LEMBRETES_KEY = '@vitta_preferencias_lembretes';

type TipoModalAtivo = 'nenhum' | 'medicamento' | 'consulta' | 'exame';

interface PreferenciasLembretes {
  medicamentos: boolean;
  consultas: boolean;
  exames: boolean;
}

export default function GerenciadorLembretes() {
  const { filhoSelecionado } = useFilho();
  const usuario = auth.currentUser;

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);

  // Preferências do utilizador
  const [prefs, setPrefs] = useState<PreferenciasLembretes>({
    medicamentos: true,
    consultas: true,
    exames: true,
  });

  const [modalAtivo, setModalAtivo] = useState<TipoModalAtivo>('nenhum');

  // Carrega as preferências do storage
  const carregarPreferencias = useCallback(async () => {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(STORAGE_LEMBRETES_KEY);
      }
      if (!raw) {
        raw = await AsyncStorage.getItem(STORAGE_LEMBRETES_KEY);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefs({
          medicamentos: parsed.medicamentos ?? true,
          consultas: parsed.consultas ?? true,
          exames: parsed.exames ?? true,
        });
      }
    } catch (err) {
      console.error('Erro ao ler preferências de lembretes:', err);
    }
  }, []);

  useEffect(() => {
    carregarPreferencias();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleStorageChange = () => carregarPreferencias();
      window.addEventListener('vitta_lembretes_alterados', handleStorageChange);
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('vitta_lembretes_alterados', handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [carregarPreferencias]);

  // Escuta dados do Firestore
  useEffect(() => {
    if (!usuario?.uid || !filhoSelecionado?.id) {
      setMedicamentos([]);
      setConsultas([]);
      setExames([]);
      return;
    }

    const qMed = query(
      collection(db, 'medicamentos'),
      where('responsavelId', '==', usuario.uid),
      where('filhoId', '==', filhoSelecionado.id)
    );
    const unsubMed = onSnapshot(qMed, (snap) => {
      setMedicamentos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Medicamento)));
    });

    const qCons = query(
      collection(db, 'consultas'),
      where('responsavelId', '==', usuario.uid),
      where('filhoId', '==', filhoSelecionado.id)
    );
    const unsubCons = onSnapshot(qCons, (snap) => {
      setConsultas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Consulta)));
    });

    const qEx = query(
      collection(db, 'exames'),
      where('responsavelId', '==', usuario.uid),
      where('filhoId', '==', filhoSelecionado.id)
    );
    const unsubEx = onSnapshot(qEx, (snap) => {
      setExames(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exame)));
    });

    return () => {
      unsubMed();
      unsubCons();
      unsubEx();
    };
  }, [usuario?.uid, filhoSelecionado?.id]);

  // Função para determinar o primeiro da fila respeitando as preferências
  function obterProximoModal(aPartirDe: TipoModalAtivo): TipoModalAtivo {
    if (aPartirDe === 'nenhum') {
      if (prefs.medicamentos && medicamentos.length > 0) return 'medicamento';
      if (prefs.consultas && consultas.length > 0) return 'consulta';
      if (prefs.exames && exames.length > 0) return 'exame';
      return 'nenhum';
    }

    if (aPartirDe === 'medicamento') {
      if (prefs.consultas && consultas.length > 0) return 'consulta';
      if (prefs.exames && exames.length > 0) return 'exame';
      return 'nenhum';
    }

    if (aPartirDe === 'consulta') {
      if (prefs.exames && exames.length > 0) return 'exame';
      return 'nenhum';
    }

    return 'nenhum';
  }

  // Inicializa a fila apenas quando chegam dados e não há modal ativo
  useEffect(() => {
    if (modalAtivo === 'nenhum') {
      const proximo = obterProximoModal('nenhum');
      if (proximo !== 'nenhum') {
        setModalAtivo(proximo);
      }
    }
  }, [medicamentos.length, consultas.length, exames.length, prefs.medicamentos, prefs.consultas, prefs.exames]);

  // Se o usuário desativar nas configurações o tipo que está em exibição, avança para o próximo
  useEffect(() => {
    if (modalAtivo === 'medicamento' && !prefs.medicamentos) {
      setModalAtivo(obterProximoModal('medicamento'));
    } else if (modalAtivo === 'consulta' && !prefs.consultas) {
      setModalAtivo(obterProximoModal('consulta'));
    } else if (modalAtivo === 'exame' && !prefs.exames) {
      setModalAtivo(obterProximoModal('exame'));
    }
  }, [prefs.medicamentos, prefs.consultas, prefs.exames]);

  async function marcarDose(medId: string, timestamp: number) {
    await updateDoc(doc(db, 'medicamentos', medId), {
      dosesTomadas: arrayUnion(timestamp),
    });
  }

  async function marcarConsultaConcluida(consultaId: string) {
    await updateDoc(doc(db, 'consultas', consultaId), {
      status: 'Concluído',
    });
  }

  async function marcarExameConcluido(exameId: string) {
    await updateDoc(doc(db, 'exames', exameId), {
      status: 'Concluído',
    });
  }

  return (
    <>
      {modalAtivo === 'medicamento' && prefs.medicamentos && (
        <ModalLembreteMedicamento
          medicamentos={medicamentos}
          nomeFilho={filhoSelecionado?.nome}
          onMarcarDoseTomada={marcarDose}
          onFechado={() => setModalAtivo(obterProximoModal('medicamento'))}
        />
      )}

      {modalAtivo === 'consulta' && prefs.consultas && (
        <ModalLembreteConsulta
          consultas={consultas}
          nomeFilho={filhoSelecionado?.nome}
          onAlterarStatus={(id) => marcarConsultaConcluida(id)}
          onFechado={() => setModalAtivo(obterProximoModal('consulta'))}
        />
      )}

      {modalAtivo === 'exame' && prefs.exames && (
        <ModalLembreteExame
          exames={exames}
          nomeFilho={filhoSelecionado?.nome}
          onAlterarStatus={(id) => marcarExameConcluido(id)}
          onFechado={() => setModalAtivo('nenhum')}
        />
      )}
    </>
  );
}