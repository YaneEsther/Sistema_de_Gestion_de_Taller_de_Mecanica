const RepositorioMySQL = require("../core/RepositorioMySQL");
const GeneradorReportePDF = require("./GeneradorReportePDF");
const Factura = require("../models/Factura");

class FacturaService {
  constructor(pool) {
    this.repositorio = new RepositorioMySQL(pool, "facturas");
    this.generadorPDF = new GeneradorReportePDF();
  }

  async crearFactura(datos) {
    const factura = new Factura(datos);
    const id = await this.repositorio.guardar(factura);
    return { id, ...factura };
  }

  async listarFacturas() {
    return this.repositorio.listar();
  }

  async obtenerFactura(id) {
    return this.repositorio.buscarPorId(id);
  }

  async actualizarEstado(id, estado) {
    return this.repositorio.actualizar(id, { estado });
  }

  async generarPDF(id) {
    const factura = await this.repositorio.buscarPorId(id);
    if (!factura) throw new Error("Factura no encontrada");

    const datos = [
      { nombre: "Factura #" + factura.id, descripcion: `Cliente: ${factura.clienteId}` },
      { nombre: "Total", descripcion: `RD$ ${factura.total}` },
      { nombre: "Estado", descripcion: factura.estado },
    ];

    const nombreArchivo = `factura_${factura.id}.pdf`;
    return this.generadorPDF.generar(datos, nombreArchivo);
  }
}

module.exports = FacturaService;