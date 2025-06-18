// api/src/controllers/project.controller.js
import pool from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';

// Obtener todos los proyectos del usuario autenticado
export const getProjects = async (req, res) => {
    try {
        // El 'req.user.id' viene del middleware de autenticación
        const userId = req.user.id;
        const projects = await pool.query('SELECT * FROM ar_projects WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.status(200).json(projects.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Crear un nuevo proyecto
export const createProject = async (req, res) => {
    const { name, model_url, marker_type, marker_url } = req.body;
    const userId = req.user.id;

    if (!name || !model_url || !marker_type || !marker_url) {
        return res.status(400).json({ message: 'Todos los campos requeridos deben ser proporcionados.' });
    }

    try {
        const projectId = uuidv4();
        // Generamos una URL de visualización única
        const view_url = `https://webar.scanmee.io/view/${projectId}`;

        const newProject = await pool.query(
            'INSERT INTO ar_projects (id, user_id, name, model_url, marker_type, marker_url, view_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [projectId, userId, name, model_url, marker_type, marker_url, view_url]
        );

        res.status(201).json(newProject.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};