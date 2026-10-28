import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Home from "./pages/Home"
import Dashboard from "./pages/admin/Dashboard"
import ClienteDashboard from "./pages/cliente/ClienteDashboard"
import EmpleadoDashboard from "./pages/empleado/EmpleadoDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { CLIENTE_DEMO } from "./utils/clientes"
import { obtenerEmpleados } from "./utils/empleados"

function cargarEmpleadoActivo() {
  const sesion = localStorage.getItem("empleadoActivoHotel")
  if (!sesion) {
    return null
  }

  try {
    const empleado = JSON.parse(sesion)
    if (
      empleado &&
      typeof empleado.id === "string" &&
      typeof empleado.correo === "string"
    ) {
      const registroActivo = obtenerEmpleados().find(
        (registro) =>
          registro.id === empleado.id && registro.estado === "Activo"
      )
      if (registroActivo) {
        return {
          id: registroActivo.id,
          nombre: registroActivo.nombre,
          correo: registroActivo.correo,
          cargo: registroActivo.cargo,
        }
      }
    }
  } catch {
    return null
  }

  return null
}

function cargarClienteActivo() {
  const sesion = localStorage.getItem("clienteActivoHotel")

  if (sesion) {
    try {
      const cliente = JSON.parse(sesion)
      if (cliente && typeof cliente.id === "string" && typeof cliente.correo === "string") {
        return cliente
      }
    } catch {
      return CLIENTE_DEMO
    }
  }

  return localStorage.getItem("usuarioHotel") === "cliente"
    ? CLIENTE_DEMO
    : null
}

function App() {
  const [usuario, setUsuario] = useState(() => {
    return localStorage.getItem("usuarioHotel")
  })
  const [clienteActivo, setClienteActivo] = useState(cargarClienteActivo)
  const [empleadoActivo, setEmpleadoActivo] = useState(cargarEmpleadoActivo)

  const navigate = useNavigate()
  
  const iniciarSesion = (rol, cliente = null) => {
    setUsuario(rol)
    localStorage.setItem("usuarioHotel", rol)
    if (rol === "cliente" && cliente) {
      const sesionCliente = {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
      }
      setClienteActivo(sesionCliente)
      localStorage.setItem("clienteActivoHotel", JSON.stringify(sesionCliente))
    } else {
      setClienteActivo(null)
      localStorage.removeItem("clienteActivoHotel")
    }
    if (rol === "empleado" && cliente) {
      const sesionEmpleado = {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo,
        cargo: cliente.cargo,
      }
      setEmpleadoActivo(sesionEmpleado)
      localStorage.setItem("empleadoActivoHotel", JSON.stringify(sesionEmpleado))
    } else {
      setEmpleadoActivo(null)
      localStorage.removeItem("empleadoActivoHotel")
    }
    navigate(
      rol === "admin" ? "/admin" : rol === "empleado" ? "/empleado" : "/cliente"
    )
  }
  const cerrarSesion = () => {
    setUsuario(null)
    setClienteActivo(null)
    setEmpleadoActivo(null)
    localStorage.removeItem("usuarioHotel")
    localStorage.removeItem("clienteActivoHotel")
    localStorage.removeItem("empleadoActivoHotel")
    navigate("/")
  }
  const actualizarPerfilCliente = (perfil) => {
    const clienteActualizado = { ...clienteActivo, ...perfil }
    setClienteActivo(clienteActualizado)
    localStorage.setItem(
      "clienteActivoHotel",
      JSON.stringify(clienteActualizado)
    )
  }
  return (
    <Routes>
      <Route
        path="/"
        element={<Home onLogin={iniciarSesion} />}
       
      />
      <Route
        path="/admin"
        element={
            <ProtectedRoute usuario={usuario} rolPermitido="admin"> 
            <Dashboard onLogout={cerrarSesion} />
            </ProtectedRoute>
        }
        />

        <Route
        path="/cliente"
        element={
          <ProtectedRoute usuario={usuario} rolPermitido="cliente">
            <ClienteDashboard
              onLogout={cerrarSesion}
              cliente={clienteActivo || CLIENTE_DEMO}
              onProfileUpdate={actualizarPerfilCliente}
            />

          </ProtectedRoute>
        }
        />
      <Route
        path="/empleado"
        element={
          <ProtectedRoute
            usuario={usuario}
            rolPermitido="empleado"
            sesionValida={Boolean(empleadoActivo)}
          >
            <EmpleadoDashboard
              empleado={empleadoActivo}
              onLogout={cerrarSesion}
            />
          </ProtectedRoute>
        }
      />
         
    
    </Routes>
  )
}

export default App