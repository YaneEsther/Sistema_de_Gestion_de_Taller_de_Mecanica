const path = require("path");
const express = require("express");
const app = express();

app.use(express.json());

// Sirve la carpeta frontend (asume: proyecto/backend/index.js y proyecto/frontend)
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Rutas de las APIs
const facturaRoutes = require("./src/routes/facturaRoutes");
const pagoRoutes = require("./src/routes/pagoRoutes");

app.use("/api/facturas", facturaRoutes);
app.use("/api/pagos", pagoRoutes);

// Cualquier /api desconocida responde JSON (no HTML)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo central de errores
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status < 500 ? "Solicitud inválida" : "Error interno del servidor",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor TallerGest corriendo en http://localhost:${PORT}`);
});