import { apiFetch } from "../config/api";

export async function loadAdminUsuarios(token) {
  return await apiFetch("/admin/usuarios", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function toggleUsuarioActivo(token, id) {
  return await apiFetch(`/admin/usuarios/${id}/toggle`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}
