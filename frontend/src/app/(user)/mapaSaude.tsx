import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';

import BotaoVittaIA from '../../components/BotaoFlutuanteVittaIA';
import { tipografia } from '@/styles/tipografia';
import { useTheme } from '@/context/ThemeContext';
import { getStyles } from '@/styles/app/(user)/mapaSaude';

// Imagens e ícones SVG oficiais do Vitta
import hospital from '@/img/icons/hospital.svg';
import maps from '@/img/icons/maps.svg';
import bike from '@/img/icons/bike.svg';
import moto from '@/img/icons/moto.svg';
import carro from '@/img/icons/carro.svg';
import farmacia from '@/img/icons/medicamento.svg';
import clinica from '@/img/icons/stethoscope-02.svg';
import andando from '@/img/icons/andando.svg';
import mercado from '@/img/icons/carrinho.svg';
import satelite from '@/img/icons/satelite.svg';
import mapaRua from '@/img/icons/mapaRua.svg';
import lupaPesquisa from '@/img/icons/search-01.svg';
import telefone from '@/img/icons/call-02.svg';
import bussola from '@/img/icons/bussola.svg';
import emergencia from '@/img/icons/siren.svg';
import updateGps from '@/img/icons/gps-01.svg';
import pontoPartida from '@/img/icons/pontoPartida.svg';
import ButtonBlack from '@/components/Buttons/ButtonBlack';
import ButtonSecondary from '@/components/Buttons/ButtonSecondary';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';

export type TipoLocal = 'todos' | 'hospital' | 'farmacia' | 'clinica' | 'comercio';
export type TipoCamadaMapa = 'satelite' | 'ruas';
export type ModoTransporte = 'carro' | 'moto' | 'bicicleta' | 'pe';

export interface PontoAtendimento {
  id: string;
  nome: string;
  tipo: 'hospital' | 'farmacia' | 'clinica' | 'comercio';
  avaliacao: number;
  totalAvaliacoes: number;
  categoriaTexto: string;
  endereco: string;
  bairro: string;
  cidade: string;
  aberto24h: boolean;
  horarioTexto: string;
  telefone: string;
  site?: string;
  conveniadoVitta: boolean;
  vantagem?: string;
  lat: number;
  lng: number;
  distanciaKm?: number;
  distanciaFormatada?: string;
  tempoEstimado?: string;
}

const ARCGIS_GEOCODER = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';

function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function classificarTipoEstabelecimento(nome: string, tipoApi: string): {
  tipo: PontoAtendimento['tipo'];
  categoriaTexto: string;
  aberto24h: boolean;
} {
  const t = `${nome} ${tipoApi}`.toLowerCase();

  if (
    t.includes('hospital') ||
    t.includes('pronto socorro') ||
    t.includes('pronto-socorro') ||
    t.includes('pronto atendimento') ||
    t.includes('upa') ||
    t.includes('santa casa') ||
    t.includes('emergência') ||
    t.includes('emergencia')
  ) {
    return {
      tipo: 'hospital',
      categoriaTexto: 'Hospital • Pronto Atendimento 24h',
      aberto24h: true,
    };
  }

  if (
    t.includes('farmácia') ||
    t.includes('farmacia') ||
    t.includes('drogaria') ||
    t.includes('droga ') ||
    t.includes('pharmacy') ||
    t.includes('farma') ||
    t.includes('raia') ||
    t.includes('bifarma') ||
    t.includes('conde')
  ) {
    return {
      tipo: 'farmacia',
      categoriaTexto: 'Farmácia & Drogaria',
      aberto24h: t.includes('24h') || t.includes('raia') || t.includes('são paulo'),
    };
  }

  if (
    t.includes('mercado') ||
    t.includes('supermercado') ||
    t.includes('atacad') ||
    t.includes('grocery') ||
    t.includes('padaria') ||
    t.includes('shopping') ||
    t.includes('loja') ||
    t.includes('boa ')
  ) {
    return {
      tipo: 'comercio',
      categoriaTexto: 'Supermercado & Comércio Local',
      aberto24h: false,
    };
  }

  return {
    tipo: 'clinica',
    categoriaTexto: t.includes('ubs') ? 'UBS • Unidade Básica de Saúde' : 'Clínica & Atendimento Médico',
    aberto24h: false,
  };
}

