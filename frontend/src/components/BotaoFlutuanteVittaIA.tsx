import React, { useState, useRef } from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Animated,
    Platform,
} from "react-native";
import { tipografia } from "@/styles/tipografia";
import VittaIA from "./vittaIA";
import logoVittaIA from "@/img/icons/vittaIA.svg";
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
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(animScale, {
                toValue: 1.12,
                friction: 5,
                tension: 100,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    };

    const handleRestaurar = () => {
        setIsHovered(false);
        Animated.parallel([
            Animated.timing(animOpacity, {
                toValue: 0.6,
                duration: 300,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(animScale, {
                toValue: 1,
                friction: 6,
                useNativeDriver: Platform.OS !== 'web',
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
                    }, { backgroundColor: theme.cardBg },

                ]}
                onMouseEnter={handleDestacar}
                onMouseLeave={handleRestaurar}
            >
                <TouchableOpacity
                    onPress={() => setModalAberto(true)}
                    onPressIn={handleDestacar}
                    onPressOut={handleRestaurar}
                    activeOpacity={0.9}
                    style={styles.touchableArea}
                >
                    <View style={[styles.logoContainer]}>
                        <img
                            src={require('@/img/logotipo/vittaIA.svg')}
                            alt="Vitta IA"
                            style={{
                                width: 50,
                                height: 50,
                                transition: "transform 0.2s ease",
                            }}
                        />

                        <Text style={[tipografia.h4, { color: theme.textPrimary }]}>Suporte</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <Modal
                animationType="fade"
                transparent
                visible={modalAberto}
                onRequestClose={() => setModalAberto(false)}
            >
                <View style={styles.overlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
                        <View style={[styles.headerModal, { backgroundColor: theme.inputBg, borderBottomColor: theme.border }]}>
                            <View style={styles.tituloContainer}>
                                <img
                                    src={require('@/img/logotipo/vittaIA.svg')}
                                    alt="Vitta"
                                    style={{
                                        width: 34,
                                        height: 34,
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={() => setModalAberto(false)}
                                style={[styles.botaoFechar, { backgroundColor: theme.cardBg }]}
                            >
                                <Text style={[styles.textoFechar, { color: theme.textSecondary }]}>✕</Text>
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
        backgroundColor: '#fff',
        zIndex: 999,
        cursor: "pointer",
    },
    botaoFlutuanteHover: {
        elevation: 16,
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 1 },
    },
    touchableArea: {

        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        cursor: "pointer",
    },
    textoFechar: {
        fontSize: 18,
        fontWeight: "bold",
    },
    conteudoModal: {
        flex: 1,
    },
});