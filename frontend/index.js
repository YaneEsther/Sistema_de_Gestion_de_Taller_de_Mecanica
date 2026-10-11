const express = require("express");
const app = express();

app.use(express.json());
// Servir la carpeta frontend completa
app.use(express.static("frontend"));

// Importar rutas de las APIs
const facturaRoutes = require("./src/routes/facturaRoutes");
const pagoRoutes = require("./src/routes/pagoRoutes");

app.use("/api/facturas", facturaRoutes);
app.use("/api/pagos", pagoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor TallerGest corriendo en http://localhost:${PORT}`);
});