/**
 * moneyFormatter.js
 * Formateo de montos monetarios según la moneda del usuario.
 *
 * Convenciones de separadores por moneda:
 *   Comma-thousands / period-decimal  (estilo US)  → USD, GBP, MXN, PEN, JPY
 *   Period-thousands / comma-decimal  (estilo EU)  → EUR, COP, ARS, CLP, BRL
 */

// Monedas que usan formato europeo: punto = miles, coma = decimal
const EU_FORMAT = new Set(["EUR", "COP", "ARS", "CLP", "BRL"]);

/**
 * Devuelve los separadores para una moneda dada.
 * @param {string} currency  Código ISO, ej. "USD", "COP"
 */
export function getCurrencyFormat(currency = "USD") {
  const isEU = EU_FORMAT.has((currency || "USD").toUpperCase());
  return {
    thousandsSep: isEU ? "." : ",",
    decimalSep:   isEU ? "," : ".",
    isEU,
  };
}

/**
 * Convierte un número ya conocido a su representación de pantalla.
 *   formatMoneyNumber(1234567.89, "USD") → "1,234,567.89"
 *   formatMoneyNumber(1234567.89, "COP") → "1.234.567,89"
 *
 * @param {number|string} num
 * @param {string}        currency
 */
export function formatMoneyNumber(num, currency = "USD") {
  if (num === null || num === undefined || num === "") return "";
  const { thousandsSep, decimalSep } = getCurrencyFormat(currency);
  const parts = String(Number(num)).split(".");
  const intFormatted = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return parts.length > 1
    ? intFormatted + decimalSep + parts[1]
    : intFormatted;
}

/**
 * Procesa el texto que el usuario escribe en tiempo real y devuelve la
 * cadena formateada para mostrar + el valor numérico para enviar a la API.
 *
 * Acepta tanto "." como "," como separador decimal en el input,
 * independientemente de la moneda (el teclado decimal-pad solo muestra ".").
 *
 *   formatMoneyInput("1234.5",  "USD") → { display: "1,234.5",  value: 1234.5  }
 *   formatMoneyInput("1234,5",  "COP") → { display: "1.234,5",  value: 1234.5  }
 *   formatMoneyInput("1234567", "EUR") → { display: "1.234.567", value: 1234567 }
 *
 * @param {string} text      Texto crudo del input
 * @param {string} currency  Código ISO de la moneda
 * @returns {{ display: string, value: number }}
 */
export function formatMoneyInput(text, currency = "USD") {
  const { thousandsSep, decimalSep, isEU } = getCurrencyFormat(currency);

  // 1. Normalizar: quitar separadores de miles ya aplicados,
  //    convertir separador decimal al punto interno "."
  let raw = String(text);
  if (isEU) {
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else {
    raw = raw.replace(/,/g, "");
  }

  // 2. Dejar solo dígitos y un punto
  raw = raw.replace(/[^0-9.]/g, "");

  // 3. Evitar más de un separador decimal
  const firstDot = raw.indexOf(".");
  if (firstDot !== -1) {
    raw =
      raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
  }

  // 4. Separar parte entera y decimal
  const hasDecimal = raw.includes(".");
  const intPart    = hasDecimal ? raw.split(".")[0] : raw;
  const decPart    = hasDecimal ? raw.split(".")[1] : null;

  // 5. Aplicar separador de miles a la parte entera
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);

  // 6. Detectar si el usuario acaba de escribir el separador decimal
  //    (texto termina con "." o ",") para no perder el cursor
  const trailingDecimalChar =
    text.endsWith(".") || text.endsWith(",") || text.endsWith(decimalSep);

  // 7. Construir cadena final de visualización
  let display = intFormatted;
  if (decPart !== null) {
    display += decimalSep + decPart;
  } else if (trailingDecimalChar && intFormatted.length > 0) {
    display += decimalSep;
  }

  // 8. Valor numérico limpio para la API
  const numericStr = intPart + (decPart !== null ? "." + decPart : "");
  const value = parseFloat(numericStr) || 0;

  return { display, value };
}

/**
 * Convierte una cadena ya formateada (con separadores) de vuelta a número.
 *   parseMoneyDisplay("1,234.56", "USD") → 1234.56
 *   parseMoneyDisplay("1.234,56", "COP") → 1234.56
 *
 * @param {string} display   Cadena formateada
 * @param {string} currency  Código ISO de la moneda
 */
export function parseMoneyDisplay(display, currency = "USD") {
  if (!display && display !== 0) return 0;
  const { isEU } = getCurrencyFormat(currency);
  let clean = String(display);
  if (isEU) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else {
    clean = clean.replace(/,/g, "");
  }
  return parseFloat(clean) || 0;
}
