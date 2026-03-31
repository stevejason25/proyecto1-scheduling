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
    // DELETE /citas/:id - Cancelar una cita
app.delete('/citas/:id', (req, res) => {
  const idCita = parseInt(req.params.id);
  const index = citas.findIndex(c => c.id === idCita);

  if (index === -1) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  citas.splice(index, 1);
  res.status(204).send(); // O res.status(200).json({ mensaje: "Cita eliminada" });
});

    // GET /horarios - Obtener horarios filtrados
app.get('/horarios', (req, res) => {
  const { vista } = req.query; // Ejemplo: /horarios?vista=semanal

  // Filtramos o estructuramos según lo que pida la vista
  res.json({
    tipo_horario: vista || 'diario',
    total_citas: citas.length,
    citas: citas,
    formato: "JSON" // Como pediste en la pizarra
  });
});

module.exports = app;