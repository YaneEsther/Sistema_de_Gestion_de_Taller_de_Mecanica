document.addEventListener('DOMContentLoaded', () => {
  const selectFactura = document.getElementById('p-factura');
  const statusBar = document.getElementById('status-bar');
  const lblTotal = document.getElementById('lbl-total');
  const lblEstado = document.getElementById('lbl-estado');
  const inputMonto = document.getElementById('p-monto');
  const formPago = document.getElementById('form-pago');
  const msgPago = document.getElementById('msg-pago');
  const tablaHistorial = document.getElementById('tabla-historial-pagos');

  async function cargarFacturasYPagos() {
    try {
      const res = await fetch('/api/facturas');
      const facturas = await res.json();

      selectFactura.innerHTML = '<option value="">Seleccionar factura...</option>' + 
        facturas.map(f => `<option value="${f.id}">#FAC-${f.id} — RD$ ${Number(f.total).toLocaleString()} (${f.estado})</option>`).join('');

      cargarHistorial();
    } catch (e) {
      console.error(e);
    }
  }

  selectFactura.addEventListener('change', async () => {
    const facturaId = selectFactura.value;
    if (!facturaId) {
      statusBar.style.display = 'none';
      inputMonto.value = '';
      return;
    }

    try {
      const res = await fetch(`/api/facturas/${facturaId}`);
      const f = await res.json();

      statusBar.style.display = 'flex';
      lblTotal.textContent = `RD$ ${Number(f.total).toFixed(2)}`;
      lblEstado.textContent = f.estado;
      lblEstado.className = `badge ${f.estado === 'PAGADA' ? 'badge-pagada' : 'badge-pendiente'}`;

      inputMonto.value = Number(f.total).toFixed(2);
    } catch (e) {
      console.error(e);
    }
  });

  formPago.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgPago.textContent = 'Procesando pago...';

    const body = {
      factura_id: selectFactura.value,
      metodo: document.getElementById('p-metodo').value,
      monto: inputMonto.value,
      nota: document.getElementById('p-nota').value
    };

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar pago');

      msgPago.textContent = '✅ Pago registrado correctamente.';
      msgPago.style.color = '#10B981';
      formPago.reset();
      statusBar.style.display = 'none';
      cargarFacturasYPagos();
    } catch (err) {
      msgPago.textContent = `❌ ${err.message}`;
      msgPago.style.color = '#EF4444';
    }
  });

  async function cargarHistorial() {
    try {
      const res = await fetch('/api/pagos');
      const pagos = await res.json();

      if (!pagos || pagos.length === 0) {
        tablaHistorial.innerHTML = '<tr><td colspan="5" class="empty">No hay pagos registrados</td></tr>';
        return;
      }

      tablaHistorial.innerHTML = pagos.map(p => `
        <tr>
          <td><strong>#FAC-${p.factura_id}</strong></td>
          <td>${new Date(p.fecha_pago || Date.now()).toLocaleDateString('es-DO')}</td>
          <td>${p.metodo}</td>
          <td><strong>RD$ ${Number(p.monto).toFixed(2)}</strong></td>
          <td><small>${p.nota || '-'}</small></td>
        </tr>
      `).join('');
    } catch (e) {
      tablaHistorial.innerHTML = '<tr><td colspan="5" class="empty">Error al cargar el historial</td></tr>';
    }
  }

  document.getElementById('btn-cancelar').addEventListener('click', () => {
    formPago.reset();
    statusBar.style.display = 'none';
  });

  cargarFacturasYPagos();
});