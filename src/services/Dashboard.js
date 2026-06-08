import { apiFetch } from "../config/api";

/**
 * Obtiene el dashboard. Acepta filtros opcionales por rango de fechas.
 * @param {string} token - Bearer token
 * @param {{ fecha_desde?: string, fecha_hasta?: string, cuenta_id?: number }} filtros
 */
export async function GetDashboard(token, filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
  if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
  if (filtros.cuenta_id)   params.append("cuenta_id",   filtros.cuenta_id);

  const query = params.toString() ? `?${params.toString()}` : "";

  return await apiFetch(`/dashboard${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
