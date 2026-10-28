import FormularioReserva from "./FormularioReserva"
import Swal from "sweetalert2"
import { useState , useEffect } from "react"
import DataTable from "react-data-table-component"
import { createRoot } from "react-dom/client"
import { cargarHabitaciones } from "../utils/habitaciones"
import { clientePuedeReservar } from "../utils/clientes"
const reservasIniciales = [
    {
        id: 1,
        habitacion: "Suite 201",
        entrada: "2026-10-19",
        salida: "2016-10-28",
        estado: "Confirmada"
    },
    {
        id: 2,
        habitacion: "Doble 106",
        entrada: "2026-11-10",
        salida: "2016-11-15",
        estado: "Pendiente"
    }
]

function obtenerSiguienteCodigoReserva(reservasActuales) {
    const claveConsecutivo = "consecutivoReservasHotel"
    const reservasGuardadas = localStorage.getItem("reservasHotel")
    const todasLasReservas = reservasGuardadas
        ? [...reservasActuales, ...JSON.parse(reservasGuardadas)]
        : reservasActuales
    const mayorCodigoExistente = todasLasReservas.reduce((mayor, reserva) => {
        const coincidencia =
            typeof reserva.id === "string" && reserva.id.match(/^RES-(\d+)$/)
        return coincidencia
            ? Math.max(mayor, Number(coincidencia[1]))
            : mayor
    }, 0)
    const consecutivoGuardado = Number(
        localStorage.getItem(claveConsecutivo)
    )
    const siguiente = Math.max(
        Number.isSafeInteger(consecutivoGuardado) ? consecutivoGuardado : 0,
        mayorCodigoExistente
    ) + 1

    if (!Number.isSafeInteger(siguiente)) {
        throw new Error("Se agotó el consecutivo de códigos de reserva.")
    }

    localStorage.setItem(claveConsecutivo, String(siguiente))
    return `RES-${String(siguiente).padStart(3, "0")}`
}

