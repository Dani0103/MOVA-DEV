export function validateLogin({ email, password }) {
  if (!email?.trim()) {
    return "El correo es obligatorio";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Correo electrónico inválido";
  }

  if (!password) {
    return "La contraseña es obligatoria";
  }

  return null;
}
