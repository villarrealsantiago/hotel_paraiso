import piscina from "../assets/piscina.jpg";
import restaurante from "../assets/restaurante.jpg";
import lobby from "../assets/lobby.jpg";
import "./Servicios.css";

const servicios = [
  {
    nombre: "Piscina",
    imagen: piscina,
    descripcion: "Disfruta de un espacio ideal para relajarte.",
  },
  {
    nombre: "Restaurante",
    imagen: restaurante,
    descripcion: "Saborea deliciosas opciones durante tu estancia.",
  },
  {
    nombre: "Lobby",
    imagen: lobby,
    descripcion: "Un espacio cómodo y acogedor para recibirte.",
  },
];

function Servicios() {
  return (
    <section className="py-5 bg-light" id="servicios">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Nuestros Servicios</h2>
          <p className="text-secondary">
            Disfruta de nuestros servicios diseñados para tu comodidad y
            bienestar
          </p>
        </div>

        <div className="row align-center g-5">
          {servicios.map((servicio, index) => (
            <div className="col-md-12 mb-4" key={servicio.nombre}>
              <div className="row align-items-center g-4">
                <div
                  className={`col-md-6 ${index % 2 !== 0 ? "order-md-2" : ""}`}
                >
                  <img
                    src={servicio.imagen}
                    alt={servicio.nombre}
                    className="img-fluid rounded-4 servicio-img"
                  />
                </div>

                <div className="col-md-6">
                  <div className="px-md-4">
                    <h3 className="fw-bold">{servicio.nombre}</h3>
                    <p className="text-secondary">{servicio.descripcion}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Servicios;
