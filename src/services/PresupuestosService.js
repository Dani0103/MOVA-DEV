import { apiFetch } from "../config/api";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// Normaliza campos numéricos del API → pantallas
const normalizePresupuesto = (p) => ({
  ...p,
  monto_limite: parseFloat(p.monto_limite) || 0,
  monto_consumido: parseFloat(p.monto_consumido) || 0,
  porcentaje_consumido: parseFloat(p.porcentaje_consumido) || 0,
  notificar_al_llegar_al_percent: p.notificar_al_llegar_al_percent != null
    ? parseInt(p.notificar_al_llegar_al_percent)
    : null,
});

export async function loadPresupuestos(token) {
  const res = await apiFetch("/presupuestos", {
    method: "GET",
    headers: authHeaders(token),
  });
  return (res?.data ?? []).map(normalizePresupuesto);
}

export async function createPresupuesto(token, data) {
  const body = {
    monto_limite: parseFloat(data.monto_limite),
    periodo_inicio: data.periodo_inicio,
    periodo_fin: data.periodo_fin,
  };
  if (data.categoria_id != null) {
    body.categoria_id = data.categoria_id;
  }
  if (data.notificar_al_llegar_al_percent != null) {
    body.notificar_al_llegar_al_percent = parseInt(data.notificar_al_llegar_al_percent);
  }

  const res = await apiFetch("/presupuestos", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const item = res?.data ?? res;
  return item ? normalizePresupuesto(item) : null;
}

export async function deletePresupuesto(token, id) {
  return await apiFetch(`/presupuestos/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
