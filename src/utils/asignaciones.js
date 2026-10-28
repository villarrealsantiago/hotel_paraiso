export const CLAVE_ASIGNACIONES = "asignacionesHotel"

export function obtenerAsignaciones() {
  const guardadas = localStorage.getItem(CLAVE_ASIGNACIONES)

  if (!guardadas) {
    return []
  }

  const asignaciones = JSON.parse(guardadas)

  if (
    !Array.isArray(asignaciones) ||
    asignaciones.some(
      (asignacion) =>
        !asignacion ||
        typeof asignacion.id !== "string" ||
        typeof asignacion.empleadoId !== "string" ||
        typeof asignacion.empleadoNombre !== "string" ||
        typeof asignacion.tipo !== "string" ||
        typeof asignacion.ubicacion !== "string" ||
        typeof asignacion.fecha !== "string" ||
        typeof asignacion.horaInicio !== "string" ||
        typeof asignacion.horaFin !== "string" ||
        typeof asignacion.estado !== "string"
    )
  ) {
    throw new Error("Los datos guardados de las asignaciones no son válidos.")
  }

  return asignaciones
}

export function guardarAsignaciones(asignaciones) {
  localStorage.setItem(CLAVE_ASIGNACIONES, JSON.stringify(asignaciones))
}

export function existeConflictoHorario(asignaciones, nuevaAsignacion) {
  const inicioNuevo = `${nuevaAsignacion.fecha}T${nuevaAsignacion.horaInicio}`
  const finNuevo = `${nuevaAsignacion.fecha}T${nuevaAsignacion.horaFin}`

  return asignaciones.some((asignacion) => {
    if (
      asignacion.id === nuevaAsignacion.id ||
      asignacion.empleadoId !== nuevaAsignacion.empleadoId ||
      asignacion.estado === "Cancelada"
    ) {
      return false
    }

    const inicioExistente = `${asignacion.fecha}T${asignacion.horaInicio}`
    const finExistente = `${asignacion.fecha}T${asignacion.horaFin}`

    return inicioNuevo < finExistente && finNuevo > inicioExistente
  })
}
