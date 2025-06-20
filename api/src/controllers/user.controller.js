// api/src/controllers/user.controller.js
import pool from '../db/db.js';
import bcrypt from 'bcryptjs';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        // Excluimos al propio administrador de la lista
        const users = await pool.query(
            "SELECT u.id, u.name, u.email, u.project_limit, u.is_active, u.created_at, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email != $1 ORDER BY u.created_at DESC",
            [req.user.email] 
        );
        res.status(200).json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    const { name, email, password, project_limit } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
    }

    try {
        let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe.' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password_hash, role_id, project_limit) VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'standard'), $4) RETURNING id, name, email, project_limit, is_active, created_at, (SELECT name FROM roles WHERE id = role_id) as role",
            [name, email, passwordHash, project_limit || 5]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar un usuario (por ahora, solo el límite de proyectos)
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { project_limit } = req.body;

    try {
        const updatedUser = await pool.query(
            'UPDATE users SET project_limit = $1 WHERE id = $2 RETURNING id, name, email, project_limit',
            [project_limit, id]
        );
        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteRes = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (deleteRes.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};