import { useState } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Home from "./pages/Home"
import Dashboard from "./pages/admin/Dashboard"
import ClienteDashboard from "./pages/cliente/ClienteDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { CLIENTE_DEMO } from "./utils/clientes"

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
    navigate(rol === "admin" ? "/admin" : "/cliente")
  }
  const cerrarSesion = () => {
    setUsuario(null)
    setClienteActivo(null)
    localStorage.removeItem("usuarioHotel")
    localStorage.removeItem("clienteActivoHotel")
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
         
    
    </Routes>
  )
}

export default App