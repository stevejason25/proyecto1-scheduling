const request = require('supertest');
const app = require('../app');

beforeEach(() => {
    app._resetCitas();
});

describe('GET /citas', () => {
    test('debe retornar un array vacío cuando no hay citas', async () => {
        const res = await request(app).get('/citas');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('debe retornar todas las citas existentes', async () => {

        await request(app).post('/citas').send({
            titulo: 'Cita 1',
            fecha: '2026-04-01',
            hora: '10:00'
        });
        await request(app).post('/citas').send({
            titulo: 'Cita 2',
            fecha: '2026-04-02',
            hora: '14:00'
        });

        const res = await request(app).get('/citas');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
    });
});

describe('GET /citas/:id', () => {
    test('debe retornar una cita por su ID', async () => {
        const created = await request(app).post('/citas').send({
            titulo: 'Mi cita',
            fecha: '2026-04-01',
            hora: '09:00',
            descripcion: 'Consulta médica'
        });

        const res = await request(app).get(`/citas/${created.body.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.titulo).toBe('Mi cita');
        expect(res.body.descripcion).toBe('Consulta médica');
    });

    test('debe retornar 404 si la cita no existe', async () => {
        const res = await request(app).get('/citas/999');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Cita no encontrada');
    });
});

describe('POST /citas', () => {
    test('debe crear una nueva cita correctamente', async () => {
        const res = await request(app).post('/citas').send({
            titulo: 'Reunión',
            fecha: '2026-05-10',
            hora: '15:30',
            descripcion: 'Reunión de equipo'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.titulo).toBe('Reunión');
        expect(res.body.fecha).toBe('2026-05-10');
        expect(res.body.hora).toBe('15:30');
        expect(res.body.descripcion).toBe('Reunión de equipo');
        expect(res.body).toHaveProperty('createdAt');
    });

    test('debe crear una cita sin descripción (campo opcional)', async () => {
        const res = await request(app).post('/citas').send({
            titulo: 'Cita rápida',
            fecha: '2026-05-11',
            hora: '08:00'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.descripcion).toBe('');
    });

    test('debe retornar 400 si falta el titulo', async () => {
        const res = await request(app).post('/citas').send({
            fecha: '2026-05-10',
            hora: '15:30'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Titulo, fecha y hora son requeridos');
    });

    test('debe retornar 400 si falta la fecha', async () => {
        const res = await request(app).post('/citas').send({
            titulo: 'Reunión',
            hora: '15:30'
        });

        expect(res.statusCode).toBe(400);
    });

    test('debe retornar 400 si falta la hora', async () => {
        const res = await request(app).post('/citas').send({
            titulo: 'Reunión',
            fecha: '2026-05-10'
        });

        expect(res.statusCode).toBe(400);
    });

    test('debe retornar 400 si el body está vacío', async () => {
        const res = await request(app).post('/citas').send({});
        expect(res.statusCode).toBe(400);
    });
});

describe('PUT /citas/:id', () => {
    test('debe actualizar una cita existente', async () => {
        const created = await request(app).post('/citas').send({
            titulo: 'Cita original',
            fecha: '2026-06-01',
            hora: '10:00',
            descripcion: 'Descripción original'
        });

        const res = await request(app).put(`/citas/${created.body.id}`).send({
            titulo: 'Cita actualizada',
            fecha: '2026-06-15',
            hora: '11:00',
            descripcion: 'Descripción actualizada'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.titulo).toBe('Cita actualizada');
        expect(res.body.fecha).toBe('2026-06-15');
        expect(res.body.hora).toBe('11:00');
        expect(res.body.descripcion).toBe('Descripción actualizada');
    });

    test('debe retornar 404 al actualizar una cita que no existe', async () => {
        const res = await request(app).put('/citas/999').send({
            titulo: 'Cita inexistente',
            fecha: '2026-06-01',
            hora: '10:00'
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Cita no encontrada');
    });

    test('debe retornar 400 si faltan campos requeridos al actualizar', async () => {
        const created = await request(app).post('/citas').send({
            titulo: 'Cita',
            fecha: '2026-06-01',
            hora: '10:00'
        });

        const res = await request(app).put(`/citas/${created.body.id}`).send({
            titulo: 'Solo titulo'
        });

        expect(res.statusCode).toBe(400);
    });
});

describe('DELETE /citas/:id', () => {
    test('debe eliminar una cita existente', async () => {
        const created = await request(app).post('/citas').send({
            titulo: 'Cita a eliminar',
            fecha: '2026-07-01',
            hora: '12:00'
        });

        const res = await request(app).delete(`/citas/${created.body.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Cita eliminada');
        expect(res.body.cita.titulo).toBe('Cita a eliminar');


        const check = await request(app).get(`/citas/${created.body.id}`);
        expect(check.statusCode).toBe(404);
    });

    test('debe retornar 404 al eliminar una cita que no existe', async () => {
        const res = await request(app).delete('/citas/999');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Cita no encontrada');
    });
});