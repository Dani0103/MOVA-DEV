import { apiFetch } from "../config/api";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// Normaliza campos numéricos del API → pantallas
const normalizeRecurrente = (r) => ({
  ...r,
  monto: parseFloat(r.monto) || 0,
});

export async function loadRecurrentes(token) {
  const res = await apiFetch("/recurrentes", {
    method: "GET",
    headers: authHeaders(token),
  });
  return (res?.data ?? []).map(normalizeRecurrente);
}

export async function createRecurrente(token, data) {
  const body = {
    cuenta_id: data.cuenta_id,
    monto: parseFloat(data.monto),
    tipo: data.tipo,
    frecuencia: data.frecuencia,
  };

  if (data.categoria_id != null) {
    body.categoria_id = data.categoria_id;
  }
  if (data.dia_ejecucion != null) {
    body.dia_ejecucion = parseInt(data.dia_ejecucion, 10);
  }
  if (data.proxima_ejecucion != null) {
    body.proxima_ejecucion = data.proxima_ejecucion;
  }
  if (data.fecha_fin != null) {
    body.fecha_fin = data.fecha_fin;
  }
  if (data.activa != null) {
    body.activa = data.activa;
  }

  const res = await apiFetch("/recurrentes", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const item = res?.data ?? res;
  return item ? normalizeRecurrente(item) : null;
}

export async function deleteRecurrente(token, id) {
  return await apiFetch(`/recurrentes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function toggleRecurrente(token, id, activa) {
  const res = await apiFetch(`/recurrentes/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ activa }),
  });
  const item = res?.data ?? res;
  return item ? normalizeRecurrente(item) : null;
}
