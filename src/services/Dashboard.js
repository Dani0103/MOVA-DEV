import { apiFetch } from "../config/api";

export async function GetDashboard(token) {
  return await apiFetch("/dashboard", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
