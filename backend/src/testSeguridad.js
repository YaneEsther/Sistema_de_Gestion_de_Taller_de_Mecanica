const SeguridadJWT = require("./services/SeguridadJWT");

async function pruebaSeguridad() {
  const seguridad = new SeguridadJWT();

  try {
    const token = await seguridad.iniciarSesion("admin", "123456");

    console.log("Token generado:");
    console.log(token);

    const datos = seguridad.verificarToken(token);

    console.log("\nToken verificado:");
    console.log(datos);
  } catch (error) {
    console.log("Error:", error.message);
  }
}

pruebaSeguridad();