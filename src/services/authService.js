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
export async function loginUser(email, password) {
  return await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}
