import pool from './db.js';

const initializeDatabase = async () => {
    try {
        console.log('Verificando la estructura de la base de datos...');

        // Script para crear las tablas
        const createTablesScript = `
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role_id INT,
                project_limit INT DEFAULT 5,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id)
            );
        `;

        // Script para insertar datos iniciales
        const insertInitialDataScript = `
            INSERT INTO roles (name) VALUES ('admin'), ('standard') ON CONFLICT (name) DO NOTHING;

            INSERT INTO users (name, email, password_hash, role_id)
            SELECT 'Roberto Stringnet', 'roberto@stringnet.pe', '$2a$12$K.F3fL2dG9p.J8s.eP7gAOlxYg8f7/ZcR6E5.P3nB5tG8iWqS7qUa', (SELECT id FROM roles WHERE name = 'admin')
            WHERE NOT EXISTS (
                SELECT 1 FROM users WHERE email = 'roberto@stringnet.pe'
            );
        `;

        const client = await pool.connect();
        try {
            await client.query(createTablesScript);
            await client.query(insertInitialDataScript);
            console.log('Base de datos verificada e inicializada correctamente.');
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        // Salir del proceso si la base de datos no se puede inicializar
        process.exit(1);
    }
};

export default initializeDatabase;