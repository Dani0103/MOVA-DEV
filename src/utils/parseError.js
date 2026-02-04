export const parseError = (error) => {
  if (!error) return "Error desconocido";

  if (typeof error === "string") return error;

  if (error.message) return error.message;

  if (error.response?.data?.message) return error.response.data.message;

  return "Ocurrió un error inesperado";
};