export default function RedeSaude() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Estados de navegação responsiva e Tela Cheia
  const [mapaExpandido, setMapaExpandido] = useState(false);
  const [navegacaoAtiva, setNavegacaoAtiva] = useState(false);
  const [abaMobile, setAbaMobile] = useState<'mapa' | 'lista'>('mapa');

  // Busca e Dados
  const [busca, setBusca] = useState('');
  const [locaisReaisRegiao, setLocaisReaisRegiao] = useState<PontoAtendimento[]>([]);
  const [resultadosBuscaTexto, setResultadosBuscaTexto] = useState<PontoAtendimento[]>([]);
  const [carregandoRegiao, setCarregandoRegiao] = useState(false);
  const [buscandoTexto, setBuscandoTexto] = useState(false);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<TipoLocal>('todos');
  const [apenas24h, setApenas24h] = useState(false);
  const [tipoCamada, setTipoCamada] = useState<TipoCamadaMapa>('satelite');
  const [modoTransporte, setModoTransporte] = useState<ModoTransporte>('carro');

  // Ponto de Origem Real
  const [origemAtual, setOrigemAtual] = useState<{
    lat: number;
    lng: number;
    nome: string;
    precisaoMetros?: number;
  }>({
    lat: -23.2068,
    lng: -46.7862,
    nome: 'Localizando seu endereço...',
  });

  const [editandoOrigem, setEditandoOrigem] = useState(false);
  const [textoOrigem, setTextoOrigem] = useState('');
  const [obtendoGPS, setObtendoGPS] = useState(false);

  // 1. VARREDURA COMERCIAL PRECISA
  const buscarLocaisVerificadosNaRegiao = useCallback(async (lat: number, lng: number) => {
    setCarregandoRegiao(true);

    try {
      const categorias = [
        'Hospital,Medical Clinic,Doctor,Health Care Facility',
        'Pharmacy,Drugstore',
        'Grocery,Supermarket',
      ];

      const requisicoesArcGIS = categorias.map((cat) =>
        fetch(
          `${ARCGIS_GEOCODER}/findAddressCandidates?f=json&category=${encodeURIComponent(
            cat
          )}&location=${lng},${lat}&maxLocations=25&outFields=PlaceName,Place_addr,Phone,Type,City,Nbrhd`
        ).then((r) => r.json())
      );

      const resultados = await Promise.allSettled(requisicoesArcGIS);
      const listaColetada: PontoAtendimento[] = [];

      resultados.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.candidates) {
          res.value.candidates.forEach((cand: any, index: number) => {
            const attr = cand.attributes || {};
            const nome = String(attr.PlaceName || cand.address || '').trim();
            if (!nome || !cand.location) return;

            const cLat = cand.location.y;
            const cLng = cand.location.x;

            const dist = calcularDistanciaKm(lat, lng, cLat, cLng);
            if (dist > 18) return;

            const classif = classificarTipoEstabelecimento(nome, attr.Type || '');

            listaColetada.push({
              id: `arcgis-${cLat.toFixed(5)}-${cLng.toFixed(5)}`,
              nome,
              tipo: classif.tipo,
              avaliacao: Number((4.2 + ((index % 7) * 0.1)).toFixed(1)),
              totalAvaliacoes: 58 + index * 23,
              categoriaTexto: classif.categoriaTexto,
              endereco: attr.Place_addr || 'Endereço verificado',
              bairro: attr.Nbrhd || attr.City || 'Região',
              cidade: attr.City || 'SP',
              aberto24h: classif.aberto24h,
              horarioTexto: classif.aberto24h ? 'Aberto 24 horas' : 'Aberto em horário comercial',
              telefone: attr.Phone || '(Consulte no local)',
              conveniadoVitta: classif.tipo === 'hospital' || classif.tipo === 'farmacia',
              vantagem:
                classif.tipo === 'hospital'
                  ? 'Pronto Atendimento Mapeado Vitta'
                  : classif.tipo === 'farmacia'
                    ? 'Farmácia Verificada na Região'
                    : undefined,
              lat: cLat,
              lng: cLng,
            });
          });
        }
      });

      const unicos = new Map<string, PontoAtendimento>();
      listaColetada.forEach((item) => {
        const chave = `${item.nome.toLowerCase().slice(0, 14)}-${item.lat.toFixed(3)}-${item.lng.toFixed(3)}`;
        if (!unicos.has(chave)) {
          unicos.set(chave, item);
        }
      });

      setLocaisReaisRegiao(Array.from(unicos.values()));
    } catch (e) {
      console.warn('Erro ao buscar POIs:', e);
    } finally {
      setCarregandoRegiao(false);
    }
  }, []);

  // 2. GEOLOCALIZAÇÃO REVERSA
  const obterEnderecoExatoPorCoordenada = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `${ARCGIS_GEOCODER}/reverseGeocode?f=json&location=${lng},${lat}&featureTypes=StreetAddress,POI`
      );
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const nomeOuRua = a.PlaceName || a.Address || a.ShortLabel || 'Sua Localização';
        const bairro = a.Neighborhood || a.District || a.City || '';
        return bairro ? `${nomeOuRua} - ${bairro}` : nomeOuRua;
      }
    } catch {
      // Fallback
    }
    return `Coordenada (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  const obterMinhaLocalizacaoReal = useCallback(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      setObtendoGPS(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);

          const enderecoReal = await obterEnderecoExatoPorCoordenada(lat, lng);
          setOrigemAtual({
            lat,
            lng,
            nome: enderecoReal,
            precisaoMetros: acc,
          });
          setObtendoGPS(false);
          buscarLocaisVerificadosNaRegiao(lat, lng);
        },
        async () => {
          setObtendoGPS(false);
          const enderecoPadrao = await obterEnderecoExatoPorCoordenada(origemAtual.lat, origemAtual.lng);
          setOrigemAtual((prev) => ({ ...prev, nome: enderecoPadrao }));
          buscarLocaisVerificadosNaRegiao(origemAtual.lat, origemAtual.lng);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      buscarLocaisVerificadosNaRegiao(origemAtual.lat, origemAtual.lng);
    }
  }, [buscarLocaisVerificadosNaRegiao, origemAtual.lat, origemAtual.lng]);

  useEffect(() => {
    obterMinhaLocalizacaoReal();
  }, []);

  // 3. BUSCA GLOBAL DE TEXTO
  useEffect(() => {
    const termo = busca.trim();
    if (termo.length < 2) {
      setResultadosBuscaTexto([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscandoTexto(true);
      try {
        const urlArcGIS = `${ARCGIS_GEOCODER}/findAddressCandidates?f=json&SingleLine=${encodeURIComponent(
          termo
        )}&location=${origemAtual.lng},${origemAtual.lat}&maxLocations=15&outFields=PlaceName,Place_addr,Phone,Type,City,Nbrhd&countryCode=BRA`;

        const res = await fetch(urlArcGIS);
        const data = await res.json();

        if (data && Array.isArray(data.candidates)) {
          const encontrados: PontoAtendimento[] = data.candidates
            .filter((c: any) => c.location)
            .map((c: any, idx: number) => {
              const attr = c.attributes || {};
              const nome = attr.PlaceName || String(c.address).split(',')[0] || termo;
              const classif = classificarTipoEstabelecimento(nome, attr.Type || '');

              return {
                id: `search-${c.location.y.toFixed(5)}-${c.location.x.toFixed(5)}-${idx}`,
                nome,
                tipo: classif.tipo,
                avaliacao: 4.5,
                totalAvaliacoes: 90 + idx * 15,
                categoriaTexto: classif.categoriaTexto,
                endereco: attr.Place_addr || c.address || 'Endereço verificado',
                bairro: attr.Nbrhd || attr.City || 'Região',
                cidade: attr.City || 'SP',
                aberto24h: classif.aberto24h,
                horarioTexto: classif.aberto24h ? 'Aberto 24 horas' : 'Aberto',
                telefone: attr.Phone || '(Consulte no local)',
                conveniadoVitta: true,
                lat: c.location.y,
                lng: c.location.x,
              };
            });

          setResultadosBuscaTexto(encontrados);
        }
      } catch (e) {
        console.warn('Erro pesquisa:', e);
      } finally {
        setBuscandoTexto(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [busca, origemAtual]);

  // Recalcula distâncias e tempos
  const todosLocaisComMetricas = useMemo(() => {
    const fonte =
      busca.trim().length >= 2 && resultadosBuscaTexto.length > 0
        ? [...resultadosBuscaTexto, ...locaisReaisRegiao]
        : locaisReaisRegiao;

    const mapaUnico = new Map<string, PontoAtendimento>();
    fonte.forEach((item) => {
      const chave = `${item.lat.toFixed(4)}-${item.lng.toFixed(4)}`;
      if (!mapaUnico.has(chave)) {
        mapaUnico.set(chave, item);
      }
    });

    return Array.from(mapaUnico.values())
      .map((p) => {
        const dKm = calcularDistanciaKm(origemAtual.lat, origemAtual.lng, p.lat, p.lng);
        let vel = 34;
        if (modoTransporte === 'moto') vel = 42;
        if (modoTransporte === 'bicicleta') vel = 14;
        if (modoTransporte === 'pe') vel = 4.8;

        const minutos = Math.max(1, Math.round((dKm / vel) * 60));

        return {
          ...p,
          distanciaKm: dKm,
          distanciaFormatada: dKm < 1 ? `${Math.round(dKm * 1000)} m` : `${dKm.toFixed(1)} km`,
          tempoEstimado: minutos >= 60 ? `~${Math.floor(minutos / 60)}h ${minutos % 60}m` : `~${minutos} min`,
        };
      })
      .sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0));
  }, [resultadosBuscaTexto, locaisReaisRegiao, busca, origemAtual, modoTransporte]);

  const [localSelecionado, setLocalSelecionado] = useState<PontoAtendimento | null>(null);

  useEffect(() => {
    if (todosLocaisComMetricas.length > 0 && !localSelecionado) {
      setLocalSelecionado(todosLocaisComMetricas[0]);
    }
  }, [todosLocaisComMetricas, localSelecionado]);

  const pontosFiltrados = useMemo(() => {
    return todosLocaisComMetricas.filter((p) => {
      const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;
      const match24h = apenas24h ? p.aberto24h : true;
      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.endereco.toLowerCase().includes(termo) ||
        p.bairro.toLowerCase().includes(termo) ||
        p.cidade.toLowerCase().includes(termo) ||
        p.categoriaTexto.toLowerCase().includes(termo);

      return matchTipo && match24h && matchBusca;
    });
  }, [todosLocaisComMetricas, filtroTipo, apenas24h, busca]);

  // 4. BOTÃO SOS EMERGÊNCIA
  const acionarEmergenciaHospitalMaisProximo = () => {
    const hospitais = todosLocaisComMetricas.filter((p) => p.tipo === 'hospital');
    if (hospitais.length > 0) {
      const hospMaisProximo = hospitais[0];
      setFiltroTipo('hospital');
      setModoTransporte('carro');
      setLocalSelecionado(hospMaisProximo);
      setNavegacaoAtiva(true);
      if (isMobile) setAbaMobile('mapa');

      iframeRef.current?.contentWindow?.postMessage(
        {
          tipo: 'TRAÇAR_ROTA_DIRETA',
          destino: hospMaisProximo,
          origem: origemAtual,
          modo: 'carro',
          abrirPassoAPasso: true,
        },
        '*'
      );
    } else {
      buscarLocaisVerificadosNaRegiao(origemAtual.lat, origemAtual.lng);
    }
  };

  // Sincronização em tempo real com o iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        tipo: 'ATUALIZAR_PONTOS',
        pontos: pontosFiltrados,
        origem: origemAtual,
        selecionado: localSelecionado,
        modo: modoTransporte,
        abrirPassoAPasso: navegacaoAtiva,
      },
      '*'
    );
  }, [pontosFiltrados, origemAtual, localSelecionado, modoTransporte, navegacaoAtiva]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        tipo: 'ALTERNAR_CAMADA',
        camada: tipoCamada,
      },
      '*'
    );
  }, [tipoCamada]);

  // Eventos do mapa
  useEffect(() => {
    const handleMensagemDoMapa = async (evento: MessageEvent) => {
      if (!evento.data) return;

      if (evento.data.tipo === 'PIN_CLICADO') {
        const encontrado = todosLocaisComMetricas.find((l) => l.id === evento.data.id) || evento.data.ponto;
        if (encontrado) {
          setLocalSelecionado(encontrado);
          setNavegacaoAtiva(true);
        }
      }

      if (evento.data.tipo === 'CLIQUE_MAPA_DESCOBRIR_LOCAL') {
        const { lat, lng } = evento.data;
        try {
          const res = await fetch(
            `${ARCGIS_GEOCODER}/reverseGeocode?f=json&location=${lng},${lat}&featureTypes=POI,StreetAddress`
          );
          const data = await res.json();
          const addr = data?.address || {};
          const nomeDescoberto = addr.PlaceName || addr.ShortLabel || addr.Address || 'Local Selecionado no Mapa';
          const enderecoCompleto = addr.LongLabel || addr.Match_addr || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const classif = classificarTipoEstabelecimento(nomeDescoberto, addr.Type || '');

          const dKm = calcularDistanciaKm(origemAtual.lat, origemAtual.lng, lat, lng);
          const min = Math.max(1, Math.round((dKm / 34) * 60));

          const novoPontoClicado: PontoAtendimento = {
            id: `click-${Date.now()}`,
            nome: nomeDescoberto,
            tipo: classif.tipo,
            avaliacao: 4.6,
            totalAvaliacoes: 42,
            categoriaTexto: classif.categoriaTexto,
            endereco: enderecoCompleto,
            bairro: addr.Neighborhood || addr.City || 'Região',
            cidade: addr.City || 'SP',
            aberto24h: classif.aberto24h,
            horarioTexto: 'Selecionado no mapa',
            telefone: '(Consulte no local)',
            conveniadoVitta: true,
            lat,
            lng,
            distanciaKm: dKm,
            distanciaFormatada: dKm < 1 ? `${Math.round(dKm * 1000)} m` : `${dKm.toFixed(1)} km`,
            tempoEstimado: `~${min} min`,
          };

          setLocaisReaisRegiao((prev) => [novoPontoClicado, ...prev]);
          setLocalSelecionado(novoPontoClicado);
          setNavegacaoAtiva(true);
        } catch {
          // Silencioso
        }
      }

      if (evento.data.tipo === 'ORIGEM_ARRASTADA_OU_CALIBRADA') {
        const { lat, lng } = evento.data;
        const nomeRua = await obterEnderecoExatoPorCoordenada(lat, lng);
        setOrigemAtual({
          lat,
          lng,
          nome: nomeRua,
          precisaoMetros: 5,
        });
        buscarLocaisVerificadosNaRegiao(lat, lng);
      }

      if (evento.data.tipo === 'PESQUISAR_AREA_MAPA') {
        const { lat, lng } = evento.data;
        buscarLocaisVerificadosNaRegiao(lat, lng);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('message', handleMensagemDoMapa);
      return () => window.removeEventListener('message', handleMensagemDoMapa);
    }
  }, [todosLocaisComMetricas, origemAtual, buscarLocaisVerificadosNaRegiao]);

  const definirOrigemPorTexto = async () => {
    if (!textoOrigem.trim()) return;
    setObtendoGPS(true);
    try {
      const res = await fetch(
        `${ARCGIS_GEOCODER}/findAddressCandidates?f=json&SingleLine=${encodeURIComponent(
          textoOrigem.trim()
        )}&maxLocations=1&outFields=Place_addr,PlaceName&countryCode=BRA`
      );
      const data = await res.json();
      if (data?.candidates?.length > 0) {
        const cand = data.candidates[0];
        const lat = cand.location.y;
        const lng = cand.location.x;
        const label = cand.attributes?.Place_addr || cand.address;

        setOrigemAtual({
          lat,
          lng,
          nome: label,
          precisaoMetros: 5,
        });
        setEditandoOrigem(false);
        setTextoOrigem('');
        buscarLocaisVerificadosNaRegiao(lat, lng);
      } else {
        alert('Endereço não encontrado. Digite Rua, Número e Cidade.');
      }
    } catch {
      alert('Erro ao buscar endereço.');
    } finally {
      setObtendoGPS(false);
    }
  };

  const discarTelefone = (tel: string) => {
    Linking.openURL(`tel:${tel.replace(/\D/g, '')}`);
  };

  // 5. MOTOR DO MAPA
  const htmlMapaGoogleTiles = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #121212; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        
        .map-pin {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .map-pin:hover { transform: scale(1.22); }
        .pin-selecionado {
          transform: scale(1.3);
          border: 3px solid ${theme.yellow5};
          box-shadow: 0 0 18px ${theme.yellow5};
        }
        .pin-hospital { background: #E11D48; }
        .pin-farmacia { background: #F59E0B; }
        .pin-clinica { background: #2563EB; }
        .pin-comercio { background: #10B981; }

        .map-pin svg {
          width: 17px;
          height: 17px;
          fill: #FFFFFF;
        }

        .pin-label {
          background: rgba(18, 18, 18, 0.90);
          color: #FFF;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          white-space: nowrap;
          margin-top: 2px;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 2px 6px rgba(0,0,0,0.45);
        }

        .user-pin-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .user-pin {
          width: 22px;
          height: 22px;
          background: #10B981;
          border: 4px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 18px #10B981;
          cursor: grab;
        }
        .user-label {
          background: #10B981;
          color: #000;
          font-weight: 800;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 99px;
          margin-top: 3px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        #btn-pesquisar-area {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFFFFF;
          color: #1D1D1D;
          font-size: 12px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 999px;
          border: 2px solid ${theme.yellow5};
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        #btn-pesquisar-area:hover { background: #FFF7EB; }

        #painel-passos {
          position: absolute;
          top: 54px;
          left: 10px;
          right: 10px;
          max-width: 320px;
          max-height: 260px;
          overflow-y: auto;
          background: rgba(18, 18, 18, 0.94);
          backdrop-filter: blur(10px);
          color: #FFF;
          border: 1.5px solid ${theme.yellow5};
          border-radius: 16px;
          padding: 12px;
          font-size: 12px;
          z-index: 1000;
          display: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }
        .passo-item {
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <button id="btn-pesquisar-area" onclick="dispararBuscaArea()">
        Buscar nesta área
      </button>

      <div id="painel-passos">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b style="color: ${theme.yellow5}; font-size: 13px;">Guia de Navegação Vitta</b>
          <span style="cursor:pointer; font-weight:bold; font-size:16px; padding: 2px 6px;" onclick="document.getElementById('painel-passos').style.display='none'">✕</span>
        </div>
        <div id="resumo-rota" style="margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.2); font-weight:bold; color:#86EFAC;"></div>
        <div id="lista-passos"></div>
      </div>

      <script>
        const map = L.map('map', { zoomControl: false }).setView([-23.2068, -46.7862], 16);
        L.control.zoom({ position: 'topright' }).addTo(map);

        const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&hl=pt-BR&x={x}&y={y}&z={z}', {
          maxZoom: 21,
          attribution: 'Map data &copy; Google'
        });

        const googleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}', {
          maxZoom: 21,
          attribution: 'Map data &copy; Google'
        });

        googleHybrid.addTo(map);

        const groupPins = L.layerGroup().addTo(map);
        const groupRota = L.layerGroup().addTo(map);
        let markerOrigem = null;
        let ultimaRotaChave = '';

        function criarOuAtualizarOrigem(lat, lng) {
          const userIcon = L.divIcon({
            className: 'u-wrap',
            html: '<div class="user-pin-container"><div class="user-pin"></div><div class="user-label">Sua Posição</div></div>',
            iconSize: [110, 44],
            iconAnchor: [55, 14]
          });

          if (!markerOrigem) {
            markerOrigem = L.marker([lat, lng], { icon: userIcon, draggable: true }).addTo(map);
            markerOrigem.on('dragend', function(e) {
              const pos = e.target.getLatLng();
              window.parent.postMessage({ tipo: 'ORIGEM_ARRASTADA_OU_CALIBRADA', lat: pos.lat, lng: pos.lng }, '*');
            });
          } else {
            markerOrigem.setLatLng([lat, lng]);
          }
        }

        function traduzirManobra(step) {
          const tipo = step.maneuver?.type || '';
          const mod = step.maneuver?.modifier || '';
          const rua = step.name ? ' na <b>' + step.name + '</b>' : '';
          const dist = Math.round(step.distance) + 'm';

          if (tipo === 'depart') return 'Siga' + rua + ' por ' + dist;
          if (tipo === 'arrive') return 'Você chegou ao destino!';
          if (mod.includes('right')) return 'Vire à direita' + rua + ' (' + dist + ')';
          if (mod.includes('left')) return 'Vire à esquerda' + rua + ' (' + dist + ')';
          return 'Continue em frente' + rua + ' (' + dist + ')';
        }

        function desenharRotaViaria(origem, destino, modo, abrirPassoAPasso) {
          if (!origem || !destino) return;
          const chave = origem.lat.toFixed(5) + ',' + origem.lng.toFixed(5) + '->' + destino.lat.toFixed(5) + ',' + destino.lng.toFixed(5) + '-' + modo;
          if (chave === ultimaRotaChave && !abrirPassoAPasso) return;
          ultimaRotaChave = chave;

          groupRota.clearLayers();
          const profile = (modo === 'pe' || modo === 'bicicleta') ? 'foot' : 'driving';
          const osrmUrl = 'https://router.project-osrm.org/route/v1/' + profile + '/' + origem.lng + ',' + origem.lat + ';' + destino.lng + ',' + destino.lat + '?overview=full&geometries=geojson&steps=true';

          fetch(osrmUrl)
            .then(r => r.json())
            .then(data => {
              groupRota.clearLayers();
              if (data.routes && data.routes[0]) {
                const route = data.routes[0];
                const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
                const poly = L.polyline(coords, {
                  color: '${theme.yellow5}',
                  weight: 6,
                  opacity: 0.95,
                  dashArray: modo === 'pe' ? '8, 8' : 'none'
                }).addTo(groupRota);

                map.fitBounds(poly.getBounds(), { padding: [40, 40] });

                const distKm = (route.distance / 1000).toFixed(1);
                const durMin = Math.max(1, Math.round(route.duration / 60));
                document.getElementById('resumo-rota').innerText = 'Trajeto viário: ' + distKm + ' km (~' + durMin + ' min)';

                if (route.legs && route.legs[0] && route.legs[0].steps) {
                  const divLista = document.getElementById('lista-passos');
                  divLista.innerHTML = '';
                  route.legs[0].steps.forEach(s => {
                    if (s.distance > 5 || s.maneuver?.type === 'arrive') {
                      const item = document.createElement('div');
                      item.className = 'passo-item';
                      item.innerHTML = traduzirManobra(s);
                      divLista.appendChild(item);
                    }
                  });
                  if (abrirPassoAPasso) {
                    document.getElementById('painel-passos').style.display = 'block';
                  }
                }
              }
            })
            .catch(() => {});
        }

        const iconesSvg = {
          hospital: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>',
          farmacia: '<svg viewBox="0 0 24 24"><path d="M6 3h12v2H6zm11 3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-3 8h-1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1h-1c-.55 0-1-.45-1-1s.45-1 1-1h1v-1c0-.55.45-1 1-1s1 .45 1 1v1h1c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>',
          clinica: '<svg viewBox="0 0 24 24"><path d="M19 8c-.55 0-1 .45-1 1v3c0 2.21-1.79 4-4 4s-4-1.79-4-4V5h1c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1h1v7c0 3.31 2.69 6 6 6s6-2.69 6-6V9c0-.55-.45-1-1-1z"/></svg>',
          comercio: '<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>'
        };

        window.addEventListener('message', function(event) {
          const msg = event.data;
          if (!msg) return;

          if (msg.tipo === 'ALTERNAR_CAMADA') {
            if (msg.camada === 'satelite') {
              map.removeLayer(googleStreets);
              googleHybrid.addTo(map);
            } else {
              map.removeLayer(googleHybrid);
              googleStreets.addTo(map);
            }
          }

          if (msg.tipo === 'ATUALIZAR_PONTOS') {
            if (msg.origem) {
              criarOuAtualizarOrigem(msg.origem.lat, msg.origem.lng);
            }

            groupPins.clearLayers();
            const selId = msg.selecionado ? msg.selecionado.id : null;

            (msg.pontos || []).forEach(p => {
              let classe = 'pin-comercio';
              let iconeSvg = iconesSvg.comercio;
              if (p.tipo === 'hospital') { classe = 'pin-hospital'; iconeSvg = iconesSvg.hospital; }
              if (p.tipo === 'farmacia') { classe = 'pin-farmacia'; iconeSvg = iconesSvg.farmacia; }
              if (p.tipo === 'clinica') { classe = 'pin-clinica'; iconeSvg = iconesSvg.clinica; }

              const destaq = (p.id === selId) ? ' pin-selecionado' : '';

              const icon = L.divIcon({
                className: 'p-wrap',
                html: '<div style="display:flex;flex-direction:column;align-items:center;">' +
                        '<div class="map-pin ' + classe + destaq + '">' + iconeSvg + '</div>' +
                        '<div class="pin-label">' + p.nome.substring(0, 20) + '</div>' +
                      '</div>',
                iconSize: [120, 48],
                iconAnchor: [60, 16]
              });

              const m = L.marker([p.lat, p.lng], { icon: icon }).addTo(groupPins);
              m.on('click', () => {
                window.parent.postMessage({ tipo: 'PIN_CLICADO', id: p.id, ponto: p }, '*');
              });
            });

            if (msg.origem && msg.selecionado) {
              desenharRotaViaria(msg.origem, msg.selecionado, msg.modo, msg.abrirPassoAPasso);
            }
          }

          if (msg.tipo === 'TRAÇAR_ROTA_DIRETA') {
            desenharRotaViaria(msg.origem, msg.destino, msg.modo, true);
          }
        });

        function dispararBuscaArea() {
          const c = map.getCenter();
          const btn = document.getElementById('btn-pesquisar-area');
          btn.innerText = 'Buscando aqui...';
          window.parent.postMessage({ tipo: 'PESQUISAR_AREA_MAPA', lat: c.lat, lng: c.lng }, '*');
          setTimeout(() => {
            btn.innerText = 'Buscar nesta área';
          }, 2000);
        }

        map.on('click', function(e) {
          const cLat = e.latlng.lat;
          const cLng = e.latlng.lng;
          const container = document.createElement('div');
          container.innerHTML =
            '<div style="font-size:12px; min-width:180px;">' +
              '<b>Local selecionado</b><br>' +
              '<button id="pop-ir" style="margin-top:7px;background:${theme.yellow5};color:#000;border:none;padding:8px 10px;border-radius:8px;font-weight:bold;cursor:pointer;width:100%;">Traçar Rota até Aqui</button>' +
              '<button id="pop-casa" style="margin-top:5px;background:#10B981;color:#000;border:none;padding:7px 10px;border-radius:8px;font-weight:bold;cursor:pointer;width:100%;">Definir Minha Posição</button>' +
            '</div>';

          L.popup().setLatLng(e.latlng).setContent(container).openOn(map);

          setTimeout(() => {
            const btnIr = document.getElementById('pop-ir');
            if (btnIr) {
              btnIr.onclick = () => {
                map.closePopup();
                window.parent.postMessage({ tipo: 'CLIQUE_MAPA_DESCOBRIR_LOCAL', lat: cLat, lng: cLng }, '*');
              };
            }
            const btnCasa = document.getElementById('pop-casa');
            if (btnCasa) {
              btnCasa.onclick = () => {
                map.closePopup();
                window.parent.postMessage({ tipo: 'ORIGEM_ARRASTADA_OU_CALIBRADA', lat: cLat, lng: cLng }, '*');
              };
            }
          }, 60);
        });
      </script>
    </body>
    </html>
  `,
    [theme.yellow5]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <BotaoVittaIA />

      {/* RENDERIZAÇÃO QUANDO NÃO ESTÁ EM TELA CHEIA */}
      {!mapaExpandido && (
        <ScrollView
          style={[styles.scroll, { backgroundColor: theme.bg }]}
          contentContainerStyle={{
            padding: isMobile ? 8 : 20,
            paddingBottom: isMobile ? 80 : 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* TOPO: Título + Botão SOS + Controles de GPS */}
          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              marginBottom: 12,
              gap: 16,
            }}
          >
            <View>
              <Text style={[isMobile ? tipografia.h3 : tipografia.h2, { color: theme.textPrimary }]}>
                Mapa de Saúde
              </Text>
              <Text style={[tipografia.caption, { color: theme.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                Ponto de partida: <Text style={{ color: theme.yellow6, fontWeight: '600' }}>{origemAtual.nome}</Text>
              </Text>
            </View>

            {/* Linha de botões de Ação Rápida */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/*<TouchableOpacity
                activeOpacity={0.85}
                onPress={acionarEmergenciaHospitalMaisProximo}
                style={{
                  flex: isMobile ? 1 : undefined,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: theme.yellow5,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,

                }}
              >
                <Image source={emergencia} style={{ width: 16, height: 16, tintColor: '#FFFFFF' }} resizeMode="contain" />
                <Text style={[tipografia.body, { color: '#FFFFFF', }]}>
                  {isMobile ? 'SOS Hospital' : 'Hospital mais próximo'}
                </Text>
              </TouchableOpacity>*/}
              <ButtonPrimary
                texto={isMobile ? 'SOS Hospital' : 'Hospital mais próximo'}
                onPress={acionarEmergenciaHospitalMaisProximo}
                icone={require('@/img/icons/hospital.svg')}
              ></ButtonPrimary>
              {/*<TouchableOpacity
                activeOpacity={0.8}
                onPress={obterMinhaLocalizacaoReal}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: theme.cardBg,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                {obtendoGPS ? (
                  <ActivityIndicator size="small" color={theme.yellow5} />
                ) : (
                  <Image source={updateGps} style={{ width: 16, height: 16, tintColor: theme.black }} resizeMode="contain" />
                )}
                <Text style={[tipografia.body, { color: theme.textPrimary, }]}>
                  Meu GPS
                </Text>
              </TouchableOpacity>*/}
              <ButtonSecondary
                texto='Meu GPS'
                onPress={obterMinhaLocalizacaoReal}
                icone={require('@/img/icons/gps-01.svg')}
              ></ButtonSecondary>
              {/*<TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setEditandoOrigem(!editandoOrigem)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: theme.cardBg,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.yellow5,
                }}
              >
                <Image source={pontoPartida} style={{ width: 24, height: 24, tintColor: theme.yellow6 }} resizeMode="contain" />
                <Text style={[tipografia.body, { color: theme.yellow6, }]}>
                  {isMobile ? 'Mudar' : 'Mudar Ponto'}
                </Text>
              </TouchableOpacity>*/}
              <ButtonSecondary
                texto={isMobile ? 'Mudar' : 'Mudar Ponto'}
                onPress={() => setEditandoOrigem(!editandoOrigem)}
                icone={require('@/img/icons/pontoPartida.svg')}
              ></ButtonSecondary>
            </View>
          </View>

          {editandoOrigem && (
            <View
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.yellow5,
                padding: 16,
                marginBottom: 12,
                gap: 8,
              }}
            >
              <Text style={[tipografia.caption, { fontWeight: '700', color: theme.textPrimary }]}>
                Digite sua Rua, Número e Cidade:
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={textoOrigem}
                  onChangeText={setTextoOrigem}
                  onSubmitEditing={definirOrigemPorTexto}
                  placeholder="Ex: Av. Alfried Krupp, 600, Campo Limpo Paulista..."
                  placeholderTextColor={theme.gray4}
                  style={[
                    styles.inputBusca,
                    {
                      flex: 1,
                      backgroundColor: theme.inputBg,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      height: 40,
                      borderWidth: 1,
                      borderColor: theme.border,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={definirOrigemPorTexto}
                  style={{
                    backgroundColor: theme.yellow5,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '700', fontSize: 13 }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BARRA DE ALTERNÂNCIA MOBILE: Mapa vs Lista */}
          {isMobile && (
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.inputBg,
                borderRadius: 14,
                padding: 3,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <TouchableOpacity
                onPress={() => setAbaMobile('mapa')}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 11,
                  backgroundColor: abaMobile === 'mapa' ? theme.yellow5 : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: abaMobile === 'mapa' ? (isDark ? '#000' : '#FFF') : theme.textSecondary,
                  }}
                >
                  🗺️ Mapa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAbaMobile('lista')}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 11,
                  backgroundColor: abaMobile === 'lista' ? theme.yellow5 : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: abaMobile === 'lista' ? (isDark ? '#000' : '#FFF') : theme.textSecondary,
                  }}
                >
                  📋 Lista ({pontosFiltrados.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CONTAINER PRINCIPAL */}
          <View
            style={[
              styles.conteudoPrincipal,
              {
                flexDirection: isDesktop ? 'row' : 'column',
                alignItems: isDesktop ? 'flex-start' : 'stretch',
                gap: 12,
              },
            ]}
          >
            {/* PAINEL LATERAL: Pesquisa & Lista */}
            {(!isMobile || abaMobile === 'lista') && (
              <View
                style={[
                  styles.colunaLateral,
                  { flex: isDesktop ? 1.05 : undefined, width: isDesktop ? undefined : '100%' },
                ]}
              >
                <View style={[styles.cardPainelBusca, { paddingVertical: 32, paddingHorizontal: 24 }]}>
                  <View style={styles.inputBuscaContainer}>
                    <Image source={lupaPesquisa} style={{ width: 17, height: 17, tintColor: theme.gray4 }} resizeMode="contain" />
                    <TextInput
                      value={busca}
                      onChangeText={setBusca}
                      placeholder="Buscar Hospital, UBS, Farmácia..."
                      placeholderTextColor={theme.gray4}
                      style={styles.inputBusca}
                    />
                    {buscandoTexto || carregandoRegiao ? (
                      <ActivityIndicator size="small" color={theme.yellow5} />
                    ) : busca.length > 0 ? (
                      <TouchableOpacity onPress={() => setBusca('')}>
                        <Text style={{ color: theme.textSecondary, paddingHorizontal: 8 }}>✕</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsFiltroContainer}
                  >
                    {[
                      { id: 'todos', icone: null, label: 'Todos' },
                      { id: 'hospital', icone: hospital, label: 'Hospitais' },
                      { id: 'farmacia', icone: farmacia, label: 'Farmácias' },
                      { id: 'clinica', icone: clinica, label: 'Clínicas & UBS' },
                      { id: 'comercio', icone: mercado, label: 'Mercados' },
                    ].map((chip) => {
                      const ativo = filtroTipo === chip.id;
                      const corIcone = ativo
                        ? isDark ? '#000000' : theme.yellow9
                        : theme.textSecondary;

                      return (
                        <TouchableOpacity
                          key={chip.id}
                          onPress={() => setFiltroTipo(chip.id as TipoLocal)}
                          style={[
                            styles.chipFiltro,
                            ativo && [styles.chipFiltroAtivo, { backgroundColor: theme.yellow5 }],
                            { backgroundColor: ativo ? theme.yellow5 : theme.cardBg, flexDirection: 'row', alignItems: 'center', gap: 8 },
                          ]}
                        >
                          {chip.icone && (
                            <Image
                              source={chip.icone}
                              style={{ width: 24, height: 24, tintColor: corIcone }}
                              resizeMode="contain"
                            />
                          )}
                          <Text
                            style={[
                              tipografia.caption,
                              {
                                color: ativo ? (isDark ? '#000000' : theme.yellow9) : theme.textSecondary,

                              },
                            ]}
                          >
                            {chip.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <TouchableOpacity
                      onPress={() => setApenas24h(!apenas24h)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: apenas24h ? theme.yellow5 : theme.border,
                          backgroundColor: apenas24h ? theme.yellow5 : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {apenas24h && <Image source={require('@/img/icons/check.svg')} style={{ tintColor: theme.yellow9 }}></Image>}
                      </View>
                      <Text style={[tipografia.caption, { color: theme.textPrimary }]}>
                        Plantão 24h
                      </Text>
                    </TouchableOpacity>

                    <Text style={[tipografia.caption, { color: theme.textSecondary, }]}>
                      {carregandoRegiao ? 'Carregando...' : `${pontosFiltrados.length} encontrados`}
                    </Text>
                  </View>
                </View>

                {/* Lista dos Cards */}
                <ScrollView
                  style={{ maxHeight: isDesktop ? 680 : undefined }}
                  contentContainerStyle={{ gap: 8, paddingBottom: 10 }}
                  showsVerticalScrollIndicator={false}
                >
                  {pontosFiltrados.map((item) => {
                    const selecionado = localSelecionado?.id === item.id;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.85}
                        onPress={() => {
                          setLocalSelecionado(item);
                          setNavegacaoAtiva(true);
                          if (isMobile) setAbaMobile('mapa');
                        }}
                        style={[
                          styles.cardLocal,
                          { paddingHorizontal: 24, paddingVertical: 32, gap: 8 },
                          selecionado && [

                            { borderColor: theme.yellow5, },
                          ],
                        ]}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1, gap: 8 }}>
                            <Text style={[tipografia.body,]}>
                              {item.nome}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                              <Text style={[tipografia.bodySecondary, { color: theme.yellow5 }]}>
                                {item.avaliacao.toFixed(1)} ★
                              </Text>
                              <Text style={[tipografia.caption, { color: theme.textSecondary, }]}>
                                ({item.totalAvaliacoes})
                              </Text>
                              {item.tipo === 'hospital' && (
                                <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                                  <Text style={[tipografia.caption, { color: '#991B1B' }]}>Urgência</Text>
                                </View>
                              )}
                            </View>

                            <Text style={[tipografia.caption, { color: theme.textSecondary, marginTop: 1, }]}>
                              {item.categoriaTexto}
                            </Text>
                            <Text style={[tipografia.caption, { color: theme.textSecondary, }]} numberOfLines={1}>
                              {item.endereco}
                            </Text>

                            <Text style={[tipografia.caption, { color: item.aberto24h ? '#10B981' : '#F59E0B', backgroundColor: item.aberto24h ? '#eefff9' : '#fff6e6', marginTop: 2, width: '50%', padding: 8, borderRadius: 999, textAlign: 'center' }]}>
                              {item.horarioTexto}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => {
                              setLocalSelecionado(item);
                              setNavegacaoAtiva(true);
                              if (isMobile) setAbaMobile('mapa');
                            }}
                            style={{
                              paddingHorizontal: 10,
                              height: 32,
                              borderRadius: 16,
                              //borderWidth: 1,
                              //borderColor: selecionado ? theme.yellow5 : theme.border,
                              backgroundColor: selecionado ? theme.black : theme.white,
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'row',
                              gap: 7,
                            }}
                          >
                            <Image source={require('@/img/icons/route-02.svg')} style={{ width: 16, height: 16, tintColor: selecionado ? theme.white : theme.black }} resizeMode="contain" />
                            <Text style={[tipografia.caption, { color: selecionado ? theme.white : theme.black }]}>
                              Rotas
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View
                          style={{
                            //borderTopWidth: 1,
                            //borderTopColor: theme.border,
                            paddingTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={[tipografia.caption,]}>
                            {item.distanciaFormatada} • {item.tempoEstimado}
                          </Text>
                          {item.telefone && item.telefone !== '(Consulte no local)' && (
                            <TouchableOpacity onPress={() => discarTelefone(item.telefone)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Image source={require('@/img/icons/calling.svg')} style={{ width: 16, height: 16 }} resizeMode="contain" />
                              <Text style={[tipografia.caption,]}>
                                Ligar
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* PAINEL DO MAPA INTERATIVO (Modo Normal) */}
            {(!isMobile || abaMobile === 'mapa') && (
              <View
                style={[
                  styles.areaMapaContainer,
                  {
                    flex: isDesktop ? 1.75 : undefined,
                    width: isDesktop ? undefined : '100%',
                    borderRadius: isMobile ? 18 : 24,
                  },
                ]}
              >
                {/* Controles de Rota e Visualização */}
                <View
                  style={[
                    styles.mapaControlesBarra,
                    {
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 8,
                      paddingVertical: 24,
                      paddingHorizontal: 32,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      {[
                        { id: 'carro', icone: carro, label: 'Carro' },
                        { id: 'moto', icone: moto, label: 'Motocicleta' },
                        { id: 'bicicleta', icone: bike, label: 'Bicicleta' },
                        { id: 'pe', icone: andando, label: 'A pé' },
                      ].map((item) => {
                        const ativo = modoTransporte === item.id;
                        const corIcone = ativo
                          ? isDark ? '#000000' : '#FFFFFF'
                          : theme.textSecondary;

                        return (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => setModoTransporte(item.id as ModoTransporte)}
                            style={[
                              styles.seletorModoBtn,
                              ativo && { backgroundColor: theme.black },
                              { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
                            ]}
                          >
                            <Image source={item.icone} style={{ width: 24, height: 24, tintColor: corIcone }} resizeMode="contain" />
                            <Text
                              style={[tipografia.body, {

                                color: ativo ? isDark ? theme.black : theme.white : theme.textSecondary,
                              }]}
                            >
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => setTipoCamada(tipoCamada === 'satelite' ? 'ruas' : 'satelite')}
                        style={[
                          styles.seletorModoBtn,
                          {
                            backgroundColor: theme.inputBg,
                            //borderWidth: 1,
                            //borderColor: theme.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                          },
                        ]}
                      >
                        <Image
                          source={tipoCamada === 'satelite' ? satelite : mapaRua}
                          style={{ width: 24, height: 24, tintColor: theme.gray4 }}
                          resizeMode="contain"
                        />
                        <Text style={[tipografia.bodySecondary,]}>
                          {tipoCamada === 'satelite' ? 'Satélite' : 'Ruas'}
                        </Text>
                      </TouchableOpacity>

                      {/* BOTÃO TELA CHEIA (Aparece em Desktop e Mobile) */}
                      <TouchableOpacity
                        onPress={() => setMapaExpandido(true)}
                        style={{
                          backgroundColor: theme.inputBg,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 999,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8
                          //borderWidth: 1,
                          //borderColor: theme.border,
                        }}
                      >
                        <Image source={require('@/img/icons/telaCheia.svg')}></Image>
                        <Text style={[tipografia.bodySecondary,]}>
                          Tela Cheia
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Viewport do Mapa */}
                <View
                  style={{
                    flex: 1,
                    minHeight: isMobile ? 480 : 640,
                    position: 'relative',
                  }}
                >
                  {Platform.OS === 'web' ? (
                    <iframe
                      ref={iframeRef as any}
                      title="Vitta Google Hybrid Map"
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: isMobile ? 480 : 720,
                        border: 'none',
                      }}
                      srcDoc={htmlMapaGoogleTiles}
                      onLoad={() => {
                        iframeRef.current?.contentWindow?.postMessage(
                          {
                            tipo: 'ATUALIZAR_PONTOS',
                            pontos: pontosFiltrados,
                            origem: origemAtual,
                            selecionado: localSelecionado,
                            modo: modoTransporte,
                            abrirPassoAPasso: navegacaoAtiva,
                          },
                          '*'
                        );
                      }}
                    />
                  ) : (
                    <View style={[styles.mapaBoxPlaceholder, { backgroundColor: isDark ? '#1E1E1E' : '#E5E5E5' }]}>
                      <Text style={[tipografia.body, { color: theme.textSecondary }]}>
                        Mapa disponível no ambiente Web
                      </Text>
                    </View>
                  )}

                  {/* Bottom Sheet Flutuante de Rota no Rodapé do Mapa */}
                  {localSelecionado && (
                    <View
                      style={[
                        styles.cardFlutuanteRota,
                        {
                          bottom: isMobile ? 10 : 32,
                          left: isMobile ? 10 : 24,
                          right: isMobile ? 10 : 24,
                          padding: isMobile ? 12 : 16,
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: isMobile ? 'column' : 'row',
                          justifyContent: 'space-between',
                          alignItems: isMobile ? 'stretch' : 'center',
                          gap: 8,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[tipografia.caption, { color: theme.textSecondary, }]} numberOfLines={1}>
                            Destino: <Text style={{ fontWeight: '600', color: theme.textPrimary }}>{localSelecionado.nome}</Text>
                          </Text>
                          <Text style={[isMobile ? tipografia.h4 : tipografia.h3, { color: theme.textPrimary, marginTop: 1 }]} numberOfLines={1}>
                            {localSelecionado.tempoEstimado || '~3 min'}
                            <Text style={[tipografia.bodySecondary, { color: theme.textSecondary, fontSize: 13 }]}>
                              {' '}({localSelecionado.distanciaFormatada})
                            </Text>
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {/*<TouchableOpacity
                            onPress={() => setNavegacaoAtiva(!navegacaoAtiva)}
                            style={{
                              flex: isMobile ? 1 : undefined,
                              backgroundColor: theme.yellow5,
                              paddingHorizontal: 14,
                              paddingVertical: 10,
                              borderRadius: 12,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <Image
                              source={bussola}
                              style={{ width: 15, height: 15, tintColor: isDark ? '#000' : '#FFF' }}
                              resizeMode="contain"
                            />
                            <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '700', fontSize: 12 }}>
                              {navegacaoAtiva ? 'Ocultar Guia' : 'Passo a Passo'}
                            </Text>
                          </TouchableOpacity>*/}
                          <ButtonSecondary
                            texto={navegacaoAtiva ? 'Ocultar Guia' : 'Passo a Passo'}
                            onPress={() => setNavegacaoAtiva(!navegacaoAtiva)}
                            icone={navegacaoAtiva ? require('@/img/icons/eye-off.svg') : require('@/img/icons/bussola.svg')}
                          ></ButtonSecondary>

                          {isMobile && (
                            <ButtonSecondary
                              texto='Ver lista'
                              onPress={() => setAbaMobile('lista')}
                              icone={require('@/img/icons/view.svg')}
                            ></ButtonSecondary>

                          )}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ========================================================================= */}
      {/* MODO TELA CHEIA TOTAL (Cobre 100% da tela em Desktop e Mobile)           */}
      {/* ========================================================================= */}
      {mapaExpandido && (
        <View
          style={{
            position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: '#000000',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Barra Flutuante Superior em Tela Cheia */}
          <View
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              zIndex: 100000,
              backgroundColor: isDark ? 'rgba(24, 24, 24, 0.92)' : 'rgba(255, 255, 255, 0.95)',
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              //   backdropFilter: 'blur(10px)',
              gap: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            {/* Veículos */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { id: 'carro', icone: carro, label: 'Carro' },
                { id: 'moto', icone: moto, label: 'Moto' },
                { id: 'bicicleta', icone: bike, label: 'Bike' },
                { id: 'pe', icone: andando, label: 'A pé' },
              ].map((item) => {
                const ativo = modoTransporte === item.id;
                const corIcone = ativo
                  ? isDark ? '#000000' : '#FFFFFF'
                  : theme.textSecondary;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setModoTransporte(item.id as ModoTransporte)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 999,
                      backgroundColor: ativo ? theme.yellow5 : theme.inputBg,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Image source={item.icone} style={{ width: 14, height: 14, tintColor: corIcone }} resizeMode="contain" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: ativo ? (isDark ? '#000' : '#FFF') : theme.textSecondary,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {/* SOS no modo tela cheia */}
              <TouchableOpacity
                onPress={acionarEmergenciaHospitalMaisProximo}
                style={{
                  backgroundColor: theme.delete || '#C31F1F',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Image source={emergencia} style={{ width: 14, height: 14, tintColor: '#FFF' }} resizeMode="contain" />
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>SOS</Text>
              </TouchableOpacity>

              {/* Alternar Camada */}
              <TouchableOpacity
                onPress={() => setTipoCamada(tipoCamada === 'satelite' ? 'ruas' : 'satelite')}
                style={{
                  backgroundColor: theme.inputBg,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textPrimary }}>
                  {tipoCamada === 'satelite' ? '🛰️ Satélite' : '🗺️ Ruas'}
                </Text>
              </TouchableOpacity>

              {/* Botão de Fechar Tela Cheia */}
              <TouchableOpacity
                onPress={() => setMapaExpandido(false)}
                style={{
                  backgroundColor: theme.yellow5,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '800', fontSize: 13 }}>
                  ✕ Sair
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Iframe em 100% da viewport */}
          <iframe
            ref={iframeRef as any}
            title="Vitta Fullscreen Map"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            srcDoc={htmlMapaGoogleTiles}
            onLoad={() => {
              iframeRef.current?.contentWindow?.postMessage(
                {
                  tipo: 'ATUALIZAR_PONTOS',
                  pontos: pontosFiltrados,
                  origem: origemAtual,
                  selecionado: localSelecionado,
                  modo: modoTransporte,
                  abrirPassoAPasso: navegacaoAtiva,
                },
                '*'
              );
            }}
          />

          {/* Card Flutuante de Rota no Rodapé da Tela Cheia */}
          {localSelecionado && (
            <View
              style={{
                position: 'absolute',
                bottom: 18,
                left: 14,
                right: 14,
                zIndex: 100000,
                backgroundColor: isDark ? 'rgba(24, 24, 24, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                borderRadius: 22,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.border,
                // backdropFilter: 'blur(10px)',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 14,
                elevation: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[tipografia.caption, { color: theme.textSecondary, fontSize: 12 }]} numberOfLines={1}>
                  Destino: <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{localSelecionado.nome}</Text>
                </Text>
                <Text style={[tipografia.h3, { color: theme.textPrimary, marginTop: 2 }]} numberOfLines={1}>
                  {localSelecionado.tempoEstimado || '~3 min'}
                  <Text style={[tipografia.bodySecondary, { color: theme.textSecondary }]}>
                    {' '}({localSelecionado.distanciaFormatada})
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setNavegacaoAtiva(!navegacaoAtiva)}
                style={{
                  backgroundColor: theme.yellow5,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Image source={bussola} style={{ width: 16, height: 16, tintColor: isDark ? '#000' : '#FFF' }} resizeMode="contain" />
                <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '800', fontSize: 13 }}>
                  {navegacaoAtiva ? 'Ocultar Guia' : 'Ver Passo a Passo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}