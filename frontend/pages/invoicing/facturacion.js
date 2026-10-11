document.addEventListener('DOMContentLoaded', () => {
  const selectOrden = document.getElementById('f-orden');
  const selectCliente = document.getElementById('f-cliente');
  const form = document.getElementById('form-generar-factura');
  const msg = document.getElementById('msg-facturacion');

  const tablaServicios = document.getElementById('tabla-servicios');
  const tablaRepuestos = document.getElementById('tabla-repuestos');
  const txtSubtotal = document.getElementById('txt-subtotal');
  const txtItbis = document.getElementById('txt-itbis');
  const txtTotal = document.getElementById('txt-total');

  let totalActual = 0;

  async function inicializar() {
    try {
      const res = await fetch('/api/facturas/ordenes-aprobadas');
      const data = await res.json();

      selectOrden.innerHTML = '<option value="">Seleccionar orden...</option>' +
        (data.ordenes || []).map(o => `<option value="${o.id}">OT-${o.id} - ${o.vehiculo || ''}</option>`).join('');

      selectCliente.innerHTML = '<option value="">Seleccionar cliente...</option>' +
        (data.clientes || []).map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    } catch (e) {
      console.error('Error cargando listas:', e);
    }
  }

  selectOrden.addEventListener('change', async () => {
    const ordenId = selectOrden.value;
    if (!ordenId) return resetPreview();

    try {
      const res = await fetch(`/api/facturas/orden-detalle/${ordenId}`);
      const detalle = await res.json();

      tablaServicios.innerHTML = (detalle.servicios || []).map(s => `
        <tr><td>${s.nombre}</td><td>RD$ ${Number(s.precio).toFixed(2)}</td></tr>
      `).join('') || '<tr><td colspan="2" class="empty">Sin servicios</td></tr>';

      tablaRepuestos.innerHTML = (detalle.repuestos || []).map(r => `
        <tr><td>${r.nombre} (x${r.cantidad})</td><td>RD$ ${(r.precio * r.cantidad).toFixed(2)}</td></tr>
      `).join('') || '<tr><td colspan="2" class="empty">Sin repuestos</td></tr>';

      totalActual = Number(detalle.total || 0);
      const subtotal = totalActual / 1.18;
      const itbis = totalActual - subtotal;

      txtSubtotal.textContent = `RD$ ${subtotal.toFixed(2)}`;
      txtItbis.textContent = `RD$ ${itbis.toFixed(2)}`;
      txtTotal.textContent = `RD$ ${totalActual.toFixed(2)}`;

      if (detalle.cliente_id) selectCliente.value = detalle.cliente_id;
    } catch (e) {
      console.error(e);
    }
  });

  function resetPreview() {
    tablaServicios.innerHTML = '<tr><td colspan="2" class="empty">Selecciona una orden de trabajo</td></tr>';
    tablaRepuestos.innerHTML = '<tr><td colspan="2" class="empty">Selecciona una orden de trabajo</td></tr>';
    txtSubtotal.textContent = 'RD\$ 0.00';
    txtItbis.textContent = 'RD\$ 0.00';
    txtTotal.textContent = 'RD\$ 0.00';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = 'Generando factura...';

    const body = {
      orden_id: selectOrden.value,
      cliente_id: selectCliente.value,
      metodo_pago: document.getElementById('f-metodo').value,
      total: totalActual
    };

    try {
      const res = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar factura');

      msg.textContent = `✅ Factura #FAC-${data.id || ''} generada exitosamente.`;
      msg.style.color = '#10B981';
      form.reset();
      resetPreview();
    } catch (err) {
      msg.textContent = `❌ ${err.message}`;
      msg.style.color = '#EF4444';
    }
  });

  inicializar();
});