const GeneradorPDF = require("./services/GeneradorReportePDF");
const GeneradorExcel = require("./services/GeneradorReporteExcel");

const datos = [
  {
    nombre: "Cambio de aceite",
    descripcion: "Aceite sintético 5W30",
  },
  {
    nombre: "Alineación",
    descripcion: "Ajuste de dirección",
  },
];

const pdf = new GeneradorPDF();
pdf.generar(datos, "reporte.pdf");

const excel = new GeneradorExcel();
excel.generar(datos, "reporte.xlsx");

console.log("Reportes generados correctamente");