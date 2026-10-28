import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import Sidebar from '../../components/Sidebar'
import './Dashboard.css'
import TablaReservas from '../../components/TablaReservas'
import TablaHabitaciones from '../../components/TablaHabitaciones'
import GestionHuespedes from '../../components/GestionHuespedes'
import GestionEmpleados from '../../components/GestionEmpleados'
import GestionAsignaciones from '../../components/GestionAsignaciones'
import { obtenerClientes } from '../../utils/clientes'

const reservas = [
  { id: 'R-001', huesped: 'Laura Gómez', habitacion: 'Suite 201', fecha: '18/10/2026', estado: 'Confirmada' },
  { id: 'R-002', huesped: 'Carlos Ruiz', habitacion: 'Doble 105', fecha: '19/10/2026', estado: 'Pendiente' },
  { id: 'R-003', huesped: 'Ana Torres', habitacion: 'Suite 203', fecha: '20/10/2026', estado: 'Confirmada' },
]

const secciones = ['Resumen', 'Habitaciones', 'Reservas', 'Huéspedes', 'Empleados', 'Asignaciones']

const columnasReservasRecientes = [
  {
    name: 'Código',
    selector: (reserva) => reserva.id,
    sortable: true,
    minWidth: '110px',
  },
  {
    name: 'Huésped',
    selector: (reserva) => reserva.huesped,
    sortable: true,
    grow: 1.4,
    minWidth: '160px',
  },
  {
    name: 'Habitación',
    selector: (reserva) => reserva.habitacion,
    sortable: true,
    minWidth: '130px',
  },
  {
    name: 'Ingreso',
    selector: (reserva) => reserva.fecha,
    sortable: true,
    minWidth: '120px',
  },
  {
    name: 'Estado',
    selector: (reserva) => reserva.estado,
    sortable: true,
    minWidth: '130px',
    cell: (reserva) => {
      const estado = reserva.estado
      const claseEstado = estado.toLowerCase() === 'confirmada'
        ? 'confirmed'
        : estado.toLowerCase() === 'cancelada'
          ? 'cancelada'
          : 'pending'

      return <span className={`hp-status ${claseEstado}`}>{estado}</span>
    },
  },
]

