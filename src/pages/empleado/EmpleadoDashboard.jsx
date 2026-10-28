import { useState } from "react"
import Sidebar from "../../components/Sidebar"
import { obtenerAsignaciones } from "../../utils/asignaciones"

function cargarAsignacionesEmpleado(empleadoId) {
  try {
    return { asignaciones: obtenerAsignaciones().filter((asignacion) => asignacion.empleadoId === empleadoId), error: "" }
  } catch {
    return {
      asignaciones: [],
      error: "No se pudieron leer tus asignaciones guardadas en este navegador.",
    }
  }
}

function EmpleadoDashboard({ empleado, onLogout }) {
  const [datos] = useState(() => cargarAsignacionesEmpleado(empleado.id))
  const opciones = ["Mis tareas"]

  return (
    <div className="hp-dashboard">
      <Sidebar
        titulo="Espacio del empleado"
        opciones={opciones}
        seccion="Mis tareas"
        cambiarSeccion={() => {}}
        cerrarSesion={onLogout}
      />
      <main className="hp-main">
        <header className="hp-header">
          <div>
            <p className="hp-eyebrow">PANEL DEL EMPLEADO</p>
            <h1>Mis tareas</h1>
            <p className="hp-subtitle">Consulta tus asignaciones y su estado.</p>
          </div>
          <div className="hp-user">
            <span className="hp-avatar">{empleado.nombre.charAt(0).toUpperCase()}</span>
            <span>{empleado.nombre} · {empleado.cargo}</span>
          </div>
        </header>

        <section className="hp-panel">
          <div className="hp-panel-header">
            <div>
              <h2>Asignaciones</h2>
              <p>{datos.asignaciones.length} tareas asignadas</p>
            </div>
          </div>
          {datos.error ? (
            <p className="alert alert-danger" role="alert">{datos.error}</p>
          ) : datos.asignaciones.length ? (
            <div className="hp-table-wrap">
              <table className="hp-table">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Piso / habitación</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.asignaciones.map((asignacion) => (
                    <tr key={asignacion.id}>
                      <td>{asignacion.tipo}</td>
                      <td>{asignacion.ubicacion || "—"}</td>
                      <td>{asignacion.fecha}</td>
                      <td>{asignacion.horaInicio}–{asignacion.horaFin}</td>
                      <td>
                        <span className={`hp-task-status ${asignacion.estado.toLowerCase().replaceAll(" ", "-")}`}>
                          {asignacion.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">Aún no tienes tareas asignadas.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default EmpleadoDashboard
