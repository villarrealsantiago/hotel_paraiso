import { useState } from "react"
import DataTable from "react-data-table-component"
import Swal from "sweetalert2"
import FormularioEmpleado from "./FormularioEmpleado"
import { guardarEmpleados, obtenerEmpleados } from "../utils/empleados"

function GestionEmpleados() {
  const [empleadosIniciales] = useState(() => {
    try {
      return { empleados: obtenerEmpleados(), error: "" }
    } catch {
      return {
        empleados: [],
        error: "No se pudieron leer los empleados guardados en este navegador.",
      }
    }
  })
  const [empleados, setEmpleados] = useState(empleadosIniciales.empleados)
  const [errorCarga, setErrorCarga] = useState(empleadosIniciales.error)
  const [mensajeError, setMensajeError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [empleadoEditando, setEmpleadoEditando] = useState(null)

  const iniciarRegistro = () => {
    setEmpleadoEditando(null)
    setMostrarFormulario(true)
    setMensajeError("")
  }

  const editarEmpleado = (empleado) => {
    setEmpleadoEditando(empleado)
    setMostrarFormulario(true)
    setMensajeError("")
  }

  const cancelarFormulario = () => {
    setMostrarFormulario(false)
    setEmpleadoEditando(null)
  }

  const guardarEmpleado = (datos) => {
    try {
      const empleadoActualizado = empleadoEditando
        ? { ...empleadoEditando, ...datos }
        : {
            id: crypto.randomUUID(),
            ...datos,
            estado: "Activo",
          }
      const empleadosActualizados = empleadoEditando
        ? empleados.map((empleado) =>
            empleado.id === empleadoEditando.id
              ? empleadoActualizado
              : empleado
          )
        : [...empleados, empleadoActualizado]

      guardarEmpleados(empleadosActualizados)
      setEmpleados(empleadosActualizados)
      setErrorCarga("")
      cancelarFormulario()
      return true
    } catch {
      setMensajeError("No fue posible guardar los cambios en este navegador.")
      return false
    }
  }

  const cambiarEstado = async (empleado) => {
    const nuevoEstado = empleado.estado === "Inactivo" ? "Activo" : "Inactivo"
    const resultado = await Swal.fire({
      title: `${nuevoEstado === "Activo" ? "Activar" : "Inhabilitar"} empleado`,
      text: `${empleado.nombre} quedará ${nuevoEstado.toLowerCase()}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#344c5c",
    })

    if (!resultado.isConfirmed) {
      return
    }

    const empleadosActualizados = empleados.map((registro) =>
      registro.id === empleado.id
        ? { ...registro, estado: nuevoEstado }
        : registro
    )

    try {
      guardarEmpleados(empleadosActualizados)
      setEmpleados(empleadosActualizados)
      setMensajeError("")
    } catch {
      setMensajeError("No se pudo actualizar el estado del empleado.")
    }
  }

  const termino = busqueda.trim().toLowerCase()
  const empleadosFiltrados = empleados.filter((empleado) =>
    [empleado.nombre, empleado.documento, empleado.cargo].some((valor) =>
      valor.toLowerCase().includes(termino)
    )
  )

  const columnas = [
    {
      name: "Documento",
      selector: (fila) => fila.documento,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (fila) => fila.nombre,
      sortable: true,
      grow: 1.3,
    },
    {
      name: "Correo",
      selector: (fila) => fila.correo,
      sortable: true,
      grow: 1.4,
    },
    {
      name: "Teléfono",
      selector: (fila) => fila.telefono,
      sortable: true,
    },
    {
      name: "Cargo",
      selector: (fila) => fila.cargo,
      sortable: true,
    },
    {
      name: "Estado",
      cell: (fila) => (
        <span
          className={`badge ${fila.estado === "Activo" ? "text-bg-success" : "text-bg-secondary"}`}
        >
          {fila.estado}
        </span>
      ),
      sortable: true,
      selector: (fila) => fila.estado,
    },
    {
      name: "Acciones",
      cell: (fila) => (
        <div className="hp-employee-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary hp-employee-action"
            title="Editar empleado"
            aria-label={`Editar a ${fila.nombre}`}
            onClick={() => editarEmpleado(fila)}
          >
            <i className="bi bi-pencil-square" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className={`btn btn-sm hp-employee-action ${fila.estado === "Activo" ? "btn-outline-danger" : "btn-outline-success"}`}
            title={fila.estado === "Activo" ? "Inhabilitar empleado" : "Activar empleado"}
            aria-label={`${fila.estado === "Activo" ? "Inhabilitar" : "Activar"} a ${fila.nombre}`}
            onClick={() => cambiarEstado(fila)}
          >
            <i
              className={`bi ${fila.estado === "Activo" ? "bi-person-x" : "bi-person-check"}`}
              aria-hidden="true"
            ></i>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ]

  return (
    <section className="hp-panel">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <h2 className="mb-0">Gestión de empleados</h2>
        <button
          type="button"
          className="btn hp-employee-primary"
          onClick={iniciarRegistro}
          disabled={Boolean(errorCarga)}
        >
          <i className="bi bi-person-plus me-2" aria-hidden="true"></i>
          Nuevo empleado
        </button>
      </div>

      {errorCarga && (
        <p className="alert alert-danger" role="alert">
          {errorCarga}
        </p>
      )}
      {mensajeError && (
        <p className="alert alert-danger" role="alert">
          {mensajeError}
        </p>
      )}

      {mostrarFormulario && !errorCarga && (
        <div className="card p-4 mb-4">
          <h3 className="h5 mb-3">
            {empleadoEditando ? "Editar empleado" : "Registrar empleado"}
          </h3>
          <FormularioEmpleado
            key={empleadoEditando?.id ?? "nuevo"}
            empleado={empleadoEditando}
            empleados={empleados}
            guardar={guardarEmpleado}
            cancelar={cancelarFormulario}
          />
        </div>
      )}

      <label className="form-label" htmlFor="buscar-empleado">
        Buscar empleado
      </label>
      <input
        id="buscar-empleado"
        type="search"
        className="form-control mb-3"
        placeholder="Nombre, documento o cargo"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />

      <DataTable
        columns={columnas}
        data={empleadosFiltrados}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="No hay empleados que coincidan con la búsqueda"
      />
    </section>
  )
}

export default GestionEmpleados