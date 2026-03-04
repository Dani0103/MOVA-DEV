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

export async function editMovimiento(formData, token) {
  // 1. Preparamos el cuerpo exactamente como lo espera el Controller de Laravel
  const body = {
    cuenta_origen_id: formData.cuenta_origen_id,
    cuenta_destino_id: formData.cuenta_destino_id,
    categoria_id: formData.categoria_id,
    monto: formData.monto,
    tipo: formData.tipo,
    estado: formData.estado || "completada",
    tasa_cambio: formData.tasa_cambio || 1,
    monto_convertido: formData.monto_convertido || formData.monto,
    fecha: formData.fecha,
    descripcion: formData.descripcion,
    notas_internas: formData.notas_internas || "",
  };

  return await apiFetch("/transacciones", {
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

// export async function archivatMovimiento(formData, token) {
//   const body = {
//     cuenta_origen_id: formData.cuenta_origen_id,
//   };

//   return await apiFetch("/transacciones", {
//     // Quitamos /api si ya está en la base config
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: JSON.stringify(body),
//   });
// }
