// api/src/middleware/admin.middleware.js
const adminMiddleware = (req, res, next) => {
    // req.user es establecido por el auth.middleware que se ejecuta antes
    if (req.user && req.user.role === 'admin') {
        next(); // El usuario es admin, puede continuar
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

export default adminMiddleware;
