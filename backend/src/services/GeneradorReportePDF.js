const PDFDocument = require("pdfkit");
const fs = require("fs");
const IGeneradorReporte = require("../interfaces/IGeneradorReporte");

class GeneradorReportePDF extends IGeneradorReporte {
  generar(datos, nombreArchivo) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const salida = fs.createWriteStream(nombreArchivo);

      salida.on("finish", () => resolve(nombreArchivo));
      salida.on("error", reject);
      doc.on("error", reject);

      doc.pipe(salida);

      doc.fontSize(20).text("Reporte del Taller", { align: "center" });
      doc.moveDown();

      datos.forEach((item, index) => {
        doc.fontSize(12).text(`${index + 1}. ${item.nombre} - ${item.descripcion}`);
      });

      doc.end();
    });
  }
}

module.exports = GeneradorReportePDF;