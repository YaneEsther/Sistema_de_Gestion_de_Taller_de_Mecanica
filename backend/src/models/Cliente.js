const EntidadBase = require("../core/EntidadBase");

/**
 * Entidad Cliente del taller.
 * Hereda de EntidadBase (id, fechaCreacion).
 * Un cliente puede tener uno o varios vehiculos registrados.
 */
class Cliente extends EntidadBase {
  constructor({ id = null, nombre, telefono = null, correo = null, direccion = null }) {
    super(id);
    this.nombre = nombre;
    this.telefono = telefono;
    this.correo = correo;
    this.direccion = direccion;
    this.validar();
  }

  // El diagrama de clases usa "idCliente"; equivale al id heredado de EntidadBase
  get idCliente() {
    return this.id;
  }

  validar() {
    if (!this.nombre || String(this.nombre).trim() === "") {
      throw new Error("El nombre del cliente es obligatorio");
    }
    if (this.correo && !String(this.correo).includes("@")) {
      throw new Error("El correo no es valido");
    }
  }

  // Cambia solo los datos que vengan en el objeto y vuelve a validar
  actualizarDatos(datos) {
    const camposPermitidos = ["nombre", "telefono", "correo", "direccion"];

    for (const campo of camposPermitidos) {
      if (datos[campo] !== undefined) {
        this[campo] = datos[campo];
      }
    }

    this.validar();
  }
}

module.exports = Cliente;
