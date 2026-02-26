import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const routeName = useNavigationState((state) => {
    const route = state.routes[state.index];

    // Si es stack anidado (como CuentasStack)
    if (route.state) {
      const nestedRoute = route.state.routes[route.state.index];
      return nestedRoute.name;
    }

    return route.name;
  });

  const isHome = routeName === "Home";

  const formatTitle = (name) => {
    if (name === "CuentasHome") return "Cuentas";

    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <View style={styles.header}>
      {/* Botón menú */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Ionicons name="menu" size={26} color="white" />
      </TouchableOpacity>

      {/* Contenido dinámico */}
      {isHome ? (
        <View style={styles.centerContent}>
          <Text style={styles.welcome}>Hola</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.nombre}, {user?.apellido}
          </Text>
        </View>
      ) : (
        <View style={styles.centerContent}>
          <Text style={styles.title}>{formatTitle(routeName)}</Text>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 50,
    borderBottomWidth: 2,
    borderBottomColor: "#1E293B",
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
  },

  welcome: {
    color: "#94A3B8",
    fontSize: 12,
  },

  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  logoutBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  logoutText: {
    color: "#F87171",
    fontWeight: "600",
  },
});
