import { apiFetch } from "../config/api";

export async function loadMovimientos(token) {
  return await apiFetch("/transacciones", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}

export async function createMovimiento(formData, token) {
  return await apiFetch("/transacciones", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Limpia el Bearer aquí
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(formData),
  });
}

export async function editMovimiento(id, data, token) {
  const body = {
    descripcion: data.descripcion,
    monto: data.monto,
    fecha: data.fecha,
    categoria_id: data.categoria_id,
  };

  return await apiFetch(`/transacciones/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function deleteMovimiento(id, token) {
  return await apiFetch(`/transacciones/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
}
