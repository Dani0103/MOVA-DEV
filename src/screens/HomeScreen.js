import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Bienvenido 👋</Text>
      <Text>{user?.name}</Text>
      <Text>{user?.email}</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
