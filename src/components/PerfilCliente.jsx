import { useState } from "react";
import "./PerfilCliente.css";
import {
  guardarClientes,
  obtenerClientes,
} from "../utils/clientes";

function cargarPerfil(cliente) {
  const clavePerfil = `perfilClienteHotel:${cliente.id}`;

  try {
    const guardado = cliente.id === "cliente-demo"
      ? localStorage.getItem(clavePerfil) ||
        localStorage.getItem("perfilClienteHotel")
      : null;

    if (!guardado) {
      return {
        perfil: {
          nombre: cliente.nombre || "",
          telefono: cliente.telefono || "",
          direccion: cliente.direccion || "",
        },
        error: "",
      };
    }

    const datos = JSON.parse(guardado);

    if (
      !datos ||
      typeof datos !== "object" ||
      typeof datos.nombre !== "string" ||
      typeof datos.telefono !== "string" ||
      typeof datos.direccion !== "string"
    ) {
      throw new Error("El formato del perfil guardado no es válido.");
    }

    return { perfil: datos, error: "" };
  } catch {
    return {
      perfil: {
        nombre: cliente.nombre || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
      },
      error: "No fue posible acceder al perfil guardado. Puedes completar y guardar tus datos nuevamente.",
    };
  }
}

function obtenerIniciales(nombre) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);

  if (palabras.length === 0) {
    return "CP";
  }

  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join("");
}

