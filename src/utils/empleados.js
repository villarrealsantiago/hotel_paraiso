export const CLAVE_EMPLEADOS = "empleadosHotel"

export const CARGOS_EMPLEADOS = [
  "Recepción",
  "Limpieza",
  "Mantenimiento",
  "Cocina",
  "Administración",
]

export function normalizarDocumento(documento) {
  return documento.trim().toUpperCase()
}

export function normalizarCorreoEmpleado(correo) {
  return correo.trim().toLowerCase()
}

export function obtenerEmpleados() {
  const guardados = localStorage.getItem(CLAVE_EMPLEADOS)

  if (!guardados) {
    return []
  }

  const empleados = JSON.parse(guardados)

  if (
    !Array.isArray(empleados) ||
    empleados.some(
      (empleado) =>
        !empleado ||
        typeof empleado.id !== "string" ||
        typeof empleado.documento !== "string" ||
        typeof empleado.nombre !== "string" ||
        typeof empleado.correo !== "string" ||
        typeof empleado.telefono !== "string" ||
        typeof empleado.cargo !== "string" ||
        (empleado.estado != null &&
          !["activo", "inactivo"].includes(empleado.estado.toLowerCase()))
    )
  ) {
    throw new Error("Los datos guardados de los empleados no son válidos.")
  }

  return empleados.map((empleado) => ({
    ...empleado,
    estado:
      empleado.estado?.toLowerCase() === "inactivo" ? "Inactivo" : "Activo",
  }))
}

export function guardarEmpleados(empleados) {
  localStorage.setItem(CLAVE_EMPLEADOS, JSON.stringify(empleados))
}