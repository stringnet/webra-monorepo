import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

// Crear una instancia de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuración de Middlewares ---
// Habilitar CORS para permitir peticiones desde nuestro frontend
app.use(cors({
    origin: 'https://adminwebra.scanmee.io' // El dominio de tu panel de admin
}));

// Middleware para parsear JSON en las peticiones
app.use(express.json());


// --- Conexión a la Base de Datos (PostgreSQL) ---
// Usamos la variable de entorno DATABASE_URL que nos dará Easypanel
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

// --- Rutas de la API ---
// Ruta de prueba para verificar que la API está viva
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'API de WebRA funcionando correctamente!',
        status: 'ok'
    });
});

// Ruta para verificar la conexión a la base de datos
app.get('/db-test', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        res.status(200).json({
            message: 'Conexión a la base de datos exitosa',
            db_time: result.rows[0].now,
        });
        client.release();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).json({
            message: 'Error al conectar con la base de datos',
            error: error.message
        });
    }
});


// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});