function TablaReservas({ modoCliente = false, clienteId = null, clienteNombre = "" }) {
    const [reservas, setReservas] = useState(() =>{
        const guardadas = localStorage.getItem("reservasHotel")
        return guardadas ? JSON.parse(guardadas) : reservasIniciales
    })
    
    const [busqueda, setBusqueda] = useState("")
    const validarClienteActivo = async () => {
        if (!modoCliente) {
            return true
        }

        try {
            if (clientePuedeReservar(clienteId)) {
                return true
            }
            await Swal.fire({
                icon: "warning",
                title: "Cuenta inactiva",
                text: "No puedes gestionar reservas mientras tu cuenta esté inactiva.",
                confirmButtonColor: "#344c5c",
            })
        } catch {
            await Swal.fire({
                icon: "error",
                title: "No se pudo validar tu cuenta",
                text: "Revisa los datos guardados e inténtalo nuevamente.",
                confirmButtonColor: "#344c5c",
            })
        }

        return false
    }

    const abrirFormulario = async (reserva = null) => {
        if (!(await validarClienteActivo())) {
            return
        }

        const contenedor = document.createElement("div")
        let habitaciones = []

        if (modoCliente) {
            try {
                habitaciones = cargarHabitaciones()
            } catch {
                await Swal.fire({
                    icon: "error",
                    title: "No se pudieron cargar las habitaciones",
                    text: "Revisa los datos guardados de habitaciones e inténtalo nuevamente.",
                    confirmButtonColor: "#344c5c",
                })
                return
            }
        }

        const raiz = createRoot(contenedor)
        raiz.render(
            <FormularioReserva
            reserva={reserva}
            modoCliente={modoCliente}
            habitaciones={habitaciones}
            reservas={reservas}
            guardar={async (datos) => {
                if (!(await validarClienteActivo())) {
                    return
                }

                if (reserva) {
                    setReservas((actuales) =>
                        actuales.map((registro) =>
                            registro.id === reserva.id
                                ? { ...registro, ...datos }
                                : registro
                        )
                    )
                } else {
                    let codigoReserva
                    try {
                        codigoReserva = obtenerSiguienteCodigoReserva(reservas)
                    } catch {
                        Swal.fire({
                            icon: "error",
                            title: "No se pudo generar el código",
                            text: "No fue posible guardar el consecutivo de reservas en este navegador.",
                            confirmButtonColor: "#344c5c",
                        })
                        return
                    }

                    setReservas((actuales) => {
                        const nuevaReserva = {
                            id: codigoReserva,
                            ...datos,
                            ...(modoCliente
                                ? { clienteId, clienteNombre }
                                : {}),
                        }
                        return [...actuales, nuevaReserva]
                    })
                }
                Swal.close()
            }}
            cancelar={() => Swal.close()}
            />
        )
        await Swal.fire({
            title: reserva ? "Editar Reserva" : "Nueva Reserva",
            html:contenedor,
            showConfirmButton: false,
            didClose: () => raiz.unmount()
        })
    }
useEffect(() => {
    localStorage.setItem("reservasHotel" , JSON.stringify(reservas))
}, [reservas]) 

    const eliminarReserva = async (id) => {
        const resultado = await Swal.fire({
            title:" Eliminar reserva ?",
            text:"Esta accion eliminara la reserva", 
            icon:"warning",
            showCancelButton: true, 
            confirmButtonText: "Si, eliminar", 
            confirmButtonColor: "#dc3545"
        })

        if (resultado.isConfirmed){
            setReservas(actuales => 
                actuales.filter(reserva => reserva.id !== id )

            )
            Swal.fire("Reserva eliminada", )
        }
    }    

    const columnas = [
        {
            name: "Codigo",
            selector: fila => fila.id,
            sortable: true
        },
        ...(!modoCliente
            ? [
                {
                    name: "Cliente",
                    selector: (fila) =>
                        fila.clienteNombre ||
                        (fila.clienteId ? "Cliente registrado" : "Sin asignar"),
                    sortable: true,
                },
            ]
            : []),
        {
            name: "Habitación",
            selector: fila => fila.habitacion,
            sortable: true
        },
        {
            name: "Tipo",
            selector: fila => fila.tipoHabitacion || "—",
            sortable: true
        },
        {
            name: "Precio",
            selector: fila => fila.precioHabitacion
                ? `$${Number(fila.precioHabitacion).toLocaleString("es-CO")}`
                : "—",
            sortable: true
        },
        {
            name: "Entrada",
            selector: fila => fila.entrada,
            sortable: true
        },
        {
            name: "Salida",
            selector: fila => fila.salida,
            sortable: true
        },
        {
            name: "Estado",
            selector: fila => fila.estado,
            sortable: true
        },
        {
            name: "Acciones",
            cell: fila => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        title="Editar"
                        onClick={() => abrirFormulario(fila)}
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                        onClick={() => eliminarReserva(fila.id)}
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            )
        }

    ]



    const reservasFiltradas = reservas.filter((reserva) => {
        const perteneceAlCliente =
            !modoCliente || reserva.clienteId === clienteId
        const coincideBusqueda =
            reserva.habitacion.toLowerCase().includes(busqueda.toLowerCase()) ||
            reserva.estado.toLowerCase().includes(busqueda.toLowerCase())
        return perteneceAlCliente && coincideBusqueda
    })

    return(
        <div>
            <div className="d-flex justify-content-between mb-3 gap-2 ">
                <input
                type="text"
                className="form-control"
                style={{ maxWidth:"280px" }}
                placeholder="Buscar reserva..."
                value={busqueda}
                onChange={e =>setBusqueda(e.target.value)}
                />
             <button
             className="btn text-white"
             style={{ backgroundColor:"#344c5c" }}
             onClick={() => abrirFormulario()}
             
             >
             <i className="bi bi-plus-circle me-2"></i>
             {modoCliente ? "Nueva reserva" : "Nueva Reserva"}
            </button>
              </div>
            <DataTable 
            columns={columnas}
            data={reservasFiltradas}
            pagination
            highlightOnHover
            responsive
            noDataComponent="No se encontraro reservas"
            />
          </div> 
    )
}

export default TablaReservas