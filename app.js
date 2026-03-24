const express = require('express');
const app = express();

app.use(express.json());

let citas = [];
let nextId = 1;

app.get('/citas', (req, res) => {
    res.json(citas);
});

app.get('/citas/:id', (req, res) => {
    const cita = citas.find(c => c.id === parseInt(req.params.id));
    if (!cita) {
        return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json(cita);
});


// POST /citas - Registrar una nueva cita
app.post('/citas', (req, res) => {
    const { fecha_dia, hora, duracion, email1 } = req.body;

    if (!fecha_dia || !hora || !email1) {
        return res.status(400).json({ error: 'Fecha/dia, hora y email son requeridos' });
    }

    const nuevaCita = {
        id: nextId++,
        fecha_dia,
        hora,
        duracion: duracion || 'No especificada',
        email1,
        createdAt: new Date().toISOString()
    };

    citas.push(nuevaCita);
    res.status(201).json(nuevaCita);
});

// PUT /citas/:id - Actualizar una cita
app.put('/citas/:id', (req, res) => {
    const index = citas.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const { fecha_dia, hora, duracion, email1 } = req.body;

    citas[index] = {
        ...citas[index],
        fecha_dia: fecha_dia || citas[index].fecha_dia,
        hora: hora || citas[index].hora,
        duracion: duracion || citas[index].duracion,
        email1: email1 || citas[index].email1
    };

    res.json(citas[index]);
});

module.exports = app;