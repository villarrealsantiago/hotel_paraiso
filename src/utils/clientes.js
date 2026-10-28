export const CLAVE_CLIENTES = "clientesHotel";

export const CLIENTE_DEMO = {
  id: "cliente-demo",
  nombre: "Cliente de prueba",
  correo: "cliente@hotel.com",
};

export function normalizarCorreo(correo) {
  return correo.trim().toLowerCase();
}

export function obtenerClientes() {
  const guardados = localStorage.getItem(CLAVE_CLIENTES);

  if (!guardados) {
    return [];
  }

  const clientes = JSON.parse(guardados);

  if (
    !Array.isArray(clientes) ||
    clientes.some(
      (cliente) =>
        !cliente ||
        typeof cliente.id !== "string" ||
        typeof cliente.nombre !== "string" ||
        typeof cliente.correo !== "string" ||
        typeof cliente.password !== "string"
    )
  ) {
    throw new Error("Los datos de las cuentas de cliente no son válidos.");
  }

  return clientes;
}

export function guardarClientes(clientes) {
  localStorage.setItem(CLAVE_CLIENTES, JSON.stringify(clientes));
}

export function clientePuedeReservar(clienteId) {
  if (clienteId === CLIENTE_DEMO.id) {
    return true;
  }

  const cliente = obtenerClientes().find((cuenta) => cuenta.id === clienteId);
  return Boolean(cliente) && cliente.estado !== "inactivo";
}
