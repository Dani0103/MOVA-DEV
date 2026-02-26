import { apiFetch } from "../config/api";

export async function loadMovimientos(token) {
  const response = await apiFetch("/movimientos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}
