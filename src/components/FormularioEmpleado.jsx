import { useState } from "react"
import {
  CARGOS_EMPLEADOS,
  normalizarCorreoEmpleado,
  normalizarDocumento,
} from "../utils/empleados"

function FormularioEmpleado({ empleado, empleados, guardar, cancelar }) {
  const [formulario, setFormulario] = useState({
    documento: empleado?.documento ?? "",
    nombre: empleado?.nombre ?? "",
    correo: empleado?.correo ?? "",
    telefono: empleado?.telefono ?? "",
    cargo: empleado?.cargo ?? "",
    password: "",
  })
  const [error, setError] = useState("")

  const manejarCambio = (evento) => {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    })
  }

  const manejarEnvio = (evento) => {
    evento.preventDefault()
    const datos = {
      documento: normalizarDocumento(formulario.documento),
      nombre: formulario.nombre.trim(),
      correo: normalizarCorreoEmpleado(formulario.correo),
      telefono: formulario.telefono.trim(),
      cargo: formulario.cargo.trim(),
    }
    const password = formulario.password.trim()

    if (!/^[A-Z0-9.-]{5,20}$/.test(datos.documento)) {
      setError("El documento debe tener entre 5 y 20 caracteres válidos.")
      return
    }

    if (datos.nombre.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.")
      return
    }

    const digitosTelefono = datos.telefono.replace(/\D/g, "")
    if (
      !/^\+?[0-9\s()-]{7,20}$/.test(datos.telefono) ||
      digitosTelefono.length < 7 ||
      digitosTelefono.length > 15
    ) {
      setError("Ingresa un teléfono válido de entre 7 y 20 caracteres.")
      return
    }

    if (!CARGOS_EMPLEADOS.includes(datos.cargo)) {
      setError("Selecciona un cargo válido.")
      return
    }

    if ((!empleado || password) && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    const duplicado = empleados.some(
      (registro) =>
        registro.id !== empleado?.id &&
        (normalizarDocumento(registro.documento) === datos.documento ||
          normalizarCorreoEmpleado(registro.correo) === datos.correo)
    )

    if (duplicado) {
      setError("Ya existe un empleado con ese documento o correo.")
      return
    }

    setError("")
    if (password) {
      datos.password = password
    }
    if (!guardar(datos)) {
      setError("No se pudo guardar el empleado. Inténtalo nuevamente.")
    }
  }

  return (
    <form onSubmit={manejarEnvio}>
      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-documento">
            Documento
          </label>
          <input
            id="empleado-documento"
            className="form-control"
            name="documento"
            value={formulario.documento}
            onChange={manejarCambio}
            minLength={5}
            maxLength={20}
            pattern="[A-Za-z0-9.-]{5,20}"
            autoComplete="off"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-nombre">
            Nombre completo
          </label>
          <input
            id="empleado-nombre"
            className="form-control"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            minLength={3}
            maxLength={80}
            autoComplete="name"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-correo">
            Correo electrónico
          </label>
          <input
            id="empleado-correo"
            type="email"
            className="form-control"
            name="correo"
            value={formulario.correo}
            onChange={manejarCambio}
            maxLength={120}
            autoComplete="email"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-telefono">
            Teléfono
          </label>
          <input
            id="empleado-telefono"
            type="tel"
            className="form-control"
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
            maxLength={20}
            autoComplete="tel"
            required
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label" htmlFor="empleado-cargo">
            Cargo
          </label>
          <select
            id="empleado-cargo"
            className="form-select"
            name="cargo"
            value={formulario.cargo}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un cargo</option>
            {CARGOS_EMPLEADOS.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 mb-3">
          <label className="form-label" htmlFor="empleado-password">
            {empleado ? "Nueva contraseña (opcional)" : "Contraseña inicial"}
          </label>
          <input
            id="empleado-password"
            type="password"
            className="form-control"
            name="password"
            value={formulario.password}
            onChange={manejarCambio}
            minLength={formulario.password ? 6 : undefined}
            autoComplete="new-password"
            required={!empleado}
          />
          <small className="text-muted">
            {empleado
              ? "Déjala vacía para conservar la contraseña actual."
              : "Utiliza al menos 6 caracteres."}
          </small>
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={cancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn hp-employee-primary">
          <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
          {empleado ? "Actualizar empleado" : "Registrar empleado"}
        </button>
      </div>
    </form>
  )
}

export default FormularioEmpleado