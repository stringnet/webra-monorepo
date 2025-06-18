// api/src/routes/upload.routes.js
import { Router } from 'express';
import { getUploadSignature } from '../controllers/upload.controller.js';

const router = Router();

// @route   GET /api/upload/signature
// @desc    Obtener una firma para subir archivos a Cloudinary
router.get('/signature', getUploadSignature);

export default router;