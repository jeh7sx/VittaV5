import React, { ReactNode, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
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
  const triggerRef = useRef<View | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const { width, height } = useWindowDimensions();

  function abrirMenu() {
    if (desabilitado) return;

    if (triggerRef.current?.measureInWindow) {
      triggerRef.current.measureInWindow((x, y, triggerWidth, triggerHeight) => {
        const menuWidth = 190;
        let left = x + triggerWidth - menuWidth;
        if (left < 8) left = 8;
        if (left + menuWidth > width - 8) left = width - menuWidth - 8;

        const top = y + triggerHeight + 6;
        setPos({ top: Math.min(top, height - 120), left });
        setAberto(true);
      });
    } else {
      setPos({ top: 80, left: Math.max(8, width - 200) });
      setAberto(true);
    }
  }

  return (
    <View ref={triggerRef} collapsable={false}>
      <Pressable
        onPress={aberto ? () => setAberto(false) : abrirMenu}
        disabled={desabilitado}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: aberto ? '#EFEFEF' : 'transparent',
          opacity: desabilitado ? 0.4 : 1,
        }}
        accessibilityLabel="Abrir menu de ações"
      >
        <IconDots />
      </Pressable>

      <Modal
        visible={aberto}
        transparent
        animationType="none"
        onRequestClose={() => setAberto(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'transparent' }}
          onPress={() => setAberto(false)}
        >
          {pos && (
            <View
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                minWidth: 180,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#EAEAEA',
                paddingVertical: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.14,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              {acoes.map((acao) => (
                <TouchableOpacity
                  key={acao.chave}
                  onPress={() => {
                    setAberto(false);
                    setTimeout(() => acao.onPress(), 50);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                  }}
                >
                  {acao.icone ? <View>{acao.icone}</View> : null}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: acao.destrutivo ? '#B00020' : '#333333',
                    }}
                  >
                    {acao.rotulo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}