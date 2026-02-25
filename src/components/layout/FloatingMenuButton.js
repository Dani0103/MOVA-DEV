import { TouchableOpacity, StyleSheet } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { openDrawer } from "../../navigation/RootNavigation";

export default function FloatingMenuButton() {
  const drawerStatus = useDrawerStatus();

  if (drawerStatus === "open") return null;

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={openDrawer}>
      <Ionicons name="menu" size={26} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    left: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
