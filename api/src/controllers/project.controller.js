// api/src/controllers/project.controller.js
import pool from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

// Obtener todos los proyectos del usuario autenticado
export const getProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await pool.query('SELECT * FROM ar_projects WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.status(200).json(projects.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Crear un nuevo proyecto (VERSIÓN CORREGIDA)
export const createProject = async (req, res) => {
    const { name, asset_type, model_url, marker_type, marker_url, model_public_id, marker_public_id, chroma_key_color } = req.body;
    const userId = req.user.id;

    if (marker_type === 'image' && !marker_url) {
        return res.status(400).json({ message: 'Para marcadores de tipo imagen, la URL del marcador es requerida.' });
    }
    if (!name || !model_url || !marker_type) {
        return res.status(400).json({ message: 'Nombre, modelo y tipo de marcador son requeridos.' });
    }

    try {
        const userDetailsResult = await pool.query(
            `SELECT u.project_limit, COUNT(p.id) as project_count 
             FROM users u 
             LEFT JOIN ar_projects p ON u.id = p.user_id 
             WHERE u.id = $1 
             GROUP BY u.id`,
            [userId]
        );

        if (userDetailsResult.rows.length === 0) {
             return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const { project_limit, project_count } = userDetailsResult.rows[0];

        if (parseInt(project_count, 10) >= project_limit) {
            return res.status(403).json({ message: `Límite de proyectos alcanzado. No puedes crear más de ${project_limit} proyectos.` });
        }

        const projectId = uuidv4();
        const view_url = `https://webar.scanmee.io/view/${projectId}`;

        // CORRECCIÓN: La consulta SQL ahora tiene el número correcto de columnas y valores.
        const newProject = await pool.query(
            'INSERT INTO ar_projects (id, user_id, name, asset_type, model_url, marker_type, marker_url, view_url, model_public_id, marker_public_id, chroma_key_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [projectId, userId, name, asset_type || 'model', model_url, marker_type, marker_url, view_url, model_public_id, marker_public_id, chroma_key_color]
        );

        res.status(201).json(newProject.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar un proyecto
export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    try {
        const updatedProject = await pool.query(
            'UPDATE ar_projects SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [name, id, userId]
        );

        if (updatedProject.rows.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado o no tienes permiso para editarlo.' });
        }
        res.status(200).json(updatedProject.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Eliminar un proyecto
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const projectData = await pool.query(
            'SELECT model_public_id, marker_public_id, asset_type FROM ar_projects WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (projectData.rows.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado o no tienes permiso para eliminarlo.' });
        }

        await pool.query('DELETE FROM ar_projects WHERE id = $1 AND user_id = $2', [id, userId]);

        const { model_public_id, marker_public_id, asset_type } = projectData.rows[0];

        // Especificar resource_type al eliminar de Cloudinary
        const resource_type = asset_type === 'video' ? 'video' : 'raw';
        if (model_public_id) {
            await cloudinary.uploader.destroy(model_public_id, { resource_type });
        }
        if (marker_public_id) {
            await cloudinary.uploader.destroy(marker_public_id);
        }

        res.status(200).json({ message: 'Proyecto eliminado exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

