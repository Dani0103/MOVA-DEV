import { apiFetch } from "../config/api";

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

/** Calcula el rango de fechas para cada pestaña */
export function getDateRange(periodo) {
  const now = new Date();

  if (periodo === "Semana") {
    const day = now.getDay(); // 0=Dom
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { desde: toISO(mon), hasta: toISO(sun) };
  }

  if (periodo === "Mes") {
    const desde = new Date(now.getFullYear(), now.getMonth(), 1);
    const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { desde: toISO(desde), hasta: toISO(hasta) };
  }

  // Año
  const desde = new Date(now.getFullYear(), 0, 1);
  const hasta = new Date(now.getFullYear(), 11, 31);
  return { desde: toISO(desde), hasta: toISO(hasta) };
}

function toISO(d) {
  return d.toISOString().split("T")[0];
}

/** Descripción legible del período */
export function getPeriodoLabel(periodo, { desde, hasta }) {
  if (periodo === "Mes") {
    const d = new Date(desde + "T00:00:00");
    return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  }
  if (periodo === "Año") {
    return desde.slice(0, 4);
  }
  // Semana
  const d1 = new Date(desde + "T00:00:00");
  const d2 = new Date(hasta + "T00:00:00");
  const fmt = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `${fmt(d1)} – ${fmt(d2)}`;
}

/** GET /premium/estadisticas */
export async function loadEstadisticas(token, desde, hasta) {
  const q = new URLSearchParams({ fecha_desde: desde, fecha_hasta: hasta }).toString();
  const res = await apiFetch(`/premium/estadisticas?${q}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return res?.data ?? null;
}

/** GET /transacciones (completadas, en el rango) */
export async function loadTransaccionesRango(token, desde, hasta) {
  const q = new URLSearchParams({ fecha_desde: desde, fecha_hasta: hasta, estado: "completada" }).toString();
  const res = await apiFetch(`/transacciones?${q}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return res?.data ?? [];
}

// ─── Helpers de agregación (frontend) ────────────────────────────────────────

/** Agrupa gastos/ingresos en buckets según el periodo */
export function agruparPorPeriodo(transacciones, periodo) {
  const LABELS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const LABELS_MES    = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
  const LABELS_AÑO    = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  let labels, size;
  if (periodo === "Semana") { labels = LABELS_SEMANA; size = 7; }
  else if (periodo === "Mes")   { labels = LABELS_MES;    size = 4; }
  else                          { labels = LABELS_AÑO;    size = 12; }

  const gastos   = Array(size).fill(0);
  const ingresos = Array(size).fill(0);

  transacciones.forEach((t) => {
    if (t.tipo !== "gasto" && t.tipo !== "ingreso") return;
    const fecha = new Date(t.fecha);
    let idx;

    if (periodo === "Semana") {
      const dow = fecha.getDay(); // 0=Dom
      idx = dow === 0 ? 6 : dow - 1; // 0=Lun…6=Dom
    } else if (periodo === "Mes") {
      idx = Math.min(Math.floor((fecha.getDate() - 1) / 7), 3);
    } else {
      idx = fecha.getMonth();
    }

    const monto = parseFloat(t.monto) || 0;
    if (t.tipo === "gasto")   gastos[idx]   += monto;
    else                       ingresos[idx] += monto;
  });

  return { labels, gastos, ingresos };
}

/** Top N categorías de gasto */
export function getTopCategorias(transacciones, n = 5) {
  const map = {};
  const colorMap = {};
  const CAT_COLORS = ["#F87171", "#38BDF8", "#FACC15", "#A78BFA", "#4ADE80", "#FB923C", "#F472B6"];

  transacciones
    .filter((t) => t.tipo === "gasto")
    .forEach((t) => {
      const name = t.categoria?.nombre || "Otros";
      map[name] = (map[name] || 0) + parseFloat(t.monto || 0);
      if (!colorMap[name] && t.categoria?.color) colorMap[name] = t.categoria.color;
    });

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const totalGastos = sorted.reduce((s, [, v]) => s + v, 0);

  return {
    totalGastos,
    categorias: sorted.slice(0, n).map(([nombre, monto], i) => ({
      nombre,
      monto,
      pct: totalGastos > 0 ? (monto / totalGastos) * 100 : 0,
      color: colorMap[nombre] || CAT_COLORS[i % CAT_COLORS.length],
    })),
  };
}

/** Insights automáticos */
export function calcularInsights(transacciones, periodo) {
  const gastos = transacciones.filter((t) => t.tipo === "gasto");
  const ingresos = transacciones.filter((t) => t.tipo === "ingreso");

  const totalGastos   = gastos.reduce((s, t) => s + parseFloat(t.monto), 0);
  const totalIngresos = ingresos.reduce((s, t) => s + parseFloat(t.monto), 0);

  // Tasa de ahorro
  const tasaAhorro = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;

  // Promedio diario de gastos
  const dayMap = {};
  gastos.forEach((t) => {
    const d = t.fecha?.slice(0, 10) ?? "";
    dayMap[d] = (dayMap[d] || 0) + parseFloat(t.monto);
  });
  const days = Object.values(dayMap);
  const promedioGastoDiario = days.length > 0 ? days.reduce((s, v) => s + v, 0) / days.length : 0;

  // Día de la semana con más gasto
  const dowMap = Array(7).fill(0);
  gastos.forEach((t) => {
    const dow = new Date(t.fecha).getDay();
    dowMap[dow] += parseFloat(t.monto);
  });
  const DOW_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const maxDow = dowMap.indexOf(Math.max(...dowMap));
  const diaMasGasto = dowMap[maxDow] > 0 ? DOW_NAMES[maxDow] : null;

  return { tasaAhorro, promedioGastoDiario, diaMasGasto, totalGastos, totalIngresos };
}

/** Formatea números grandes → "1.2M", "350K", "4.500" */
export function fmtMoney(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("es-CO", { minimumFractionDigits: 0 });
}
