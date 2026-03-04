import { API_URL } from "./env";
import { globalLogout } from "../context/AuthContext"; // Importamos la función

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // 🚨 INTERCEPTOR DE TOKEN VENCIDO / INVALIDO
  if (response.status === 401) {
    if (typeof globalLogout === "function") {
      globalLogout(); // Esto borra el estado y te manda al Login al instante
    }
    throw new Error(
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Creamos el error con el mensaje principal
    const apiError = new Error(data?.message || "Error en la petición");

    // Le adjuntamos el objeto 'errors' de Laravel (donde viene el texto del email)
    apiError.errors = data?.errors;

    // Lanzamos el error modificado
    throw apiError;
  }

  return data;
}
