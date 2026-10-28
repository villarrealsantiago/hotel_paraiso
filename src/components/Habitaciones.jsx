
import HabitacionCard from "./HabitacionCard";
import estandar from "../assets/estandar.jpg";
import premium from "../assets/premium.jpg";
import suite from "../assets/suite.jpg";
import "./Habitaciones.css";

const habitaciones = [
  {
    id: 1,
    imagen: estandar,
    nombre: "Habitación Estándar",
    descripcion: "Habitación cómoda y bien equipada para una estancia placentera.",
    precio: 150000,
  },
  {
    id: 2,
    imagen: premium,
    nombre: "Habitación Premium",
    descripcion: "Habitación con características premium para una experiencia de alta gama.",
    precio: 250000,
  },
  {
    id: 3,
    imagen: suite,
    nombre: "Suite",
    descripcion: "Suite espaciosa y lujosa con todas las comodidades.",
    precio: 500000,
  },
];

function Habitaciones() {
  return (
    <section className="py-5 bg-light" id="habitaciones">
      <div className="container">
        <h2 className="text-center fw-bold mb-3">
          Nuestras Habitaciones
        </h2>

        <p className="text-center text-secondary mb-5">
          Descubre nuestras habitaciones diseñadas para tu comodidad y descanso
        </p>

        <div className="row">
          {habitaciones.map((habitacion) => (
            <HabitacionCard
              key={habitacion.id}
              {...habitacion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Habitaciones;
