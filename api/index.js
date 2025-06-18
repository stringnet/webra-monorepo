import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import initializeDatabase from './src/db/init.db.js';

// --- Estado de preparación de la aplicación ---
let isDbReady = false;

const app = express();
const PORT = process.env.PORT || 80;

// --- Middlewares ---
app.use(cors({ origin: 'https://adminwebra.scanmee.io' }));
app.use(express.json());

const checkDbReadiness = (req, res, next) => {
    if (isDbReady) return next();
    res.status(503).json({ message: 'Servicio no disponible, la base de datos no está lista.' });
};

// --- Rutas ---
app.get('/', (req, res) => res.status(200).json({ message: 'API de WebRA funcionando!' }));

// Ruta de chequeo de salud
app.get('/health', (req, res) => {
    if (isDbReady) {
        // Si la BD está lista, responde 200 OK.
        res.status(200).json({ status: 'ok', message: 'La API está saludable.' });
    } else {
        // Si la BD no está lista, responde 503 Service Unavailable.
        res.status(503).json({ status: 'error', message: 'La API está iniciándose, la base de datos aún no está lista.' });
    }
});

app.use('/api/auth', checkDbReadiness, authRoutes); // Protegemos solo las rutas de la API

// --- Arranque del Servidor e Inicialización de la BD ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('El servidor está en línea. Iniciando conexión con la base de datos en segundo plano...');

    initializeDatabase()
        .then(() => {
            isDbReady = true;
            console.log('Conexión con la base de datos exitosa. La API está completamente operativa.');
        })
        .catch(err => {
            console.error('Error fatal durante la inicialización de la base de datos. La API no será funcional.', err.message);
        });
});