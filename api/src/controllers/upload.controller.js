// api/src/controllers/upload.controller.js
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const getUploadSignature = (req, res) => {
    // Obtenemos el timestamp actual en segundos
    const timestamp = Math.round((new Date).getTime()/1000);

    try {
        // Generamos la firma usando el timestamp y nuestro API Secret
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp,
            },
            process.env.CLOUDINARY_API_SECRET
        );

        // Devolvemos la firma y el timestamp al frontend
        res.status(200).json({ signature, timestamp });
    } catch (error) {
        console.error("Error al generar la firma de Cloudinary:", error);
        res.status(500).json({ message: 'Error al generar la firma para la subida.' });
    }
};