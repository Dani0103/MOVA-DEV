# 📱 MOVA Frontend - Aplicación de Finanzas Personales

Esta es la interfaz móvil de **MOVA**, desarrollada con **React Native** y el ecosistema **Expo**. La aplicación permite gestionar ingresos, gastos y visualizar estados financieros en tiempo real.

---

## 🚀 Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu máquina de desarrollo:

- **Node.js** (Versión 18 o superior recomendada).
- **npm** o **yarn**.
- **Expo Go** (Disponible en Play Store o App Store) para probar en un dispositivo físico.
- **Simulador de iOS (Xcode)** o **Emulador de Android (Android Studio)** si prefieres probar en PC.

---

## 📦 Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/Dani0103/MOVA-DEV
   cd MOVA-DEV
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

   o si usas yarn

   ```bash
   yarn install

   ```

## ⚙️ Configuración de la API

Para que la app se comunique con el servidor, debes configurar la URL base.

Busca el archivo de configuración (ej. services/api.js o donde manejes tus constantes) y asegúrate de tener la ruta correcta:

```JavaScript
// Para desarrollo local (usando la IP de tu PC):
export const API_URL = "http://127.0.0.1:8000/api";

// Para producción (Hostinger):
export const API_URL = "https://mova.dalioss.xyz/backend/public/api";
```

## 🏃 Ejecución en Desarrollo

Para iniciar el servidor de desarlrolo de Expo:

```Bash
npx expo start
```

- Dispositivo Físico: Escanea el código QR que aparece en la terminal con la app Expo Go.

- Android: Presiona a en la terminal (requiere emulador abierto).

- iOS: Presiona i en la terminal (requiere Mac con Xcode).

## 🏗️ Generación de Build (Producción)

Este proyecto utiliza EAS (Expo Application Services) para generar los archivos instalables (.apk o .ipa).

1. Instalar EAS CLI
   ```Bash
   npm install -g eas-cli
   ```
2. Iniciar Sesión
   ```Bash
   eas login
   ```
3. Crear Build de Android (APK de prueba)
   ```Bash
   eas build --platform android --profile preview
   ```
4. Crear Build para Tiendas (AAB / IPA)
   ```Bash
   eas build --platform android # Para Google Play
   eas build --platform ios # Para App Store
   ```

## 🌐 Web (Hostinger)

Para desplegar la versión web en tu dominio:

1. **Generar archivos de producción:**
   ```Bash
   npx expo export -p web
   ```
2. **Despliegue:** Sube el contenido de la carpeta /dist resultante directamente a la raíz public_html de tu servidor.

## 🛠️ Tecnologías Principales

- React Native / Expo (Framework principal).
- React Navigation (Navegación entre pantallas)
- Context API (Gestión de estado global y autenticación).
- Axios (Peticiones HTTP).

## ✒️ Autor

- **Daniel Felipe Ruiz Tovar** — _Front-End Developer_
