import { AuthProvider } from "./src/context/AuthContext";
import { AccountProvider } from "./src/context/AccountContext"; // Asegúrate de que se llame Provider
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <AccountProvider>
        <AppNavigator />
      </AccountProvider>
    </AuthProvider>
  );
}
