/**
 * MoneyInput.js
 * TextInput que formatea montos monetarios en tiempo real según la moneda del usuario.
 *
 * Uso básico (la moneda se toma automáticamente de AuthContext → user.moneda):
 *   <MoneyInput
 *     value={monto}
 *     onChangeText={setMonto}          // recibe el string formateado
 *     onChangeValue={(n) => setNum(n)} // recibe el número limpio (opcional)
 *     style={styles.input}
 *   />
 *
 * Para forzar una moneda concreta:
 *   <MoneyInput currency="EUR" ... />
 */

import React from "react";
import { TextInput } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { formatMoneyInput } from "../../utils/moneyFormatter";

export default function MoneyInput({
  value,
  onChangeText,
  onChangeValue,
  currency,
  ...rest
}) {
  const { user } = useAuth();
  // Prioridad: prop currency → moneda del usuario → fallback USD
  const activeCurrency = currency || user?.moneda || "USD";

  const handleChange = (text) => {
    const { display, value: numericValue } = formatMoneyInput(text, activeCurrency);
    onChangeText?.(display);
    onChangeValue?.(numericValue);
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChange}
      keyboardType="decimal-pad"
      {...rest}
    />
  );
}
