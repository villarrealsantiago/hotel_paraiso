import { Navigate } from "react-router-dom";

function ProtectedRoute({ usuario, rolPermitido, sesionValida = true, children }){
    if (!usuario) {
        return <Navigate to="/" replace/>
    }

    if (usuario !== rolPermitido){
        const rutaPorRol = {
            admin: "/admin",
            cliente: "/cliente",
            empleado: "/empleado",
        }
        return <Navigate to={rutaPorRol[usuario] || "/"} replace />
    }

    if (!sesionValida) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute