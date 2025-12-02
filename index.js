// Importamos las librerías requeridas
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // ✅ Importar CORS

const app = express();
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Conexión a la base de datos SQLite
const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Conectado a la base de datos SQLite.');
    }
});

// Crear tabla "todos" si no existe
db.run(
    `CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) {
            console.error('❌ Error al crear la tabla:', err.message);
            process.exit(1);
        } else {
            console.log('📌 Tabla "todos" creada o ya existente.');
        }
    }
);

// Endpoint para agregar un TODO
app.post('/insert', (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({ error: 'Falta información necesaria: campo "todo"' });
    }

    db.run(
        `INSERT INTO todos (todo) VALUES (?)`,
        [todo],
        function (err) {
            if (err) {
                console.error('❌ Error al insertar:', err.message);
                return res.status(500).json({ error: 'Error interno al guardar el TODO' });
            }

            res.status(201).json({
                message: '✅ Todo agregado correctamente',
                id: this.lastID,
                todo,
                created_at: new Date().toISOString()
            });
        }
    );
});

// Endpoint raíz de prueba
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// ✅ Endpoint para listar todos los TODOs usando SELECT
app.get('/todos', (req, res) => {
    db.all(`SELECT id, todo, created_at FROM todos ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            console.error('❌ Error al consultar todos:', err.message);
            return res.status(500).json({ error: 'Error interno al consultar la base de datos' });
        }
        res.status(200).json({ todos: rows });
    });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Aplicación corriendo en http://localhost:${PORT}`);
});
