import React, { useState, useRef } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  Pressable,
  View,
  StyleSheet,
  Animated,
  Platform,
  Image,
} from "react-native";
import { tipografia } from "@/styles/tipografia";
import VittaIA from "./vittaIA";
import { useTheme } from "@/context/ThemeContext";

export default function BotaoFlutuanteVittaIA() {
  const { theme } = useTheme();
  const [modalAberto, setModalAberto] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const animOpacity = useRef(new Animated.Value(0.6)).current;
  const animScale = useRef(new Animated.Value(1)).current;

  const handleDestacar = () => {
    setIsHovered(true);
    Animated.parallel([
      Animated.timing(animOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(animScale, {
        toValue: 1.12,
        friction: 5,
        tension: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  const handleRestaurar = () => {
    setIsHovered(false);
    Animated.parallel([
      Animated.timing(animOpacity, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(animScale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  };

  return (
    <>
      <Animated.View
        style={[
          styles.botaoFlutuante,
          isHovered && styles.botaoFlutuanteHover,
          {
            borderWidth: 1,
            borderColor: theme.yellow2,
            opacity: animOpacity,
            transform: [{ scale: animScale }],
            backgroundColor: theme.cardBg,
          },
        ]}
      >
        <Pressable
          onPress={() => setModalAberto(true)}
          onHoverIn={handleDestacar}
          onHoverOut={handleRestaurar}
          onPressIn={handleDestacar}
          onPressOut={handleRestaurar}
          style={[
            styles.touchableArea,
            Platform.OS === "web" && ({ cursor: "pointer" } as any),
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("@/img/logotipo/vittaIA.svg")}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
            <Text style={[tipografia.h4, { color: theme.textPrimary }]}>
              Suporte
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      <Modal
        animationType="fade"
        transparent
        visible={modalAberto}
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.cardBg, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.headerModal,
                {
                  backgroundColor: theme.inputBg,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.tituloContainer}>
                <Image
                  source={require("@/img/logotipo/vittaIA.svg")}
                  style={{ width: 34, height: 34 }}
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                onPress={() => setModalAberto(false)}
                style={[
                  styles.botaoFechar,
                  { backgroundColor: theme.cardBg },
                  Platform.OS === "web" && ({ cursor: "pointer" } as any),
                ]}
              >
                <Text
                  style={[
                    styles.textoFechar,
                    { color: theme.textSecondary },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.conteudoModal}>
              <VittaIA />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botaoFlutuante: {
    position: "absolute",
    right: 24,
    bottom: 24,
    borderRadius: 994,
    elevation: 4,
    padding: 8,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  botaoFlutuanteHover: {
    elevation: 16,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
  },
  touchableArea: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    height: "82%",
    maxWidth: 900,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    borderWidth: 1,
  },
  headerModal: {
    height: 64,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  tituloContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  botaoFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  textoFechar: {
    fontSize: 18,
    fontWeight: "bold",
  },
  conteudoModal: {
    flex: 1,
  },
});