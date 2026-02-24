export function validateRegister({
  nombre,
  apellido,
  email,
  nacionalidad,
  moneda,
  password,
  confirmedPassword,
}) {
  debugger;
  if (!nombre?.trim()) {
    return "El nombre es obligatorio";
  }

  if (!apellido?.trim()) {
    return "El apellido es obligatorio";
  }

  if (!email?.trim()) {
    return "El correo es obligatorio";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Correo electrónico inválido";
  }

  if (!nacionalidad) {
    return "Debe seleccionar una nacionalidad";
  }

  if (!moneda) {
    return "Debe seleccionar una moneda";
  }

  if (!password) {
    return "La contraseña es obligatoria";
  }

  if (password !== confirmedPassword) {
    return "La contraseña debe ser igual en ambos campos";
  }

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  if (!/[A-Z]/.test(password)) {
    return "La contraseña debe contener al menos una mayúscula";
  }

  if (!/[0-9]/.test(password)) {
    return "La contraseña debe contener al menos un número";
  }

  return null; // ✔ válido
}
