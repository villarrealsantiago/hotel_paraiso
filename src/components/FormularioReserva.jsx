import { useMemo, useState } from "react"
import Swal from "sweetalert2"
import { obtenerTipoHabitacion } from "../utils/habitaciones"

function FormularioReserva({
    reserva,
    guardar,
    cancelar,
    modoCliente = false,
    habitaciones = [],
    reservas = [],
}) {
    const [ datos , setDatos] = useState({
        habitacion: reserva?.habitacionId
            ? String(reserva.habitacionId)
            : modoCliente
                ? String(
                    habitaciones.find(
                        (habitacion) => habitacion.nombre === reserva?.habitacion
                    )?.id ?? ""
                )
                : reserva?.habitacion ?? "",
        entrada: reserva?.entrada ?? "",
        salida: reserva?.salida ?? "",
        estado: reserva?.estado ?? "Pendiente"
    })

    const habitacionesDisponibles = useMemo(() => {
        if (!modoCliente) {
            return []
        }

        const entrada = datos.entrada
        let salida = datos.salida
        if (entrada && !salida) {
            const diaSiguiente = new Date(`${entrada}T00:00:00Z`)
            diaSiguiente.setUTCDate(diaSiguiente.getUTCDate() + 1)
            salida = diaSiguiente.toISOString().slice(0, 10)
        }

        return habitaciones.filter((habitacion) => {
            if (habitacion.estado.trim().toLowerCase() !== "disponible") {
                return false
            }

            if (!entrada || !salida || salida <= entrada) {
                return true
            }

            return !reservas.some((reservaExistente) => {
                if (
                    reservaExistente.id === reserva?.id ||
                    reservaExistente.estado?.trim().toLowerCase() === "cancelada"
                ) {
                    return false
                }

                const mismaHabitacion = reservaExistente.habitacionId != null
                    ? String(reservaExistente.habitacionId) ===
                        String(habitacion.id)
                    : reservaExistente.habitacion?.trim().toLowerCase() ===
                        habitacion.nombre.trim().toLowerCase()

                if (!mismaHabitacion) {
                    return false
                }

                return (
                    reservaExistente.entrada < salida &&
                    reservaExistente.salida > entrada
                )
            })
        })
    }, [
        datos.entrada,
        datos.salida,
        habitaciones,
        modoCliente,
        reserva?.id,
        reservas,
    ])

    const manejarCambio = (e) => {
    setDatos({
        ...datos,
        [e.target.name]: e.target.value
    })
}

    const manejarEnvio = (e) => {
        e.preventDefault()
        if (!datos.habitacion || !datos.entrada  || !datos.salida){
            Swal.fire("Completa todos los satos")
            return
        }

        if (datos.salida <= datos.entrada){
            Swal.fire(
                "fechas incorrectas",
                "La fecha de salida debe ser posterior a la de entrada ",
                "warning"
            )
            return
        }

        if (modoCliente) {
            const habitacionElegida = habitacionesDisponibles.find(
                (habitacion) => String(habitacion.id) === datos.habitacion
            )

            if (!habitacionElegida) {
                Swal.fire(
                    "Habitación no disponible",
                    "Selecciona una habitación disponible para las fechas elegidas.",
                    "warning"
                )
                return
            }

            guardar({
                ...datos,
                habitacion: habitacionElegida.nombre,
                habitacionId: habitacionElegida.id,
                tipoHabitacion: obtenerTipoHabitacion(habitacionElegida),
                precioHabitacion: Number(habitacionElegida.precio),
            })
            return
        }

        guardar(datos)

    }

    return (
        <form onSubmit={manejarEnvio}>
            <div className="mb-3">
                <label className="form-label">Habitación</label>
                <select 
                className="form-select"
                name="habitacion"
                value={datos.habitacion}
                onChange={manejarCambio}
                required       
            >
                <option value="">Seleccione una habitación</option>
                    {modoCliente
                        ? habitacionesDisponibles.map((habitacion) => (
                            <option key={habitacion.id} value={String(habitacion.id)}>
                                {habitacion.nombre} — {obtenerTipoHabitacion(habitacion)} — $
                                {Number(habitacion.precio).toLocaleString("es-CO")}
                            </option>
                        ))
                        : (
                            <>
                                <option value="Suite201">Suite 201</option>
                                <option value="Doble 105"> Doble 105</option>
                                <option value="Sencilla 103"> Sencilla 103</option>
                            </>
                        )}
                </select>
                {modoCliente && datos.entrada && datos.salida && (
                    <small className="text-muted">
                        {habitacionesDisponibles.length
                            ? "Opciones disponibles para las fechas seleccionadas."
                            : "No hay habitaciones disponibles para estas fechas."}
                    </small>
                )}
                </div>

            <div className="mb-3">
               <label className="form-label">Fecha de entrada</label> 
                <input 
                type="date"
                className="form-control"
                name="entrada"
                value={datos.entrada}
                onChange={manejarCambio}
                required
                 />
              </div>          

              <div className="mb-3">
               <label className="form-label">Fecha de salida</label> 
                <input 
                type="date"
                className="form-control"
                name="salida"
                min={datos.entrada}
                value={datos.salida}
                onChange={manejarCambio}
                required
                 />

                <div className="mb-3">
                    <label htmlFor="" className="form-label">Estado</label>
                    <select 
                    className="form-select"
                    name="estado"
                    value={datos.estado}
                    onChange={manejarCambio}
                    required >

                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                    </select>
                    
                    </div> 
              </div>  
                <div className="d-flex justify-content-end gap-2">
                    <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelar}
                    >
                Cancelar
                </button> 

                      <button
                    type="submit"
                    className="btn btn-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Guardar Reserva

                </button> 
                </div>
              
              </form>
            
           
    )
}

export default FormularioReserva