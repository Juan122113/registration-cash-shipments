document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pedidoForm');
    const table = document.getElementById('pedidosTable').getElementsByTagName('tbody')[0];
    const totalCosteEnvio = document.getElementById('totalCosteEnvio');
    const totalDia = document.getElementById('totalDia');
    const totalesDiarios = document.getElementById('totalesDiarios');
    const borrarTodoBtn = document.getElementById('borrarTodo');
    const borrarDiaBtn = document.getElementById('borrarDia');
    const borrarSemanaBtn = document.getElementById('borrarSemana');
    const fechaInput = document.getElementById('fecha');
    const totalSemana = document.getElementById('totalSemana');
    const totalesSemanales = document.getElementById('totalesSemanales');
    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    let totales = JSON.parse(localStorage.getItem('totalesDiarios')) || {};
    let totalesSemana = JSON.parse(localStorage.getItem('totalesSemanales')) || {};

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

    function formatearSemana(fecha) {
        const d = new Date(fecha);
        const primerDiaDelAnio = new Date(d.getFullYear(), 0, 1);
        const pastDays = Math.floor((d - primerDiaDelAnio) / (24 * 60 * 60 * 1000));
        const semanasDesdeInicio = Math.floor((pastDays + primerDiaDelAnio.getDay() + 1) / 7);
        return `S${semanasDesdeInicio} ${d.getFullYear()}`;
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
        actualizarTablaSemanal();
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        localStorage.setItem('totalesDiarios', JSON.stringify(totales));
        localStorage.setItem('totalesSemanales', JSON.stringify(totalesSemana));
    }

    // CAMBIO: Modificada la función para incluir botones de borrado para cada día
    function actualizarTotalesDiarios() {
        totalesDiarios.innerHTML = '';
        Object.entries(totales).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([fecha, total]) => {
            const li = document.createElement('li');
            li.innerHTML = `${formatearFecha(fecha)}: ${total.toFixed(2)} 
                <button class="borrar-dia" data-fecha="${fecha}">Borrar</button>`;
            totalesDiarios.appendChild(li);
        });
        const fechaActual = fechaInput.value;
        totalDia.textContent = `Total del Día (${formatearFecha(fechaActual)}): ${(totales[fechaActual] || 0).toFixed(2)}`;
    }

    // CAMBIO: Modificada la función para incluir botones de borrado para cada semana
    function actualizarTablaSemanal() {
        totalesSemanales.innerHTML = '';
        Object.entries(totalesSemana).sort((a, b) => b[0].localeCompare(a[0])).forEach(([semana, total]) => {
            const li = document.createElement('li');
            li.innerHTML = `${semana}: ${total.toFixed(2)} 
                <button class="borrar-semana" data-semana="${semana}">Borrar</button>`;
            totalesSemanales.appendChild(li);
        });
        const semanaActual = formatearSemana(fechaInput.value);
        totalSemana.textContent = `Total de la Semana (${semanaActual}): ${(totalesSemana[semanaActual] || 0).toFixed(2)}`;
    }

    function actualizarTotalDiario(fecha, costeEnvio) {
        if (!totales[fecha]) {
            totales[fecha] = 0;
        }
        totales[fecha] += parseFloat(costeEnvio);
    }

    function actualizarTotalSemanal(fecha, costeEnvio) {
        const semana = formatearSemana(fecha);
        if (!totalesSemana[semana]) {
            totalesSemana[semana] = 0;
        }
        totalesSemana[semana] += parseFloat(costeEnvio);
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
        actualizarTotalSemanal(pedido.fecha, costeEnvio);
        actualizarTabla();
        form.reset();
        fechaInput.value = pedido.fecha; // Mantener la fecha del último pedido
    });

    borrarTodoBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los pedidos, totales diarios y semanales?')) {
            pedidos = [];
            totales = {};
            totalesSemana = {};
            actualizarTabla();
            fechaInput.valueAsDate = new Date(); // Restablecer la fecha actual
        }
    });

    borrarDiaBtn.addEventListener('click', () => {
        const fechaActual = fechaInput.value;
        if (confirm(`¿Estás seguro de que quieres borrar el total del día ${formatearFecha(fechaActual)}?`)) {
            borrarTotalDia(fechaActual);
        }
    });

    borrarSemanaBtn.addEventListener('click', () => {
        const fechaActual = fechaInput.value;
        const semanaActual = formatearSemana(fechaActual);
        if (confirm(`¿Estás seguro de que quieres borrar el total de la semana ${semanaActual}?`)) {
            borrarTotalSemana(semanaActual);
        }
    });

    // CAMBIO: Nueva función para borrar el total de un día específico
    function borrarTotalDia(fecha) {
        pedidos = pedidos.filter(pedido => pedido.fecha !== fecha);
        const semana = formatearSemana(fecha);
        totalesSemana[semana] -= totales[fecha] || 0;
        if (totalesSemana[semana] <= 0) {
            delete totalesSemana[semana];
        }
        delete totales[fecha];
        actualizarTabla();
    }

    // CAMBIO: Nueva función para borrar el total de una semana específica
    function borrarTotalSemana(semana) {
        pedidos = pedidos.filter(pedido => formatearSemana(pedido.fecha) !== semana);
        Object.keys(totales).forEach(fecha => {
            if (formatearSemana(fecha) === semana) {
                delete totales[fecha];
            }
        });
        delete totalesSemana[semana];
        actualizarTabla();
    }

    table.addEventListener('click', (e) => {
        if (e.target.classList.contains('borrar-fila')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('¿Estás seguro de que quieres borrar este pedido?')) {
                const pedidoBorrado = pedidos[index];
                const semana = formatearSemana(pedidoBorrado.fecha);
                totales[pedidoBorrado.fecha] -= parseFloat(pedidoBorrado.costeEnvio);
                totalesSemana[semana] -= parseFloat(pedidoBorrado.costeEnvio);
                if (totales[pedidoBorrado.fecha] <= 0) {
                    delete totales[pedidoBorrado.fecha];
                }
                if (totalesSemana[semana] <= 0) {
                    delete totalesSemana[semana];
                }
                pedidos.splice(index, 1);
                actualizarTabla();
            }
        }
    });

    // CAMBIO: Nuevo evento para manejar el borrado de días individuales
    totalesDiarios.addEventListener('click', (e) => {
        if (e.target.classList.contains('borrar-dia')) {
            const fecha = e.target.getAttribute('data-fecha');
            if (confirm(`¿Estás seguro de que quieres borrar el total del día ${formatearFecha(fecha)}?`)) {
                borrarTotalDia(fecha);
            }
        }
    });

    // CAMBIO: Nuevo evento para manejar el borrado de semanas individuales
    totalesSemanales.addEventListener('click', (e) => {
        if (e.target.classList.contains('borrar-semana')) {
            const semana = e.target.getAttribute('data-semana');
            if (confirm(`¿Estás seguro de que quieres borrar el total de la semana ${semana}?`)) {
                borrarTotalSemana(semana);
            }
        }
    });

    actualizarTabla();
});