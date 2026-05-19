import { AuthProvider } from "./src/context/AuthContext";
import { AccountProvider } from "./src/context/AccountContext";
import { CategoryProvider } from "./src/context/CategoryContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import AppDownloadBanner from "./src/components/ui/AppDownloadBanner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountProvider>
          <CategoryProvider>
            <AppNavigator />
            {/* Banner de descarga — solo visible en web + navegador móvil */}
            <AppDownloadBanner />
          </CategoryProvider>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
