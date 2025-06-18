// api/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Obtener el token de la cabecera de autorización
    const authHeader = req.header('Authorization');

    // Verificar si no hay cabecera de autorización
    if (!authHeader) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }

    // Verificar que el token tenga el formato "Bearer <token>"
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token inválido. Se esperaba "Bearer <token>".' });
    }

    const token = tokenParts[1];

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar el payload del usuario a la petición
        req.user = decoded.user;
        next(); // Pasar al siguiente middleware o controlador
    } catch (error) {
        res.status(401).json({ message: 'El token no es válido.' });
    }
};

export default authMiddleware;