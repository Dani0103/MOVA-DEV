import { apiFetch } from "../config/api";

// REGISTRO APP
export async function registerUser({
  nombre,
  apellido,
  email,
  nacionalidad,
  moneda,
  password,
  confirmedPassword,
  device_name,
}) {
  return await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      nombre,
      apellido,
      email,
      nacionalidad,
      moneda,
      password,
      password_confirmation: confirmedPassword,
      device_name,
      plan_id: 1,
    }),
  });
}

// LOGIN APP
export async function loginUser(email, password, device_name) {
  return await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      device_name,
    }),
  });
}

// LOGIN APP
export async function Monedas() {
  return await apiFetch("/monedas", {
    method: "GET",
  });
}

export async function Paises() {
  return await apiFetch("/paises", {
    method: "GET",
  });
}

export async function updateProfile(token, data) {
  return await apiFetch("/auth/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// Cerrar sesion en TODOS los dispositivos
export async function logoutAll(token) {
  return await apiFetch("/auth/logout-all", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Solicitar recuperacion de contrasena (envia email con link)
export async function forgotPassword(email) {
  return await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Restablecer contrasena con token
export async function resetPassword({ token, email, password, password_confirmation }) {
  return await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, email, password, password_confirmation }),
  });
}