function Dashboard({ onLogout }) {
  const [seccion, setSeccion] = useState('Resumen')
  const [busquedaReservas, setBusquedaReservas] = useState('')
  const [estadoReserva, setEstadoReserva] = useState('')
  const [cantidadHuespedes] = useState(() => {
    try {
      return obtenerClientes().length
    } catch {
      return 0
    }
  })

  const [reservasClientes] = useState(() => {
    const guardadas = localStorage.getItem("reservasHotel")
    return guardadas ? JSON.parse(guardadas) : []
  })

  const reservasRecientes = useMemo(() => [
    ...reservas.map((reserva) => ({
      ...reserva,
      huesped: reserva.huesped || 'Sin asignar',
      habitacion: reserva.habitacion || '—',
      fecha: reserva.fecha || '—',
      estado: reserva.estado || 'Sin estado',
    })),
    ...reservasClientes.map((reserva, indice) => ({
      ...reserva,
      id: reserva.id ?? `reserva-cliente-${indice}`,
      huesped: reserva.clienteNombre ||
        (reserva.clienteId ? 'Cliente registrado' : 'Sin asignar'),
      habitacion: reserva.habitacion || '—',
      fecha: reserva.entrada || '—',
      estado: reserva.estado || 'Sin estado',
    })),
  ], [reservasClientes])

  const estadosDisponibles = useMemo(
    () => [...new Set(reservasRecientes.map((reserva) => reserva.estado))]
      .sort((primero, segundo) => primero.localeCompare(segundo, 'es')),
    [reservasRecientes]
  )

  const reservasFiltradas = useMemo(() => {
    const termino = busquedaReservas.trim().toLocaleLowerCase('es')

    return reservasRecientes.filter((reserva) => {
      const coincideEstado =
        !estadoReserva ||
        reserva.estado.toLocaleLowerCase('es') === estadoReserva.toLocaleLowerCase('es')
      const coincideBusqueda =
        !termino ||
        [reserva.id, reserva.huesped, reserva.habitacion, reserva.fecha, reserva.estado]
          .some((valor) => String(valor).toLocaleLowerCase('es').includes(termino))

      return coincideEstado && coincideBusqueda
    })
  }, [busquedaReservas, estadoReserva, reservasRecientes])

    const confirmadas = reservasClientes.filter(
    reserva => reserva.estado === "Confirmada"
  ).length

  const pendientes = reservasClientes.filter(
    reserva => reserva.estado === "Pendiente"
  ).length

  const confirmarSalida =() =>{
   
    Swal.fire({
      title:"¿Deseas cerrar Sesión?",
      text: "Regresaras a la pagina principal",
      icon: "question", 
      showCancelButton:true, 
      confirmButtonText:"Si, salir",
      cancelButtonText:"Cancelar", 
      confirmButtonColor:"#344c5c"
    }).then((resultado) => {
      if (resultado.isConfirmed) {
      onLogout()
    }
  })
}
  return (
    <div className="hp-dashboard">
      
      <Sidebar
        titulo='Administración'
        opciones={secciones}
        seccion={seccion}
        cambiarSeccion={setSeccion}
        cerrarSesion={confirmarSalida}
      />

      <main className="hp-main">
        <header className="hp-header">
          <div>
            <p className="hp-eyebrow">PANEL ADMINISTRATIVO</p>
            <h1>{seccion === 'Resumen' ? 'Bienvenido al Hotel Paraíso' : seccion}</h1>
            <p className="hp-subtitle">{seccion === 'Resumen' ? 'Resumen general de la operación del hotel' : 'Consulta y Gestión de Reservas del Hotel '}</p>
          </div>
          <div className="hp-user"><span className="hp-avatar">A</span><span>Administrador</span></div>
        </header>

        {seccion === 'Resumen' ? (
          <>
            <section className="hp-stats" aria-label="Indicadores del hotel">
              {[
                { titulo: 'Habitaciones', valor: '24', detalle: 'Total registradas', icono: '▤' },
                { titulo: 'Reservas', valor: reservasClientes.length, detalle: 'Reservas activas', icono: '▣' },
                { titulo: 'Confirmadas', valor: confirmadas, detalle :'Reservas confirmadas', icono: '☑️' },
                { titulo: 'Pendientes', valor: pendientes, detalle :'Reservas pendientes', icono: '⏳' },
                { titulo: 'Huéspedes', valor: cantidadHuespedes, detalle: 'Huéspedes registrados', icono: '♙' },
                { titulo: 'Ocupación', valor: '75%', detalle: 'Ocupación estimada', icono: '◕' },
              ].map((dato) => (
                <article className="hp-stat" key={dato.titulo}>
                  <div className="hp-stat-top"><span>{dato.titulo}</span><span className="hp-stat-icon">{dato.icono}</span></div>
                  <strong>{dato.valor}</strong>
                  <small>{dato.detalle}</small>
                </article>
              ))}
            </section>

            <section className="hp-panel">
              <div className="hp-panel-header"><div><h2>Reservas recientes</h2><p>Últimos registros del hotel</p></div><span className="hp-demo-tag">Datos de ejemplo</span></div>
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <label className="form-label" htmlFor="buscar-reserva-reciente">
                    Buscar reserva
                  </label>
                  <input
                    id="buscar-reserva-reciente"
                    type="search"
                    className="form-control"
                    placeholder="Código, huésped o habitación"
                    value={busquedaReservas}
                    onChange={(evento) => setBusquedaReservas(evento.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="filtrar-estado-reserva">
                    Filtrar por estado
                  </label>
                  <select
                    id="filtrar-estado-reserva"
                    className="form-select"
                    value={estadoReserva}
                    onChange={(evento) => setEstadoReserva(evento.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    {estadosDisponibles.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="hp-table-wrap">
                <DataTable
                  columns={columnasReservasRecientes}
                  data={reservasFiltradas}
                  keyField="id"
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 25, 50, 100]}
                  paginationComponentOptions={{
                    rowsPerPageText: 'Filas por página:',
                    rangeSeparatorText: 'de',
                    noRowsPerPage: false,
                    selectAllRowsItem: false,
                  }}
                  responsive
                  striped
                  highlightOnHover
                  persistTableHead
                  noDataComponent="No hay reservas que coincidan con la búsqueda"
                  customStyles={{
                    table: { style: { backgroundColor: 'transparent' } },
                    headRow: {
                      style: {
                        backgroundColor: '#faf8f5',
                        borderBottomColor: '#ebe6df',
                      },
                    },
                    headCells: {
                      style: {
                        color: '#777',
                        fontSize: '13px',
                        fontWeight: 600,
                        paddingLeft: '12px',
                        paddingRight: '12px',
                      },
                    },
                    rows: {
                      style: {
                        minHeight: '54px',
                        fontSize: '14px',
                        color: '#292d31',
                      },
                    },
                    cells: {
                      style: {
                        paddingLeft: '12px',
                        paddingRight: '12px',
                      },
                    },
                    pagination: {
                      style: {
                        borderTopColor: '#f0ece6',
                        color: '#777',
                        fontSize: '13px',
                      },
                    },
                  }}
                />
              </div>
            </section>
          </>
        ): seccion === "Habitaciones" ? (
          <TablaHabitaciones />

        ) : seccion === "Reservas" ? (
          <TablaReservas />

        ) : seccion === "Huéspedes" ? (
          <GestionHuespedes />

        ) : seccion === "Empleados" ? (
          <GestionEmpleados />

        ) : seccion === "Asignaciones" ? (
          <GestionAsignaciones />

        ): (
          <section className="hp-panel hp-placeholder">
            <span className="hp-placeholder-icon">✦</span>
            <h2>Gestión de {seccion.toLowerCase()}</h2>
            <p>En las próximas clases construiremos las funcionalidades de este módulo.</p>
            <button type="button" onClick={() => setSeccion('Resumen')}>Volver al resumen</button>
          </section>
        )}
        <footer className="hp-footer">Hotel Paraíso · Proyecto académico React</footer>
      </main>
    </div>
  )
}

export default Dashboard