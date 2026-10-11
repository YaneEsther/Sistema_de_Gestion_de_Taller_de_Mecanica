const LogAuditoria = require("./services/LogAuditoria");

function pruebaAuditoria() {
  const auditoria = new LogAuditoria();

  const registro = auditoria.registrarCambio(
    "admin",
    "CREAR",
    "Cliente"
  );

  console.log("Registro creado:");
  console.log(registro);
}

pruebaAuditoria();