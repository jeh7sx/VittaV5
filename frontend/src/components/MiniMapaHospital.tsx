import React from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import iconeRota from '@/img/icons/iconeRota.svg';

interface MiniMapaHospitalProps {
  hospital: string;
  lat?: number | null;
  lng?: number | null;
  exibirBotaoRota?: boolean;
}

export default function MiniMapaHospital({
  hospital,
  lat,
  lng,
  exibirBotaoRota = true,
}: MiniMapaHospitalProps) {
  if (!hospital && !lat && !lng) return null;

  // Monta URL de embed do Google Maps
  const queryMaps = lat && lng ? `${lat},${lng}` : encodeURIComponent(hospital);
  const embedUrl = `https://maps.google.com/maps?q=${queryMaps}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Função para abrir o aplicativo de mapas nativo
  function abrirNoMaps() {
    const url =
      lat && lng
        ? Platform.OS === 'ios'
          ? `maps:0,0?q=${encodeURIComponent(hospital)}@${lat},${lng}`
          : `geo:${lat},${lng}?q=${encodeURIComponent(hospital)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital)}`;

    Linking.openURL(url).catch(() => {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital)}`, '_blank');
    });
  }

  return (
    <View style={styles.container}>
      {/* Visualização do Mapa */}
      <View style={styles.mapaWrapper}>
        {Platform.OS === 'web' ? (
          <iframe
            title="Localização do Hospital"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
          />
        ) : (
          <View style={styles.mobilePlaceholder}>
            <Text style={{ fontSize: 28, marginBottom: 4 }}>📍</Text>
            <Text style={{ fontSize: 13, color: '#444', fontWeight: '600', textAlign: 'center' }}>
              {hospital}
            </Text>
          </View>
        )}
      </View>

      {/* Botão "Ir para o hospital" */}
      {exibirBotaoRota && (
        <TouchableOpacity style={styles.botaoRota} onPress={abrirNoMaps} activeOpacity={0.8}>
          {/* <Text style={styles.iconeBotao}>🚗</Text> */}
          <Image source={iconeRota} style={{ width: 16, height: 16 }} />
          <Text style={styles.textoBotao}>Ir para o hospital</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  mapaWrapper: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#F8F9FA',
  },
  mobilePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  botaoRota: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7B500',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
    cursor: 'pointer' as any,
  },
  iconeBotao: {
    fontSize: 16,
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});