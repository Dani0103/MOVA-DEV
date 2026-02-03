export async function loginFake(email, password) {
  // simulamos delay de red
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!email || !password) {
    throw new Error("Email y contraseña requeridos");
  }

  // simulación backend
  return {
    token: "fake-jwt-token-123456",
    user: {
      id: 1,
      name: "Usuario Demo",
      email,
    },
  };
}
