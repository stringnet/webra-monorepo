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

// --- Middleware de chequeo de preparación ---
// Se aplica a todas las rutas bajo /api. Si la BD no está lista,
// devuelve un error 503 (Servicio No Disponible).
const checkDbReadiness = (req, res, next) => {
    if (isDbReady) {
        return next();
    }
    res.status(503).json({ 
        message: 'El servicio no está listo, por favor inténtelo de nuevo en un momento.' 
    });
};

// --- Rutas ---
app.get('/', (req, res) => res.status(200).json({ message: 'API de WebRA funcionando!' }));
app.use('/api', checkDbReadiness, authRoutes); // Aplicamos el middleware antes de las rutas

// --- Arranque del Servidor e Inicialización de la BD ---
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('El servidor está en línea. Iniciando conexión con la base de datos en segundo plano...');

    // Ahora que el servidor está escuchando, inicializamos la base de datos.
    initializeDatabase()
        .then(() => {
            isDbReady = true; // Cambiamos el estado a "listo"
            console.log('Conexión con la base de datos exitosa. La API está completamente operativa.');
        })
        .catch(err => {
            console.error('Error fatal durante la inicialización de la base de datos. La API no será funcional.', err.message);
            // El servidor seguirá corriendo, pero isDbReady será falso.
            // Las peticiones a /api devolverán un error 503.
        });
});