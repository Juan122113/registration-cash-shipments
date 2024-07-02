document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pedidoForm');
    const table = document.getElementById('pedidosTable').getElementsByTagName('tbody')[0];
    const totalCosteEnvio = document.getElementById('totalCosteEnvio');
    const borrarTodoBtn = document.getElementById('borrarTodo');
    const fechaInput = document.getElementById('fecha');
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

    // Establecer la fecha actual si no hay pedidos
    if (pedidos.length === 0) {
        fechaInput.valueAsDate = new Date();
    } else {
        fechaInput.value = pedidos[pedidos.length - 1].fecha;
    }

    function actualizarTabla() {
        table.innerHTML = '';
        let total = 0;
        pedidos.forEach((pedido, index) => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${pedido.fecha}</td>
                <td>${pedido.importePagado}€</td>
                <td>${pedido.importeCobrado}€</td>
                <td>${pedido.costeEnvio}€</td>
                <td><button class="borrar-fila" data-index="${index}">Borrar</button></td>
            `;
            total += parseFloat(pedido.costeEnvio);
        });
        totalCosteEnvio.textContent = `Total Coste de Envío: ${total.toFixed(2)}€`;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
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
        actualizarTabla();
        form.reset();
        fechaInput.value = pedido.fecha; // Mantener la fecha del último pedido
    });

    borrarTodoBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los pedidos?')) {
            pedidos = [];
            actualizarTabla();
            fechaInput.valueAsDate = new Date(); // Restablecer la fecha actual
        }
    });

    table.addEventListener('click', (e) => {
        if (e.target.classList.contains('borrar-fila')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('¿Estás seguro de que quieres borrar este pedido?')) {
                pedidos.splice(index, 1);
                actualizarTabla();
            }
        }
    });

    actualizarTabla();
});