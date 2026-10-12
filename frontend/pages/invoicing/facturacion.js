document.addEventListener('DOMContentLoaded', () => {
  const selectOrden = document.getElementById('f-orden');
  const inputCliente = document.getElementById('f-cliente');
  const form = document.getElementById('form-generar-factura');
  const msg = document.getElementById('msg-facturacion');
  const btnGenerar = form.querySelector('button[type="submit"]');
  const btnEnviar = document.getElementById('btn-enviar-cliente');

  const tablaServicios = document.getElementById('tabla-servicios');
  const tablaRepuestos = document.getElementById('tabla-repuestos');
  const txtSubtotal = document.getElementById('txt-subtotal');
  const txtItbis = document.getElementById('txt-itbis');
  const txtTotal = document.getElementById('txt-total');

  let facturable = false; // true cuando hay una orden con detalle cargado
  let enviando = false;

  // "Enviar a cliente" aun no tiene backend
  btnEnviar.disabled = true;
  btnEnviar.title = 'Próximamente';

  function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function formatoRD(n) {
    return `RD$ ${Number(n).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Ordenes finalizadas que todavia no tienen factura
  async function inicializar() {
    try {
      const res = await fetch('/api/facturas/ordenes-facturables');
      if (!res.ok) throw new Error('No se pudieron cargar las órdenes');
      const ordenes = await res.json();

      if (ordenes.length === 0) {
        selectOrden.innerHTML = '<option value="">No hay órdenes finalizadas por facturar</option>';
        return;
      }

      selectOrden.innerHTML = '<option value="">Seleccionar orden...</option>' +
        ordenes.map(o =>
          `<option value="${esc(o.id)}">OT-${esc(o.id)} — ${esc(o.vehiculo)} (${esc(o.clienteNombre)})</option>`
        ).join('');
    } catch (e) {
      console.error('Error cargando órdenes:', e);
      selectOrden.innerHTML = '<option value="">Error al cargar órdenes</option>';
    }
  }

  // Vista previa: todo viene calculado por el servidor
  selectOrden.addEventListener('change', async () => {
    const ordenId = selectOrden.value;
    if (!ordenId) return resetPreview();

    try {
      const res = await fetch(`/api/facturas/orden-detalle/${encodeURIComponent(ordenId)}`);
      const detalle = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(detalle.error || 'No se pudo cargar el detalle de la orden');

      tablaServicios.innerHTML = detalle.servicios.map(s => `
        <tr><td>${esc(s.nombre)} (x${esc(s.cantidad)})</td><td>${formatoRD(s.precio * s.cantidad)}</td></tr>
      `).join('') || '<tr><td colspan="2" class="empty">Sin servicios</td></tr>';

      tablaRepuestos.innerHTML = detalle.repuestos.map(r => `
        <tr><td>${esc(r.nombre)} (x${esc(r.cantidad)})</td><td>${formatoRD(r.precio * r.cantidad)}</td></tr>
      `).join('') || '<tr><td colspan="2" class="empty">Sin repuestos</td></tr>';

      txtSubtotal.textContent = formatoRD(detalle.subtotal);
      txtItbis.textContent = formatoRD(detalle.itbis);
      txtTotal.textContent = formatoRD(detalle.total);
      inputCliente.value = detalle.clienteNombre;
      facturable = detalle.total > 0;

      msg.textContent = '';
    } catch (e) {
      resetPreview();
      msg.textContent = `❌ ${e.message}`;
      msg.style.color = '#EF4444';
    }
  });

  function resetPreview() {
    tablaServicios.innerHTML = '<tr><td colspan="2" class="empty">Selecciona una orden de trabajo</td></tr>';
    tablaRepuestos.innerHTML = '<tr><td colspan="2" class="empty">Selecciona una orden de trabajo</td></tr>';
    txtSubtotal.textContent = 'RD$ 0.00';
    txtItbis.textContent = 'RD$ 0.00';
    txtTotal.textContent = 'RD$ 0.00';
    inputCliente.value = '';
    facturable = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return;

    if (!selectOrden.value || !facturable) {
      msg.textContent = '❌ Selecciona una orden con servicios o repuestos.';
      msg.style.color = '#EF4444';
      return;
    }

    enviando = true;
    btnGenerar.disabled = true;
    msg.textContent = 'Generando factura...';
    msg.style.color = '';

    try {
      // Solo se envia la orden: cliente y total los calcula el servidor
      const res = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordenId: Number(selectOrden.value) })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Error al generar factura');

      msg.textContent = `✅ Factura #FAC-${data.id || ''} generada exitosamente.`;
      msg.style.color = '#10B981';
      form.reset();
      resetPreview();
      await inicializar(); // la orden ya facturada sale de la lista
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
      msg.style.color = '#EF4444';
    } finally {
      enviando = false;
      btnGenerar.disabled = false;
    }
  });

  inicializar();
});