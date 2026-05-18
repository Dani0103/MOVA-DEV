import * as Linking from "expo-linking";

const prefix = Linking.createURL("/");

/**
 * Mapea rutas URL ↔ pantallas de React Navigation.
 * Usado en NavigationContainer para que web persista la ruta al recargar.
 *
 * Jerarquía:
 *   Stack raíz → MainApp (Drawer) → Stacks individuales
 */
const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      // ── Auth ──────────────────────────────────────────────
      Login:      "login",
      Register:   "register",
      Onboarding: "onboarding",
      Planes:     "planes",

      // ── App principal (Drawer) ────────────────────────────
      MainApp: {
        screens: {
          Home: "",

          Cuentas: {
            screens: {
              CuentasHome:   "cuentas",
              CrearCuenta:   "cuentas/nueva",
              DetalleCuenta: "cuentas/:id",
            },
          },

          Categorias: {
            screens: {
              Categorias:       "categorias",
              CrearCategoria:   "categorias/nueva",
              DetalleCategoria: "categorias/:id",
            },
          },

          Movimientos: {
            screens: {
              Movimientos:        "movimientos",
              CrearMovimiento:    "movimientos/nuevo",
              DetalleMovimiento:  "movimientos/:id",
            },
          },

          Presupuestos: {
            screens: {
              Presupuestos:       "presupuestos",
              CrearPresupuesto:   "presupuestos/nuevo",
            },
          },

          Recurrentes: {
            screens: {
              Recurrentes:        "recurrentes",
              CrearRecurrente:    "recurrentes/nuevo",
            },
          },

          Metas: {
            screens: {
              Metas:           "metas",
              CrearMeta:       "metas/nueva",
              DetalleMeta:     "metas/:id",
              AñadirAhorro:    "metas/:id/ahorro",
              HistorialAportes:"metas/:id/historial",
            },
          },

          Deudas: {
            screens: {
              DeudasHome:          "deudas",
              CrearDeuda:          "deudas/nueva",
              DetalleDeuda:        "deudas/:id",
              AñadirPagoDeuda:     "deudas/:id/pago",
              HistorialPagosDeuda: "deudas/:id/historial",
            },
          },

          "Estadísticas": "estadisticas",
          Perfil:         "perfil",
        },
      },
    },
  },
};

export default linking;
