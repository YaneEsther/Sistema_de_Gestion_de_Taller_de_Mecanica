document.addEventListener('DOMContentLoaded', () => {
  const selectFactura = document.getElementById('p-factura');
  const selectMetodo = document.getElementById('p-metodo');
  const btnContinuar = document.getElementById('btn-continuar-pago');
  const statusBar = document.getElementById('status-bar');
  const lblTotal = document.getElementById('lbl-total');
  const lblEstado = document.getElementById('lbl-estado');
  const msgPago = document.getElementById('msg-pago');
  const tablaHistorial = document.getElementById('tabla-historial-pagos');
  const inputRecibido = document.getElementById('efectivo-recibido');

  const inputTarjeta = document.getElementById('tc-numero');
  const iconoMarca = document.getElementById('tc-marca');

  const ICONOS_MARCA = {
    '': 'bi bi-credit-card',
    visa: 'fa-brands fa-cc-visa brand-visa',
    mastercard: 'fa-brands fa-cc-mastercard brand-mastercard',
    amex: 'fa-brands fa-cc-amex brand-amex'
  };

  function detectarMarca(digitos) {
    if (/^4/.test(digitos)) return 'visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digitos)) return 'mastercard';
    if (/^3[47]/.test(digitos)) return 'amex';
    return '';
  }

  // Da formato "0000 0000 0000 0000" y cambia el Icono segun la marca
  inputTarjeta.addEventListener('input', () => {
    const digitos = inputTarjeta.value.replace(/\D/g, '').slice(0, 16);
    inputTarjeta.value = digitos.replace(/(.{4})/g, '$1 ').trim();
    iconoMarca.className = ICONOS_MARCA[detectarMarca(digitos)];
  });

  let montoPendienteActual = 0;
  let procesando = false; // evita doble envio

  // Modals de Bootstrap 5
  const modalEfectivo = new bootstrap.Modal(document.getElementById('modalEfectivo'));
  const modalOpcionTarjeta = new bootstrap.Modal(document.getElementById('modalOpcionTarjeta'));
  const modalVerifone = new bootstrap.Modal(document.getElementById('modalVerifone'));
  const modalTarjetaCifrada = new bootstrap.Modal(document.getElementById('modalTarjetaCifrada'));
  const modalTransferencia = new bootstrap.Modal(document.getElementById('modalTransferencia'));
  const modalCheque = new bootstrap.Modal(document.getElementById('modalCheque'));

  // Evita XSS al pintar texto del usuario con innerHTML
  function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function formatoRD(n) {
    return `RD$ ${Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 1. Cargar facturas pendientes
  async function cargarFacturas() {
    try {
      const res = await fetch('/api/facturas?estado=pendiente');
      if (!res.ok) throw new Error('No se pudieron cargar las facturas');
      const facturas = await res.json();

      let htmlOptions = '<option value="">Seleccionar factura...</option>';
      for (const item of facturas) {
        htmlOptions += `<option value="${esc(item.id)}">#FAC-${esc(item.id)} — Total: ${formatoRD(item.total)} (${esc(item.estado)})</option>`;
      }
      selectFactura.innerHTML = htmlOptions;

      cargarHistorial();
    } catch (e) {
      console.error('Error al cargar las facturas:', e);
    }
  }

  // 2. Al cambiar la factura seleccionada
  selectFactura.addEventListener('change', async () => {
    const facturaId = selectFactura.value;
    if (!facturaId) {
      statusBar.style.display = 'none';
      montoPendienteActual = 0;
      validarBoton();
      return;
    }

    try {
      const res = await fetch(`/api/facturas/${encodeURIComponent(facturaId)}`);
      if (!res.ok) throw new Error('Factura no encontrada');
      const f = await res.json();

      // Usa el monto pendiente si el backend lo envia; si no, el total
      montoPendienteActual = Number(f.total);
      lblTotal.textContent = formatoRD(montoPendienteActual);
      lblEstado.textContent = f.estado;
      lblEstado.className = `badge ${String(f.estado).toLowerCase() === 'pagada' ? 'badge-pagada' : 'badge-pendiente'}`;
      statusBar.style.display = 'flex';

      validarBoton();
    } catch (e) {
      console.error('Error al consultar la factura:', e);
    }
  });

  // Selector de metodo por tarjetas
  const metodoCards = document.querySelectorAll('.metodo-card');
  metodoCards.forEach((card) => {
    card.addEventListener('click', () => {
      selectMetodo.value = card.dataset.metodo;
      metodoCards.forEach((c) => c.classList.toggle('active', c === card));
      validarBoton();
    });
  });

  function validarBoton() {
    btnContinuar.disabled = !(selectFactura.value && selectMetodo.value);
  }

  // 3. Abrir el modal segun el metodo
  btnContinuar.addEventListener('click', () => {
    const metodo = selectMetodo.value;

    if (metodo === 'efectivo') {
      document.getElementById('efectivo-monto-cobrar').textContent = formatoRD(montoPendienteActual);
      inputRecibido.value = '';
      const elemDevuelta = document.getElementById('efectivo-devuelta');
      elemDevuelta.textContent = 'RD$ 0.00';
      elemDevuelta.className = 'fw-bold mb-0';
      modalEfectivo.show();
    } else if (metodo === 'tarjeta') {
      modalOpcionTarjeta.show();
    } else if (metodo === 'transferencia') {
      modalTransferencia.show();
    } else if (metodo === 'cheque') {
      modalCheque.show();
    }
  });

  // Devuelta en tiempo real
  inputRecibido.addEventListener('input', (e) => {
    const recibido = parseFloat(e.target.value) || 0;
    const devuelta = recibido - montoPendienteActual;
    const elemDevuelta = document.getElementById('efectivo-devuelta');

    if (devuelta >= 0) {
      elemDevuelta.textContent = formatoRD(devuelta);
      elemDevuelta.className = 'fw-bold text-success mb-0';
    } else {
      elemDevuelta.textContent = `Faltan ${formatoRD(Math.abs(devuelta))}`;
      elemDevuelta.className = 'fw-bold text-danger mb-0';
    }
  });

  // Navegacion en modals de tarjeta
  document.getElementById('btn-ir-verifone').addEventListener('click', () => {
    modalOpcionTarjeta.hide();
    modalVerifone.show();
  });

  document.getElementById('btn-ir-cifrar').addEventListener('click', () => {
    modalOpcionTarjeta.hide();
    modalTarjetaCifrada.show();
  });

  // Efectivo
  document.getElementById('btn-confirmar-efectivo').addEventListener('click', async () => {
    const recibido = parseFloat(inputRecibido.value) || 0;
    if (recibido < montoPendienteActual) {
      alert('El monto recibido es menor al total a pagar.');
      return;
    }
    modalEfectivo.hide();
    await procesarPagoFinal('Efectivo', montoPendienteActual, 'Pago completo en efectivo');
  });

  // Verifone
  document.getElementById('btn-confirmar-verifone').addEventListener('click', async () => {
    const banco = document.getElementById('v-banco').value.trim() || 'Genérico';
    const trans = document.getElementById('v-transaccion').value.trim() || 'N/A';
    const aprob = document.getElementById('v-aprobacion').value.trim() || 'N/A';
    modalVerifone.hide();
    await procesarPagoFinal('Tarjeta (Verifone)', montoPendienteActual, `Verifone POS: ${banco} | Trans: ${trans} | Aprob: ${aprob}`);
  });

  // Tarjeta cifrada: solo se guardan los ultimos 4 dígitos
  document.getElementById('btn-confirmar-cifrada').addEventListener('click', async () => {
    const inputNum = document.getElementById('tc-numero');
    const digitos = inputNum.value.replace(/\D/g, '');
    if (digitos.length < 13) {
      alert('Ingresa un número de tarjeta válido.');
      return;
    }
    const nota = `Tarjeta Cifrada (**** ${digitos.slice(-4)})`;
    inputNum.value = ''; // no dejar el numero completo en el DOM
    modalTarjetaCifrada.hide();
    await procesarPagoFinal('Tarjeta Cifrada', montoPendienteActual, nota);
  });

  // Transferencia
  document.getElementById('btn-confirmar-transferencia').addEventListener('click', async () => {
    const banco = document.getElementById('t-banco').value.trim() || 'Banco';
    const ref = document.getElementById('t-referencia').value.trim() || 'N/A';
    modalTransferencia.hide();
    await procesarPagoFinal('Transferencia', montoPendienteActual, `Transferencia: ${banco} | Ref: ${ref}`);
  });

  // Cheque
  document.getElementById('btn-confirmar-cheque').addEventListener('click', async () => {
    const banco = document.getElementById('ch-banco').value.trim() || 'Banco';
    const num = document.getElementById('ch-numero').value.trim() || 'N/A';
    const titular = document.getElementById('ch-titular').value.trim();
    modalCheque.hide();
    await procesarPagoFinal('Cheque', montoPendienteActual, `Cheque: ${banco} #${num}${titular ? ' | Titular: ' + titular : ''}`);
  });

  // Enviar pago al backend
  // Vacia los campos de todos los modals (incluido el CVV) tras leerlos
  function limpiarModales() {
    document.querySelectorAll('.modal input').forEach((i) => { i.value = ''; });
    iconoMarca.className = ICONOS_MARCA[''];
  }

  async function procesarPagoFinal(metodo, monto, nota) {
    if (procesando) return;
    procesando = true;
    btnContinuar.disabled = true;
    limpiarModales();

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facturaId: Number(selectFactura.value),
          monto,
          metodoPago: metodo,
          referencia: nota
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar el registro de pago');
      }

      msgPago.innerHTML = `<div class="alert alert-success">✅ Pago por ${esc(metodo)} registrado con éxito.</div>`;
      statusBar.style.display = 'none';
      selectFactura.value = '';
      selectMetodo.value = '';
      metodoCards.forEach((c) => c.classList.remove('active'));
      montoPendienteActual = 0;
      await cargarFacturas();
    } catch (e) {
      msgPago.innerHTML = `<div class="alert alert-danger">❌ ${esc(e.message)}</div>`;
    } finally {
      procesando = false;
      validarBoton();
    }
  }

  // Historial de pagos
  async function cargarHistorial() {
    try {
      const res = await fetch('/api/pagos');
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      const pagos = await res.json();

      if (!pagos || pagos.length === 0) {
        tablaHistorial.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin pagos registrados</td></tr>';
        return;
      }

      let filasHTML = '';
      for (const p of pagos) {
        const fechaTexto = new Date(p.fecha || Date.now()).toLocaleDateString('es-DO');
        filasHTML += `
          <tr>
            <td><strong>#FAC-${esc(p.facturaId)}</strong></td>
            <td>${fechaTexto}</td>
            <td><span class="badge bg-secondary">${esc(p.metodo)}</span></td>
            <td><strong>${formatoRD(p.monto)}</strong></td>
            <td><small>${esc(p.referencia) || '-'}</small></td>
          </tr>
        `;
      }
      tablaHistorial.innerHTML = filasHTML;
    } catch (e) {
      console.error('Error cargando historial:', e);
      tablaHistorial.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Error al cargar historial</td></tr>';
    }
  }

  cargarFacturas();
});