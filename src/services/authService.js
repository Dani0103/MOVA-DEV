import { apiFetch } from "../config/api";

// REGISTRO APP
export async function registerUser({
  nombre,
  apellido,
  email,
  nacionalidad,
  moneda,
  password,
}) {
  return await apiFetch("/register", {
    method: "POST",
    body: JSON.stringify({
      nombre,
      apellido,
      email,
      nacionalidad,
      moneda,
      password,
    }),
  });
}

// LOGIN APP
export async function loginUser(email, password) {
  return await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}
