import { ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import ReactDOM from 'react-dom';
import { IconDots } from '../Icons';

export interface AcaoMenu {
  chave: string;
  rotulo: string;
  icone?: ReactNode;
  destrutivo?: boolean;
  onPress: () => void;
}

interface ActionMenuProps {
  acoes: AcaoMenu[];
  desabilitado?: boolean;
}

export default function ActionMenu({ acoes, desabilitado }: ActionMenuProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<any>(null);
  const portalRoot = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Fecha o menu ao clicar fora (apenas necessário no ambiente web)
  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [aberto]);

  // Portal root and position for the dropdown (web)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!portalRoot.current) {
      portalRoot.current = document.createElement('div');
      document.body.appendChild(portalRoot.current);
    }

    return () => {
      if (portalRoot.current) {
        try {
          document.body.removeChild(portalRoot.current);
        } catch (e) {}
        portalRoot.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!aberto) {
      setPos(null);
      return;
    }
    try {
      const rect = containerRef.current?.getBoundingClientRect?.();
      if (rect) {
        const menuWidth = 220;
        let left = Math.max(8, rect.right - menuWidth);
        if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
        const top = Math.min(window.innerHeight - 8, rect.bottom + 8);
        setPos({ top, left });
      }
    } catch (e) {
      setPos(null);
    }
  }, [aberto]);

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 9999 }}>
      <Pressable
        onPress={() => !desabilitado && setAberto((a) => !a)}
        disabled={desabilitado}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: desabilitado ? 0.4 : 1,
        }}
        accessibilityLabel="Abrir menu de ações"
      >
        <IconDots />
      </Pressable>

      {aberto && portalRoot.current && pos
        ? ReactDOM.createPortal(
            <>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAberto(false);
                }}
                style={{ position: 'fixed', inset: 0, zIndex: 2147483646, backgroundColor: 'transparent' }}
              />
              <div
                style={{
                  position: 'fixed',
                  top: pos.top,
                  left: pos.left,
                  minWidth: 180,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#EAEAEA',
                  paddingTop: 6,
                  paddingBottom: 6,
                  boxShadow: '0px 8px 16px rgba(0,0,0,0.12)',
                  zIndex: 2147483647,
                  pointerEvents: 'auto',
                }}
              >
                {acoes.map((acao) => (
                  <div
                    key={acao.chave}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('ActionMenu click', acao.chave);
                      setAberto(false);
                      try {
                        // visual toast for debugging / user feedback
                        try {
                          const t = document.createElement('div');
                          t.textContent = `Ação: ${acao.chave}`;
                          t.style.position = 'fixed';
                          t.style.right = '20px';
                          t.style.top = '20px';
                          t.style.background = 'rgba(0,0,0,0.8)';
                          t.style.color = '#fff';
                          t.style.padding = '8px 12px';
                          t.style.borderRadius = '8px';
                          t.style.zIndex = '2147483699';
                          document.body.appendChild(t);
                          setTimeout(() => t.remove(), 1400);
                        } catch (e) {}
                        // ensure the handler runs outside of portal render cycle
                        setTimeout(() => acao.onPress(), 0);
                      } catch (e) {
                        console.error('Erro executando ação do menu:', e);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 14px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{acao.icone}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: acao.destrutivo ? '#B00020' : '#333' }}>{acao.rotulo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>,
            portalRoot.current,
          )
        : null}
    </div>
  );
}

function ItemMenu({ acao, onPress }: { acao: AcaoMenu; onPress: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore
      onHoverIn={() => setHover(true)}
      // @ts-ignore
      onHoverOut={() => setHover(false)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: hover ? (acao.destrutivo ? '#FDECEC' : '#F7F7F7') : 'transparent',
      }}
    >
      {acao.icone}
      <Text style={{ fontSize: 13, fontWeight: '600', color: acao.destrutivo ? '#B00020' : '#333' }}>
        {acao.rotulo}
      </Text>
    </Pressable>
  );
}