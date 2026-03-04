import { apiFetch } from "../config/api";

export async function GetCategories(token) {
  return await apiFetch("/categorias", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}

export async function createCategory(formDataCategorias, token) {
  // 1. Preparamos el cuerpo exactamente como lo espera el Controller de Laravel
  const body = {
    nombre: formDataCategorias.nombre,
    tipo: formDataCategorias.tipo,
    padre_id: formDataCategorias.padre,
    icono: formDataCategorias.icono,
    color_hex: formDataCategorias.color_hex,
  };

  return await apiFetch("/categorias", {
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
