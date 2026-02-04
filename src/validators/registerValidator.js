export function validateRegister({ name, email, password }) {
  if (!name?.trim()) {
    return "El nombre es obligatorio";
  }

  if (!email?.trim()) {
    return "El correo es obligatorio";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Correo electrónico inválido";
  }

  if (!password) {
    return "La contraseña es obligatoria";
  }

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }

  return null; // ✔️ válido
}
