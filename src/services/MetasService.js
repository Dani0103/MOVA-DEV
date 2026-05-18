import { apiFetch } from "../config/api";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// Normaliza campos de API → campos que usan las pantallas
const normalizeMeta = (meta) => ({
  ...meta,
  objetivo: parseFloat(meta.monto_objetivo) || 0,
  actual: parseFloat(meta.monto_actual) || 0,
  fecha_limite: meta.fecha_objetivo ?? null,
  color: meta.color || "#38BDF8",
  icono: meta.icono || "trophy",
});

export async function loadMetas(token) {
  const res = await apiFetch("/premium/metas", {
    method: "GET",
    headers: authHeaders(token),
  });
  return (res?.data ?? []).map(normalizeMeta);
}

export async function createMeta(token, { nombre, montoObjetivo, montoInicial, color, icono }) {
  const res = await apiFetch("/premium/metas", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      nombre,
      monto_objetivo: parseFloat(montoObjetivo),
      monto_actual: parseFloat(montoInicial || 0),
      color,
      icono,
    }),
  });
  const meta = res?.data ?? res;
  return meta ? normalizeMeta(meta) : null;
}

export async function updateMeta(token, metaId, data) {
  const res = await apiFetch(`/premium/metas/${metaId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const meta = res?.data ?? res;
  return meta ? normalizeMeta(meta) : null;
}

export async function deleteMeta(token, metaId) {
  return await apiFetch(`/premium/metas/${metaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function loadAportes(token, metaId) {
  const res = await apiFetch(`/premium/metas/${metaId}/aportes`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return res?.data ?? [];
}

export async function createAporte(token, metaId, { monto, nota }) {
  const res = await apiFetch(`/premium/metas/${metaId}/aportes`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ monto: parseFloat(monto), nota: nota || null }),
  });
  return res?.data ?? res;
}
