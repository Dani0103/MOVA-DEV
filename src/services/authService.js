import { apiFetch } from "../config/api";

// REGISTRO APP
export async function registerUser({
  name,
  email,
  password,
  country,
  currency,
}) {
  return await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      country,
      currency,
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
