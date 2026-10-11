const PDFDocument = require("pdfkit");
const fs = require("fs");
const IGeneradorReporte = require("../interfaces/IGeneradorReporte");

class GeneradorReportePDF extends IGeneradorReporte {
  generar(datos, nombreArchivo) {
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(nombreArchivo));

    doc.fontSize(20).text("Reporte del Taller", {
      align: "center",
    });

    doc.moveDown();

    datos.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.nombre} - ${item.descripcion}`);
    });

    doc.end();

    return nombreArchivo;
  }
}

module.exports = GeneradorReportePDF;