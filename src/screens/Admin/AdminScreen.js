import {
  View, Text, StyleSheet, FlatList, TextInput,
  Switch, ActivityIndicator, RefreshControl,
} from "react-native";
import { useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../theme/useTheme";
import { loadAdminUsuarios, toggleUsuarioActivo } from "../../services/AdminService";
import { universalAlert } from "../../utils/universalAlert";

export default function AdminScreen() {
  const { user, token } = useAuth();
  const theme = useTheme();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await loadAdminUsuarios(token);
      setUsuarios(res.data ?? []);
    } catch (e) {
      universalAlert("Error", e.message || "No se pudo cargar usuarios.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchUsuarios(); }, [fetchUsuarios]));

  const onRefresh = () => { setRefreshing(true); fetchUsuarios(); };

  const handleToggle = async (item) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, activo: !u.activo } : u)),
    );
    try {
      await toggleUsuarioActivo(token, item.id);
    } catch (e) {
      setUsuarios((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, activo: item.activo } : u)),
      );
      universalAlert("Error", e.message || "No se pudo cambiar el estado.");
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return usuarios;
    const q = search.toLowerCase();
    return usuarios.filter(
      (u) =>
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [usuarios, search]);

  const totalActivos = useMemo(() => usuarios.filter((u) => u.activo).length, [usuarios]);

  const formatLogin = (date) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const renderItem = ({ item }) => {
    const initials = `${item.nombre?.[0] ?? ""}${item.apellido?.[0] ?? ""}`.toUpperCase();
    const isPremium = item.plan?.id !== 1;
    const isMe = item.email === user.email;
    return (
      <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: item.activo ? theme.primary + "30" : theme.error + "20" }]}>
          <Text style={[styles.avatarText, { color: item.activo ? theme.primary : theme.error }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {item.nombre} {item.apellido}
            </Text>
            <View style={[styles.planBadge, { backgroundColor: isPremium ? "#F59E0B20" : theme.border }]}>
              <Text style={[styles.planText, { color: isPremium ? "#F59E0B" : theme.textMuted }]}>
                {item.plan?.nombre ?? "sin plan"}
              </Text>
            </View>
          </View>
          <Text style={[styles.email, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.email}
          </Text>
          <View style={styles.loginRow}>
            <Ionicons name="time-outline" size={11} color={theme.textMuted} />
            <Text style={[styles.loginText, { color: theme.textMuted }]}>
              {formatLogin(item.ultimo_login)}
            </Text>
          </View>
        </View>
        <Switch
          value={item.activo}
          onValueChange={() => handleToggle(item)}
          disabled={isMe}
          trackColor={{ false: theme.error + "50", true: theme.primary + "60" }}
          thumbColor={item.activo ? theme.primary : theme.error}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.primary }]}>{usuarios.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: "#4ADE80" }]}>{totalActivos}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activos</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.statNum, { color: theme.error }]}>{usuarios.length - totalActivos}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Inactivos</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={16} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar por nombre o email..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Ionicons name="close-circle" size={16} color={theme.textMuted} onPress={() => setSearch("")} />
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="people-outline" size={40} color={theme.textMuted} style={{ marginBottom: 8 }} />
            <Text style={{ color: theme.textMuted }}>No se encontraron usuarios.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1 },
  statNum: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", marginTop: 2 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  listContent: { paddingBottom: 40 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 15, fontWeight: "bold" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: "bold", flexShrink: 1 },
  planBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  planText: { fontSize: 10, fontWeight: "700" },
  email: { fontSize: 12, marginBottom: 3 },
  loginRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  loginText: { fontSize: 11 },
});
