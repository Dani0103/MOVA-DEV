import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.userContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.nombre?.charAt(0)}</Text>
        </View>

        <View>
          <Text style={styles.welcome}>Hola</Text>
          <Text style={styles.name}>
            {user?.nombre}, {user?.apellido}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 21, // ✔ importante para que sea avatar real
  },

  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
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

  logoutBtn: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 6,
    // borderRadius: 8,
  },

  logoutText: {
    color: "#F87171",
    fontWeight: "600",
  },
});
