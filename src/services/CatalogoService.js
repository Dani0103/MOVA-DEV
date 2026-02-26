import { apiFetch } from "../config/api";

//Tipo de Moneda
export async function TypeCurrency(token) {
  return await apiFetch("/monedas", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    method: "GET",
  });
}

//Tipo de Moneda
export async function TypeAccount(token) {
  return await apiFetch("/tipos-cuenta", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    method: "GET",
  });
}
