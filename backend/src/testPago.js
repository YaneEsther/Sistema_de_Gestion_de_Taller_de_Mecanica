const PasarelaPagoStripe = require("./services/PasarelaPagoStripe");

async function pruebaPago() {
  const pasarela = new PasarelaPagoStripe();

  const resultado = await pasarela.procesarPago(2500, "Tarjeta de crédito");

  console.log("Resultado del pago:");
  console.log(resultado);
}

pruebaPago();