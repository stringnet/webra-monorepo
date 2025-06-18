// api/src/db/init.db.js
import pool from './db.js';
import bcrypt from 'bcryptjs';

const initializeDatabase = async () => {
    const client = await pool.connect();
    try {
        console.log('Verificando la estructura de la base de datos...');

        const createTablesScript = `
            CREATE TABLE IF NOT EXISTS roles (id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL);

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role_id INT REFERENCES roles(id),
                project_limit INT DEFAULT 5,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- NUEVA TABLA DE PROYECTOS --
            CREATE TABLE IF NOT EXISTS ar_projects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(150) NOT NULL,
                model_url VARCHAR(255) NOT NULL,
                video_url VARCHAR(255),
                marker_type VARCHAR(50) NOT NULL,
                marker_url VARCHAR(255) NOT NULL,
                view_url VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;
        await client.query(createTablesScript);

        // ... (el resto del código para insertar roles y usuarios se mantiene igual)
        await client.query("INSERT INTO roles (name) VALUES ('admin'), ('standard') ON CONFLICT (name) DO NOTHING;");
        const adminEmail = 'roberto@stringnet.pe';
        const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        if (userCheck.rows.length === 0) {
            console.log(`Usuario administrador '${adminEmail}' no encontrado. Creándolo ahora...`);
            const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
            if (!adminPassword) throw new Error('La variable de entorno ADMIN_DEFAULT_PASSWORD no está definida.');
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(adminPassword, salt);
            const insertAdminScript = `INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'admin'))`;
            await client.query(insertAdminScript, ['Roberto Stringnet', adminEmail, passwordHash]);
            console.log(`Usuario administrador '${adminEmail}' creado exitosamente.`);
        } else {
            console.log(`El usuario administrador '${adminEmail}' ya existe.`);
        }

    } finally {
        client.release();
    }
};

export default initializeDatabase;