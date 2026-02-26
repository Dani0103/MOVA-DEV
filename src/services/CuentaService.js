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
    nombre: formData.nombre,
    tipo_cuenta_id: formData.tipo_cuenta_id,
    moneda_id: formData.moneda_id,
    saldo_inicial: formData.saldo, // Tu backend usa 'saldo_inicial'
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
