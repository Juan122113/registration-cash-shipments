document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pedidoForm');
    const table = document.getElementById('pedidosTable').getElementsByTagName('tbody')[0];
    const totalCosteEnvio = document.getElementById('totalCosteEnvio');
    const totalDia = document.getElementById('totalDia');
    const totalesDiarios = document.getElementById('totalesDiarios');
    const borrarTodoBtn = document.getElementById('borrarTodo');
    const borrarDiaBtn = document.getElementById('borrarDia');
    const fechaInput = document.getElementById('fecha');
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    let totales = JSON.parse(localStorage.getItem('totalesDiarios')) || {};

    // Establecer la fecha actual si no hay pedidos
    if (pedidos.length === 0) {
        fechaInput.valueAsDate = new Date();
    } else {
        fechaInput.value = pedidos[pedidos.length - 1].fecha;
    }

    function formatearFecha(fecha) {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}`;
    }

    function actualizarTabla() {
        table.innerHTML = '';
        let total = 0;
        pedidos.forEach((pedido, index) => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${formatearFecha(pedido.fecha)}</td>
                <td>${pedido.importePagado}</td>
                <td>${pedido.importeCobrado}</td>
                <td>${pedido.costeEnvio}</td>
                <td><button class="borrar-fila" data-index="${index}">Borrar</button></td>
            `;
            total += parseFloat(pedido.costeEnvio);
        });
        totalCosteEnvio.textContent = `Total Coste de Envío: ${total.toFixed(2)}`;
        actualizarTotalesDiarios();
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        localStorage.setItem('totalesDiarios', JSON.stringify(totales));
    }

    function actualizarTotalesDiarios() {
        totalesDiarios.innerHTML = '';
        Object.entries(totales).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([fecha, total]) => {
            const li = document.createElement('li');
            li.textContent = `${formatearFecha(fecha)}: ${total.toFixed(2)}`;
            totalesDiarios.appendChild(li);
        });
        const fechaActual = fechaInput.value;
        totalDia.textContent = `Total del Día (${formatearFecha(fechaActual)}): ${(totales[fechaActual] || 0).toFixed(2)}`;
    }

    function actualizarTotalDiario(fecha, costeEnvio) {
        if (!totales[fecha]) {
            totales[fecha] = 0;
        }
        totales[fecha] += parseFloat(costeEnvio);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const importePagado = parseFloat(document.getElementById('importePagado').value);
        const importeCobrado = parseFloat(document.getElementById('importeCobrado').value);
        const costeEnvio = (importeCobrado - importePagado).toFixed(2);

        const pedido = {
            fecha: fechaInput.value,
            importePagado: importePagado.toFixed(2),
            importeCobrado: importeCobrado.toFixed(2),
            costeEnvio: costeEnvio
        };
        pedidos.push(pedido);
        actualizarTotalDiario(pedido.fecha, costeEnvio);
        actualizarTabla();
        form.reset();
        fechaInput.value = pedido.fecha; // Mantener la fecha del último pedido
    });

    borrarTodoBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los pedidos y totales diarios?')) {
            pedidos = [];
            totales = {};
            actualizarTabla();
            fechaInput.valueAsDate = new Date(); // Restablecer la fecha actual
        }
    });

    borrarDiaBtn.addEventListener('click', () => {
        const fechaActual = fechaInput.value;
        if (confirm(`¿Estás seguro de que quieres borrar el total del día ${formatearFecha(fechaActual)}?`)) {
            pedidos = pedidos.filter(pedido => pedido.fecha !== fechaActual);
            delete totales[fechaActual];
            actualizarTabla();
        }
    });

    table.addEventListener('click', (e) => {
        if (e.target.classList.contains('borrar-fila')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('¿Estás seguro de que quieres borrar este pedido?')) {
                const pedidoBorrado = pedidos[index];
                totales[pedidoBorrado.fecha] -= parseFloat(pedidoBorrado.costeEnvio);
                if (totales[pedidoBorrado.fecha] === 0) {
                    delete totales[pedidoBorrado.fecha];
                }
                pedidos.splice(index, 1);
                actualizarTabla();
            }
        }
    });

    actualizarTabla();
});