// api/src/routes/public.routes.js
import { Router } from 'express';
import { getPublicProject } from '../controllers/public.controller.js';

const router = Router();

// @route   GET /api/public/projects/:projectId
// @desc    Obtener los datos públicos de un proyecto por su ID
router.get('/projects/:projectId', getPublicProject);

export default router;