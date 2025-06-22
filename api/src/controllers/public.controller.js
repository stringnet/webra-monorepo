// api/src/controllers/public.controller.js
import pool from '../db/db.js';

// Obtener los datos de un proyecto para la vista pública
export const getPublicProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await pool.query(
            //'SELECT name, model_url, marker_type, marker_url FROM ar_projects WHERE id = $1',
              'SELECT name, model_url, marker_type, marker_url, asset_type, chroma_key_color FROM ar_projects WHERE id = $1', // <-- Añadir chroma_key_color
            [projectId]
        );

        if (project.rows.length === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }

        res.status(200).json(project.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};