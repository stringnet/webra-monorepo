// api/src/routes/project.routes.js
import { Router } from 'express';
import { getProjects, createProject } from '../controllers/project.controller.js';
// No necesitamos el middleware aquí porque lo aplicaremos a nivel global en index.js

const router = Router();

// @route   GET /api/projects
// @desc    Obtener todos los proyectos del usuario
router.get('/', getProjects);

// @route   POST /api/projects
// @desc    Crear un nuevo proyecto
router.post('/', createProject);
//Actualizar projectos
router.put('/:id', updateProject); // <-- NUEVA RUTA
//Borrar Proyectos
router.delete('/:id', deleteProject); // <-- NUEVA RUTA

export default router;