function PerfilCliente({ cliente, onProfileUpdate }) {
  const [estadoInicial] = useState(() => cargarPerfil(cliente));
  const [perfil, setPerfil] = useState(estadoInicial.perfil);
  const [formulario, setFormulario] = useState(estadoInicial.perfil);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState(estadoInicial.error);
  const [tipoMensaje, setTipoMensaje] = useState(
    estadoInicial.error ? "error" : ""
  );

  const iniciarEdicion = () => {
    setFormulario(perfil);
    setMensaje("");
    setTipoMensaje("");
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setFormulario(perfil);
    setMensaje("");
    setTipoMensaje("");
    setEditando(false);
  };

  const manejarCambio = (evento) => {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
  };

  const guardarPerfil = (evento) => {
    evento.preventDefault();

    const perfilActualizado = {
      nombre: formulario.nombre.trim(),
      telefono: formulario.telefono.trim(),
      direccion: formulario.direccion.trim(),
    };

    try {
      if (cliente.id === "cliente-demo") {
        localStorage.setItem(
          `perfilClienteHotel:${cliente.id}`,
          JSON.stringify(perfilActualizado)
        );
      } else {
        const clientes = obtenerClientes();
        let cuentaActualizada = false;
        const clientesActualizados = clientes.map((cuenta) => {
          if (cuenta.id !== cliente.id) {
            return cuenta;
          }
          cuentaActualizada = true;
          return { ...cuenta, ...perfilActualizado };
        });

        if (!cuentaActualizada) {
          throw new Error("No se encontró la cuenta de este cliente.");
        }

        guardarClientes(clientesActualizados);
      }

      onProfileUpdate(perfilActualizado);
      setPerfil(perfilActualizado);
      setFormulario(perfilActualizado);
      setEditando(false);
      setMensaje("Tus datos se guardaron correctamente.");
      setTipoMensaje("exito");
    } catch {
      setMensaje("No fue posible guardar los cambios. Inténtalo nuevamente.");
      setTipoMensaje("error");
    }
  };

  return (
    <div className="perfil-cliente">
      <section className="perfil-cliente-resumen" aria-label="Resumen del perfil">
        <div className="perfil-cliente-avatar" aria-hidden="true">
          {obtenerIniciales(perfil.nombre)}
        </div>
        <div className="perfil-cliente-identidad">
          <span className="perfil-cliente-etiqueta">PERFIL PERSONAL</span>
          <h3>{perfil.nombre || "Completa tu perfil"}</h3>
          <p>{cliente.correo}</p>
        </div>
        {!editando && (
          <button
            type="button"
            className="perfil-cliente-boton perfil-cliente-boton-editar"
            onClick={iniciarEdicion}
          >
            <i className="bi bi-pencil-square" aria-hidden="true"></i>
            Editar perfil
          </button>
        )}
      </section>

      <section className="perfil-cliente-detalles">
        <div className="perfil-cliente-detalles-cabecera">
          <div>
            <h3>{editando ? "Editar información" : "Datos personales"}</h3>
            <p>
              {editando
                ? "Actualiza tus datos y guarda los cambios."
                : "Consulta la información asociada a tu cuenta."}
            </p>
          </div>
          <span className="perfil-cliente-estado">
            <i className="bi bi-shield-check" aria-hidden="true"></i>
            Cuenta de cliente
          </span>
        </div>

        {mensaje && (
          <p
            className={`perfil-cliente-mensaje ${tipoMensaje}`}
            role={tipoMensaje === "error" ? "alert" : "status"}
          >
            {mensaje}
          </p>
        )}

        {editando ? (
          <form className="perfil-cliente-formulario" onSubmit={guardarPerfil}>
            <div className="perfil-cliente-campo">
              <label htmlFor="perfil-nombre">Nombre completo</label>
              <input
                id="perfil-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                maxLength="80"
                placeholder="Escribe tu nombre completo"
                value={formulario.nombre}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="perfil-cliente-campo">
              <label htmlFor="perfil-correo">Correo de acceso</label>
              <input
                id="perfil-correo"
                type="email"
                value={cliente.correo}
                autoComplete="email"
                readOnly
                aria-describedby="perfil-correo-ayuda"
              />
              <small id="perfil-correo-ayuda">
                El correo usado para iniciar sesión no se puede editar.
              </small>
            </div>

            <div className="perfil-cliente-campo">
              <label htmlFor="perfil-telefono">Teléfono</label>
              <input
                id="perfil-telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                maxLength="25"
                placeholder="Ej. +52 555 123 4567"
                value={formulario.telefono}
                onChange={manejarCambio}
              />
            </div>

            <div className="perfil-cliente-campo">
              <label htmlFor="perfil-direccion">Dirección</label>
              <input
                id="perfil-direccion"
                name="direccion"
                type="text"
                autoComplete="street-address"
                maxLength="120"
                placeholder="Calle, ciudad y país"
                value={formulario.direccion}
                onChange={manejarCambio}
              />
            </div>

            <div className="perfil-cliente-acciones">
              <button
                type="button"
                className="perfil-cliente-boton perfil-cliente-boton-cancelar"
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="perfil-cliente-boton perfil-cliente-boton-guardar"
              >
                <i className="bi bi-check2" aria-hidden="true"></i>
                Guardar cambios
              </button>
            </div>
          </form>
        ) : (
          <div className="perfil-cliente-datos">
            <div className="perfil-cliente-dato">
              <span className="perfil-cliente-icono" aria-hidden="true">
                <i className="bi bi-person"></i>
              </span>
              <div>
                <span>Nombre completo</span>
                <strong>{perfil.nombre || "No registrado"}</strong>
              </div>
            </div>
            <div className="perfil-cliente-dato">
              <span className="perfil-cliente-icono" aria-hidden="true">
                <i className="bi bi-envelope"></i>
              </span>
              <div>
                <span>Correo de acceso</span>
                <strong>{cliente.correo}</strong>
                <small>No editable</small>
              </div>
            </div>
            <div className="perfil-cliente-dato">
              <span className="perfil-cliente-icono" aria-hidden="true">
                <i className="bi bi-telephone"></i>
              </span>
              <div>
                <span>Teléfono</span>
                <strong>{perfil.telefono || "No registrado"}</strong>
              </div>
            </div>
            <div className="perfil-cliente-dato">
              <span className="perfil-cliente-icono" aria-hidden="true">
                <i className="bi bi-geo-alt"></i>
              </span>
              <div>
                <span>Dirección</span>
                <strong>{perfil.direccion || "No registrada"}</strong>
              </div>
            </div>
          </div>
        )}
      </section>

      <p className="perfil-cliente-nota">
        <i className="bi bi-info-circle" aria-hidden="true"></i>
        Tus cambios se guardan en este navegador.
      </p>
    </div>
  );
}

export default PerfilCliente;
