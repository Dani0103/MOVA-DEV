import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import FloatingMenuButton from "../components/layout/FloatingMenuButton";

export default function InfoPersonal() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>
          {user.nombre} {user.apellido}
        </Text>

        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Nacionalidad</Text>
          <Text style={styles.value}>{user.nacionalidad}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Moneda</Text>
          <Text style={styles.value}>{user.moneda}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Estado</Text>
          <Text style={styles.value}>
            {user.activo ? "Activa" : "Inactiva"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Último acceso</Text>
          <Text style={styles.value}>{formatDate(user.ultimo_login)}</Text>
        </View>
      </View>

      <FloatingMenuButton />
    </View>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
  },

  card: {
    backgroundColor: "#0F172A",
    // borderRadius: 18,
    padding: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  email: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 10,
  },

  row: {
    marginTop: 10,
  },

  label: {
    color: "#94A3B8",
    fontSize: 12,
  },

  value: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },
});
