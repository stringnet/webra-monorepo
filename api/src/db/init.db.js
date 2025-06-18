import pool from './db.js';

const initializeDatabase = async () => {
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

    const insertInitialDataScript = `
        INSERT INTO roles (name) VALUES ('admin'), ('standard') ON CONFLICT (name) DO NOTHING;
        INSERT INTO users (name, email, password_hash, role_id)
        SELECT 'Roberto Stringnet', 'roberto@stringnet.pe', '$2a$12$K.F3fL2dG9p.J8s.eP7gAOlxYg8f7/ZcR6E5.P3nB5tG8iWqS7qUa', (SELECT id FROM roles WHERE name = 'admin')
        WHERE NOT EXISTS (
            SELECT 1 FROM users WHERE email = 'roberto@stringnet.pe'
        );
    `;

    // La función 'async' propagará automáticamente cualquier error
    // como una promesa rechazada, que podemos capturar en index.js.
    const client = await pool.connect();
    try {
        console.log('Ejecutando script de creación de tablas...');
        await client.query(createTablesScript);
        console.log('Ejecutando script de inserción de datos...');
        await client.query(insertInitialDataScript);
    } finally {
        // Aseguramos que el cliente siempre se libere.
        client.release();
    }
};

export default initializeDatabase;