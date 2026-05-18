import { apiFetch } from "../config/api";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// Normaliza campos API → pantallas
const normalizeDeuda = (d) => ({
  ...d,
  monto_total: parseFloat(d.monto_total) || 0,
  abonado: parseFloat(d.monto_pagado) || 0,
  saldo_pendiente: parseFloat(d.saldo_pendiente) || 0,
  tasa_interes: d.tasa_interes_anual ? parseFloat(d.tasa_interes_anual) : null,
  numero_cuotas: d.numero_cuotas ? parseInt(d.numero_cuotas) : null,
  cuotas_pagadas: parseInt(d.cuotas_pagadas) || 0,
  cuotas_restantes: d.cuotas_restantes != null ? parseInt(d.cuotas_restantes) : null,
  cuota_mensual: d.cuota_mensual ? parseFloat(d.cuota_mensual) : null,
  total_a_pagar: d.total_a_pagar ? parseFloat(d.total_a_pagar) : null,
  total_intereses: d.total_intereses ? parseFloat(d.total_intereses) : null,
  meses_transcurridos: d.meses_transcurridos ?? null,
  cuota_actual: d.cuota_actual ?? null,
  cuotas_esperadas: d.cuotas_esperadas ?? null,
  al_dia: d.al_dia ?? null,
  cuotas_atrasadas: d.cuotas_atrasadas ?? 0,
  color: d.color || "#F87171",
  icono: d.icono || "card",
  estado: d.estado || "activa",
});

export async function loadDeudas(token) {
  const res = await apiFetch("/premium/deudas", {
    method: "GET",
    headers: authHeaders(token),
  });
  return (res?.data ?? []).map(normalizeDeuda);
}

export async function createDeuda(token, data) {
  const res = await apiFetch("/premium/deudas", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      acreedor: data.acreedor,
      descripcion: data.descripcion || null,
      monto_total: parseFloat(data.monto_total),
      monto_pagado: parseFloat(data.monto_pagado || 0),
      tasa_interes_anual: data.tasa_interes_anual ? parseFloat(data.tasa_interes_anual) : null,
      numero_cuotas: data.numero_cuotas ? parseInt(data.numero_cuotas) : null,
      fecha_inicio: data.fecha_inicio || null,
      fecha_vencimiento: data.fecha_vencimiento || null,
      color: data.color,
      icono: data.icono,
    }),
  });
  const deuda = res?.data ?? res;
  return deuda ? normalizeDeuda(deuda) : null;
}

export async function updateDeuda(token, deudaId, data) {
  const res = await apiFetch(`/premium/deudas/${deudaId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const deuda = res?.data ?? res;
  return deuda ? normalizeDeuda(deuda) : null;
}

export async function deleteDeuda(token, deudaId) {
  return await apiFetch(`/premium/deudas/${deudaId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export async function loadPagosDeuda(token, deudaId) {
  const res = await apiFetch(`/premium/deudas/${deudaId}/pagos`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return res?.data ?? [];
}

export async function registrarPago(token, deudaId, { monto, nota }) {
  const res = await apiFetch(`/premium/deudas/${deudaId}/pagos`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ monto: parseFloat(monto), nota: nota || null }),
  });
  return res?.data ?? res;
}
