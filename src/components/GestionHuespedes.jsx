import { useState } from "react"
import {
  guardarClientes,
  normalizarCorreo,
  obtenerClientes,
} from "../utils/clientes"

function cargarDatosHuespedes() {
  try {
    const clientes = obtenerClientes()
    const reservasGuardadas = localStorage.getItem("reservasHotel")
    const reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : []

    if (!Array.isArray(reservas)) {
      throw new Error("Los datos de reservas no son válidos.")
    }

    return { clientes, reservas, error: "" }
  } catch {
    return {
      clientes: [],
      reservas: [],
      error: "No se pudieron cargar los huéspedes o sus reservas guardadas.",
    }
  }
}

function GestionHuespedes() {
  const [datos, setDatos] = useState(cargarDatosHuespedes)
  const [busqueda, setBusqueda] = useState("")
  const [huespedSeleccionadoId, setHuespedSeleccionadoId] = useState(null)
  const [mensajeError, setMensajeError] = useState("")
  const termino = normalizarCorreo(busqueda)
  const huespedesFiltrados = datos.clientes.filter((huesped) =>
    `${huesped.nombre} ${huesped.correo}`.toLowerCase().includes(termino)
  )
  const huespedSeleccionado = huespedesFiltrados.find(
    (huesped) => huesped.id === huespedSeleccionadoId
  )
  const reservasHuesped = huespedSeleccionado
    ? datos.reservas.filter(
        (reserva) => reserva.clienteId === huespedSeleccionado.id
      )
    : []

  const cambiarEstado = (huesped) => {
    const nuevoEstado = huesped.estado === "inactivo" ? "activo" : "inactivo"

    try {
      const clientesActualizados = obtenerClientes().map((cliente) =>
        cliente.id === huesped.id
          ? { ...cliente, estado: nuevoEstado }
          : cliente
      )
      guardarClientes(clientesActualizados)
      setDatos((actuales) => ({
        ...actuales,
        clientes: clientesActualizados,
      }))
      setMensajeError("")
    } catch {
      setMensajeError("No se pudo guardar el estado del huésped. Inténtalo nuevamente.")
    }
  }

  return (
    <div className="hp-huespedes">
      <section className="hp-panel">
        <div className="hp-panel-header">
          <div>
            <h2>Huéspedes registrados</h2>
            <p>{datos.clientes.length} cuentas registradas</p>
          </div>
        </div>

        {datos.error ? (
          <p className="alert alert-danger mb-0" role="alert">
            {datos.error}
          </p>
        ) : (
          <>
            {mensajeError && (
              <p className="alert alert-danger" role="alert">
                {mensajeError}
              </p>
            )}
            <div className="mb-3">
              <label className="form-label" htmlFor="buscar-huesped">
                Buscar huésped
              </label>
              <input
                id="buscar-huesped"
                type="search"
                className="form-control"
                placeholder="Nombre o correo electrónico"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </div>

            {huespedesFiltrados.length ? (
              <div className="hp-table-wrap">
                <table className="hp-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo electrónico</th>
                      <th>Teléfono</th>
                      <th>Reservas</th>
                      <th>Estado</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {huespedesFiltrados.map((huesped) => {
                      const cantidadReservas = datos.reservas.filter(
                        (reserva) => reserva.clienteId === huesped.id
                      ).length

                      return (
                        <tr key={huesped.id}>
                          <td>{huesped.nombre}</td>
                          <td>{huesped.correo}</td>
                          <td>{huesped.telefono || "—"}</td>
                          <td>{cantidadReservas}</td>
                          <td>
                            <span
                              className={`badge ${huesped.estado === "inactivo" ? "text-bg-secondary" : "text-bg-success"}`}
                            >
                              {huesped.estado === "inactivo" ? "Inactivo" : "Activo"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                aria-pressed={huespedSeleccionadoId === huesped.id}
                                onClick={() =>
                                  setHuespedSeleccionadoId(huesped.id)
                                }
                              >
                                Ver reservas
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${huesped.estado === "inactivo" ? "btn-outline-success" : "btn-outline-danger"}`}
                                onClick={() => cambiarEstado(huesped)}
                              >
                                {huesped.estado === "inactivo" ? "Activar" : "Inactivar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">
                {datos.clientes.length
                  ? "No se encontraron huéspedes con esa búsqueda."
                  : "Aún no hay huéspedes registrados."}
              </p>
            )}
          </>
        )}
      </section>

      {huespedSeleccionado && !datos.error && (
        <section className="hp-panel mt-4">
          <div className="hp-panel-header">
            <div>
              <h2>Reservas de {huespedSeleccionado.nombre}</h2>
              <p>{huespedSeleccionado.correo}</p>
            </div>
          </div>

          {reservasHuesped.length ? (
            <div className="hp-table-wrap">
              <table className="hp-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Habitación</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasHuesped.map((reserva, indice) => {
                    const estado = reserva.estado || "Sin estado"
                    const claseEstado = estado.toLowerCase()

                    return (
                      <tr key={reserva.id ?? `${huespedSeleccionado.id}-${indice}`}>
                        <td>{reserva.id || "—"}</td>
                        <td>{reserva.habitacion || "—"}</td>
                        <td>{reserva.entrada || "—"}</td>
                        <td>{reserva.salida || "—"}</td>
                        <td>
                          <span className={`hp-status ${claseEstado}`}>
                            {estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted mb-0">
              Este huésped todavía no tiene reservas asociadas.
            </p>
          )}
        </section>
      )}
    </div>
  )
}

export default GestionHuespedes