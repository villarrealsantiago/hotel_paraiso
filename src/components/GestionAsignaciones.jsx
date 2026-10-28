import { useState } from "react"
import {
  existeConflictoHorario,
  guardarAsignaciones,
  obtenerAsignaciones,
} from "../utils/asignaciones"
import { obtenerEmpleados } from "../utils/empleados"

const TIPOS_TAREA = [
  "Limpieza",
  "Mantenimiento",
  "Recepción",
  "Cocina",
  "Administración",
  "Otra",
]

const ESTADOS_TAREA = ["Pendiente", "En curso", "Completada"]

const FORMULARIO_VACIO = {
  empleadoId: "",
  tipo: "",
  ubicacion: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  estado: "Pendiente",
}

function cargarDatos() {
  try {
    return {
      asignaciones: obtenerAsignaciones(),
      empleados: obtenerEmpleados(),
      error: "",
    }
  } catch {
    return {
      asignaciones: [],
      empleados: [],
      error: "No se pudieron leer los empleados o las asignaciones guardadas.",
    }
  }
}

function GestionAsignaciones() {
  const [datos, setDatos] = useState(cargarDatos)
  const [formulario, setFormulario] = useState(null)
  const [asignacionEditando, setAsignacionEditando] = useState(null)
  const [mensajeError, setMensajeError] = useState("")

  const empleadosActivos = datos.empleados.filter(
    (empleado) => empleado.estado === "Activo"
  )

  const actualizarCampo = (evento) => {
    setFormulario((actual) => ({
      ...actual,
      [evento.target.name]: evento.target.value,
    }))
  }

  const iniciarCreacion = () => {
    setAsignacionEditando(null)
    setFormulario({ ...FORMULARIO_VACIO })
    setMensajeError("")
  }

  const iniciarEdicion = (asignacion) => {
    setAsignacionEditando(asignacion)
    setFormulario({
      empleadoId: asignacion.empleadoId,
      tipo: asignacion.tipo,
      ubicacion: asignacion.ubicacion,
      fecha: asignacion.fecha,
      horaInicio: asignacion.horaInicio,
      horaFin: asignacion.horaFin,
      estado: asignacion.estado,
    })
    setMensajeError("")
  }

  const cancelarFormulario = () => {
    setFormulario(null)
    setAsignacionEditando(null)
    setMensajeError("")
  }

  const guardar = (evento) => {
    evento.preventDefault()
    if (!formulario.tipo || !formulario.fecha || !formulario.horaInicio || !formulario.horaFin) {
      setMensajeError("Completa el empleado, tipo, fecha y horario de la tarea.")
      return
    }

    if (formulario.horaFin <= formulario.horaInicio) {
      setMensajeError("La hora de finalización debe ser posterior a la hora de inicio.")
      return
    }

    try {
      const empleadosActuales = obtenerEmpleados()
      const empleado = empleadosActuales.find(
        (registro) =>
          registro.id === formulario.empleadoId && registro.estado === "Activo"
      )
      if (!empleado) {
        setDatos((actual) => ({ ...actual, empleados: empleadosActuales }))
        setMensajeError("Selecciona un empleado activo para la asignación.")
        return
      }

      const asignacion = {
        id: asignacionEditando?.id ?? crypto.randomUUID(),
        empleadoId: empleado.id,
        empleadoNombre: empleado.nombre,
        tipo: formulario.tipo,
        ubicacion: formulario.ubicacion.trim(),
        fecha: formulario.fecha,
        horaInicio: formulario.horaInicio,
        horaFin: formulario.horaFin,
        estado: formulario.estado,
      }
      const asignacionesActuales = obtenerAsignaciones()
      if (existeConflictoHorario(asignacionesActuales, asignacion)) {
        setMensajeError(
          "Conflicto de horario: este empleado ya tiene una tarea asignada durante ese período."
        )
        return
      }

      const asignacionesActualizadas = asignacionEditando
        ? asignacionesActuales.map((registro) =>
            registro.id === asignacion.id ? asignacion : registro
          )
        : [...asignacionesActuales, asignacion]

      guardarAsignaciones(asignacionesActualizadas)
      setDatos((actual) => ({
        ...actual,
        empleados: empleadosActuales,
        asignaciones: asignacionesActualizadas,
      }))
      cancelarFormulario()
    } catch {
      setMensajeError("No se pudo validar al empleado o guardar la asignación.")
    }
  }

  const cancelarAsignacion = (asignacion) => {
    try {
      const asignacionesActuales = obtenerAsignaciones()
      const asignacionesActualizadas = asignacionesActuales.map((registro) =>
        registro.id === asignacion.id
          ? { ...registro, estado: "Cancelada" }
          : registro
      )
      guardarAsignaciones(asignacionesActualizadas)
      setDatos((actual) => ({
        ...actual,
        asignaciones: asignacionesActualizadas,
      }))
      setMensajeError("")
    } catch {
      setMensajeError("No se pudo cancelar la asignación.")
    }
  }

  return (
    <section className="hp-panel">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h2 className="mb-1">Asignaciones de tareas</h2>
          <p className="text-muted mb-0">Organiza el trabajo de los empleados.</p>
        </div>
        <button
          type="button"
          className="btn hp-employee-primary"
          onClick={iniciarCreacion}
          disabled={Boolean(datos.error) || empleadosActivos.length === 0}
        >
          <i className="bi bi-plus-circle me-2" aria-hidden="true"></i>
          Nueva asignación
        </button>
      </div>

      {datos.error && <p className="alert alert-danger" role="alert">{datos.error}</p>}
      {mensajeError && <p className="alert alert-danger" role="alert">{mensajeError}</p>}
      {!datos.error && empleadosActivos.length === 0 && (
        <p className="alert alert-info" role="status">
          No hay empleados activos disponibles para asignar tareas.
        </p>
      )}

      {formulario && (
        <form className="card p-3 p-md-4 mb-4" onSubmit={guardar}>
          <h3 className="h5 mb-3">
            {asignacionEditando ? "Editar asignación" : "Nueva asignación"}
          </h3>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="asignacion-empleado">Empleado</label>
              <select
                id="asignacion-empleado"
                name="empleadoId"
                className="form-select"
                value={formulario.empleadoId}
                onChange={actualizarCampo}
                required
              >
                <option value="">Selecciona un empleado activo</option>
                {empleadosActivos.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="asignacion-tipo">Tipo de tarea</label>
              <select
                id="asignacion-tipo"
                name="tipo"
                className="form-select"
                value={formulario.tipo}
                onChange={actualizarCampo}
                required
              >
                <option value="">Selecciona el tipo de tarea</option>
                {TIPOS_TAREA.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="asignacion-ubicacion">
                Piso o habitación (opcional)
              </label>
              <input
                id="asignacion-ubicacion"
                name="ubicacion"
                className="form-control"
                value={formulario.ubicacion}
                onChange={actualizarCampo}
                maxLength={80}
                placeholder="Ej. Piso 2, habitación 204"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="asignacion-fecha">Fecha</label>
              <input
                id="asignacion-fecha"
                name="fecha"
                type="date"
                className="form-control"
                value={formulario.fecha}
                onChange={actualizarCampo}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="asignacion-inicio">Hora de inicio</label>
              <input
                id="asignacion-inicio"
                name="horaInicio"
                type="time"
                className="form-control"
                value={formulario.horaInicio}
                onChange={actualizarCampo}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="asignacion-fin">Hora de finalización</label>
              <input
                id="asignacion-fin"
                name="horaFin"
                type="time"
                className="form-control"
                value={formulario.horaFin}
                onChange={actualizarCampo}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="asignacion-estado">Estado</label>
              <select
                id="asignacion-estado"
                name="estado"
                className="form-select"
                value={formulario.estado}
                onChange={actualizarCampo}
              >
                {ESTADOS_TAREA.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={cancelarFormulario}>
              Cancelar
            </button>
            <button type="submit" className="btn hp-employee-primary">
              Guardar asignación
            </button>
          </div>
        </form>
      )}

      <div className="hp-table-wrap">
        <table className="hp-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Tarea</th>
              <th>Piso / habitación</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.asignaciones.map((asignacion) => (
              <tr key={asignacion.id}>
                <td>{asignacion.empleadoNombre}</td>
                <td>{asignacion.tipo}</td>
                <td>{asignacion.ubicacion || "—"}</td>
                <td>{asignacion.fecha}</td>
                <td>{asignacion.horaInicio}–{asignacion.horaFin}</td>
                <td><span className={`hp-task-status ${asignacion.estado.toLowerCase().replaceAll(" ", "-")}`}>{asignacion.estado}</span></td>
                <td>
                  {asignacion.estado === "Cancelada" ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => iniciarEdicion(asignacion)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => cancelarAsignacion(asignacion)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!datos.error && datos.asignaciones.length === 0 && (
              <tr><td colSpan="7" className="text-center text-muted">Todavía no hay asignaciones.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default GestionAsignaciones
