import { useState } from "react";
import Swal from "sweetalert2";
import {
  CLIENTE_DEMO,
  guardarClientes,
  normalizarCorreo,
  obtenerClientes,
} from "../utils/clientes";

function LoginModal({ mostrar, cerrar, onLogin }) {
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  if (!mostrar) return null;

  const iniciarSesion = (e) => {
    e.preventDefault();

    const correoNormalizado = normalizarCorreo(correo);
    let cliente = null;
    let rol = null;

    if (correoNormalizado === "admin@hotel.com" && password === "123") {
      rol = "admin";
    } else if (
      correoNormalizado === normalizarCorreo(CLIENTE_DEMO.correo) &&
      password === "123"
    ) {
      rol = "cliente";
      cliente = CLIENTE_DEMO;
    } else {
      try {
        const cuenta = obtenerClientes().find(
          (cuenta) =>
            normalizarCorreo(cuenta.correo) === correoNormalizado &&
            cuenta.password === password
        );
        if (cuenta?.estado === "inactivo") {
          Swal.fire({
            icon: "warning",
            title: "Cuenta inactiva",
            text: "Contacta con la administración del hotel para recuperar el acceso.",
            confirmButtonColor: "#344c5c",
          });
          return;
        }
        cliente = cuenta;
        if (cuenta) {
          rol = "cliente";
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "No se pudieron leer las cuentas",
          text: "Revisa los datos guardados en este navegador e inténtalo nuevamente.",
          confirmButtonColor: "#344c5c",
        });
        return;
      }
    }

    if (!rol) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "El correo o la contraseña son incorrectos",
        confirmButtonText: "Intentar nuevamente",
        confirmButtonColor: "#344c5c",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Bienvenido",
      text: "Sesión iniciada correctamente",
      confirmButtonText: "Continuar",
      confirmButtonColor: "#344c5c",
    }).then(() => {
      cerrarModal();
      onLogin(rol, cliente);
    });
  };

  const registrarCliente = (e) => {
    e.preventDefault();
    const correoNormalizado = normalizarCorreo(correo);
    const nombreLimpio = nombre.trim();

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña demasiado corta",
        text: "Utiliza al menos 6 caracteres.",
        confirmButtonColor: "#344c5c",
      });
      return;
    }

    try {
      const clientes = obtenerClientes();
      const correoEnUso =
        correoNormalizado === "admin@hotel.com" ||
        correoNormalizado === normalizarCorreo(CLIENTE_DEMO.correo) ||
        clientes.some(
          (cuenta) => normalizarCorreo(cuenta.correo) === correoNormalizado
        );

      if (correoEnUso) {
        Swal.fire({
          icon: "warning",
          title: "Correo ya registrado",
          text: "Inicia sesión con ese correo o utiliza otro para crear la cuenta.",
          confirmButtonColor: "#344c5c",
        });
        return;
      }

      const cliente = {
        id: crypto.randomUUID(),
        nombre: nombreLimpio,
        correo: correoNormalizado,
        password,
        telefono: "",
        direccion: "",
        estado: "activo",
      };
      guardarClientes([...clientes, cliente]);

      Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Tu cuenta está lista. Iniciarás sesión automáticamente.",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#344c5c",
      }).then(() => {
        cerrarModal();
        onLogin("cliente", cliente);
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear la cuenta",
        text: "No fue posible guardar los datos en este navegador. Inténtalo nuevamente.",
        confirmButtonColor: "#344c5c",
      });
    }
  };

  const cambiarModo = () => {
    setModo((actual) => (actual === "login" ? "registro" : "login"));
    setNombre("");
    setCorreo("");
    setPassword("");
  };

  const cerrarModal = () => {
    setModo("login");
    setNombre("");
    setCorreo("");
    setPassword("");
    cerrar();
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header border-0">
            <h4 className="modal-title fw-bold">
              {modo === "login" ? "Bienvenido" : "Crear cuenta"}
            </h4>
            <button
              type="button"
              className="btn-close"
              onClick={cerrarModal}
            />
          </div>

          <div className="modal-body px-4 pb-4">
            <p className="text-muted">
              {modo === "login"
                ? "Ingresa a tu cuenta del hotel"
                : "Regístrate para reservar y consultar tus estancias"}
            </p>

            <form onSubmit={modo === "login" ? iniciarSesion : registrarCliente}>
              {modo === "registro" && (
                <div className="mb-3">
                  <label className="form-label" htmlFor="registro-nombre">
                    Nombre completo
                  </label>
                  <input
                    id="registro-nombre"
                    type="text"
                    className="form-control"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    autoComplete="name"
                    maxLength="80"
                    required
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label" htmlFor="acceso-correo">
                  Correo electrónico
                </label>
                <input
                  id="acceso-correo"
                  type="email"
                  className="form-control"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="acceso-password">
                  Contraseña
                </label>
                <input
                  id="acceso-password"
                  type="password"
                  className="form-control"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    modo === "login" ? "current-password" : "new-password"
                  }
                  minLength={modo === "registro" ? 6 : undefined}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 text-white py-2"
                style={{ backgroundColor: "#6b7017" }}
              >
                {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              {modo === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <button
                type="button"
                className="btn btn-link p-0 align-baseline"
                onClick={cambiarModo}
              >
                {modo === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;