const NotificadorEmail = require("./services/NotificadorEmail");

async function pruebaNotificacion() {
  const notificador = new NotificadorEmail();

  const resultado = await notificador.enviar(
    "cliente@correo.com",
    "Vehículo listo para entrega",
    "Su vehículo ya fue reparado y está listo para ser retirado."
  );

  console.log("Resultado:");
  console.log(resultado);
}

pruebaNotificacion();