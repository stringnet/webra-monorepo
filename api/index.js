import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './src/routes/auth.routes.js';
import initializeDatabase from './src/db/init.db.js'; // Importar la función

const startServer = async () => {
    // 1. Inicializar la base de datos
    await initializeDatabase();

    // 2. Configurar y arrancar el servidor Express
    const app = express();
    const PORT = process.env.PORT || 80;

    // Middlewares
    app.use(cors({ origin: 'https://adminwebra.scanmee.io' }));
    app.use(express.json());

    // Rutas
    app.get('/', (req, res) => res.status(200).json({ message: 'API de WebRA funcionando!' }));
    app.use('/api/auth', authRoutes);

    // Iniciar servidor
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
};

// Ejecutar la función para iniciar el servidor
startServer();