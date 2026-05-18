import { AuthProvider } from "./src/context/AuthContext";
import { AccountProvider } from "./src/context/AccountContext";
import { CategoryProvider } from "./src/context/CategoryContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountProvider>
          <CategoryProvider>
            <AppNavigator />
          </CategoryProvider>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
