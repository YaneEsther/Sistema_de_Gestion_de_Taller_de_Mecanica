const ExcelJS = require("exceljs");
const IGeneradorReporte = require("../interfaces/IGeneradorReporte");

class GeneradorReporteExcel extends IGeneradorReporte {
  async generar(datos, nombreArchivo) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Servicios");

    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Descripción", key: "descripcion", width: 40 },
    ];

    datos.forEach((item) => sheet.addRow(item));

    await workbook.xlsx.writeFile(nombreArchivo);

    return nombreArchivo;
  }
}

module.exports = GeneradorReporteExcel;