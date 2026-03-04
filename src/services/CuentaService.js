import { apiFetch } from "../config/api";

export async function GetAccount(token) {
  return await apiFetch("/cuentas", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

//Tipo de Moneda
export async function createAccount(formData, token) {
  // 1. Preparamos el cuerpo exactamente como lo espera el Controller de Laravel
  const body = {
    tipo_cuenta_id: formData.tipo_cuenta_id,
    moneda_id: formData.moneda_id,
    nombre: formData.nombre,
    saldo_inicial: formData.saldo_actual, // Tu backend usa 'saldo_inicial'
    detalles: formData.detalles || {},
    color_hex: formData.color_hex || "#38BDF8", // Valor por defecto si no viene uno
  };

  return await apiFetch("/cuentas", {
    // Quitamos /api si ya está en la base config
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function updateAccount(cuenta, formData, token) {
  // 1. Preparamos el cuerpo exactamente como lo espera el Controller de Laravel
  const body = {
    nombre: formData.nombre,
    tipo_cuenta_id: formData.tipo_cuenta_id,
    moneda_id: formData.moneda_id,
    saldo_inicial: formData.saldo, // Tu backend usa 'saldo_inicial'
    color_hex: formData.color_hex || "#38BDF8", // Valor por defecto si no viene uno
    activa: true,
  };

  return await apiFetch(`/cuentas`, {
    // Quitamos /api si ya está en la base config
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function ArchiveAccount(cuenta, token) {
  return await apiFetch(`/cuentas/${cuenta}/archivar`, {
    // Quitamos /api si ya está en la base config
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
