/**
 * Clase abstracta base para todas las entidades del sistema.
 * Nadie puede instanciarla directamente; otras clases heredan de ella.
 */
class EntidadBase {
  constructor(id = null) {
    if (new.target === EntidadBase) {
      throw new Error("EntidadBase es abstracta y no se puede instanciar directamente");
    }
    this.id = id;
    this.fechaCreacion = new Date();
  }
}

module.exports = EntidadBase;