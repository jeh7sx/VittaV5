import { View } from 'react-native';
import { IconBan, IconCheck } from '../Icons';

interface BadgeProps {
  status: 'ativo' | 'bloqueado';
}

export default function Badge({ status }: BadgeProps) {
  const ativo = status === 'ativo';
  return (
    <View
      accessibilityLabel={ativo ? 'Usuário ativo' : 'Usuário bloqueado'}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: ativo ? '#E3F5E8' : '#FBE4E6',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {ativo ? <IconCheck /> : <IconBan />}
    </View>
  );
}