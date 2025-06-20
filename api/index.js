// api/index.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import publicRoutes from './src/routes/public.routes.js';
import userRoutes from './src/routes/user.routes.js'; // <-- Importar
import authMiddleware from './src/middleware/auth.middleware.js';
import initializeDatabase from './src/db/init.db.js';
import adminMiddleware from './src/middleware/admin.middleware.js'; // <-- Importar

let isDbReady = false;
const app = express();
const PORT = process.env.PORT || 80;

// --- Middlewares ---
// Habilitamos CORS para todos los orígenes. Esto es esencial
// para que el visualizador público pueda acceder a esta API.
app.use(cors()); // <-- ESTA ES LA CONFIGURACIÓN CORRECTA Y SIMPLE

app.use(express.json());
const checkDbReadiness = (req, res, next) => {
    if (isDbReady) return next();
    res.status(503).json({ message: 'Servicio no disponible, la base de datos no está lista.' });
};

// --- Rutas ---
app.get('/', (req, res) => res.status(200).json({ message: 'API de WebRA funcionando!' }));
app.get('/health', (req, res) => {
    if (isDbReady) {
        res.status(200).json({ status: 'ok', message: 'La API está saludable.' });
    } else {
        res.status(503).json({ status: 'error', message: 'La API está iniciándose.' });
    }
});

// Rutas públicas (no requieren token)
app.use('/api/public', checkDbReadiness, publicRoutes);
app.use('/api/auth', checkDbReadiness, authRoutes);

// Rutas protegidas (requieren token)
app.use('/api/projects', checkDbReadiness, authMiddleware, projectRoutes);
app.use('/api/upload', checkDbReadiness, authMiddleware, uploadRoutes);

// Rutas protegidas solo para administradores
app.use('/api/users', checkDbReadiness, authMiddleware, adminMiddleware, userRoutes); // <-- NUEVA LÍNEA


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    initializeDatabase()
        .then(() => {
            isDbReady = true;
            console.log('API completamente operativa.');
        })
        .catch(err => {
            console.error('Error fatal durante la inicialización de la BD.', err.message);
        });
});