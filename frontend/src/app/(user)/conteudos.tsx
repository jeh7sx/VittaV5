import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { tipografia } from "@/styles/tipografia";

export default function Conteudos() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: theme.bg,
      }}
    >
      <Text style={[tipografia.h2, { color: theme.textPrimary }]}>
        Conteúdos e orientações
      </Text>
      <Text style={{ marginTop: 10, textAlign: "center", color: theme.textSecondary }}>
        Em breve, você encontrará materiais para apoiar a rotina de cuidados.
      </Text>
    </View>
  );
}