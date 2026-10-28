export const HABITACIONES_INICIALES = [
  {
    id: 1,
    nombre: "Habitación Estandar",
    precio: 150000,
    estado: "Disponible",
  },
  {
    id: 2,
    nombre: "Habitación Premiun",
    precio: 250000,
    estado: "Disponible",
  },
  {
    id: 3,
    nombre: "Habitación Suite",
    precio: 500000,
    estado: "Mantenimiento",
  },
];

export function obtenerTipoHabitacion(habitacion) {
  if (habitacion.tipo?.trim()) {
    return habitacion.tipo.trim();
  }

  return habitacion.nombre.replace(/^habitaci[oó]n\s*/i, "").trim() || "Estándar";
}

export function cargarHabitaciones() {
  const guardadas = localStorage.getItem("habitacionesHotel");

  if (!guardadas) {
    return HABITACIONES_INICIALES;
  }

  const habitaciones = JSON.parse(guardadas);
  if (
    !Array.isArray(habitaciones) ||
    habitaciones.some(
      (habitacion) =>
        !habitacion ||
        (typeof habitacion.id !== "string" &&
          typeof habitacion.id !== "number") ||
        typeof habitacion.nombre !== "string" ||
        !Number.isFinite(Number(habitacion.precio)) ||
        typeof habitacion.estado !== "string"
    )
  ) {
    throw new Error("Los datos guardados de las habitaciones no son válidos.");
  }

  return habitaciones;
}
