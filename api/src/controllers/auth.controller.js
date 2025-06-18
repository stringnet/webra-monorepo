import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Intento de login para el email: ${email}`); // Log de inicio

    if (!email || !password) {
        return res.status(400).json({ message: 'El correo y la contraseña son requeridos.' });
    }

    try {
        const userQuery = 'SELECT u.id, u.name, u.email, u.password_hash, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            console.log(`Login fallido: Usuario con email '${email}' no encontrado en la base de datos.`);
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = userResult.rows[0];
        // Log para ver qué se recupera de la BD
        console.log('Usuario encontrado en la BD:', JSON.stringify(user));
        console.log('Hash almacenado en la BD:', user.password_hash);
        console.log('Longitud del hash de la BD:', user.password_hash.length);

        // Comparar la contraseña proporcionada con el hash almacenado
        console.log('Comparando contraseñas...');
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Resultado de la comparación de contraseñas (isMatch):', isMatch);

        if (!isMatch) {
            console.log(`Login fallido: La contraseña no coincide para el usuario '${email}'.`);
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        console.log(`Login exitoso para '${email}'. Creando token JWT...`);
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                console.log('Token JWT creado y enviado exitosamente.');
                res.status(200).json({ token });
            }
        );

    } catch (error) {
        console.error('Error del servidor durante el proceso de login:', error.message);
        res.status(500).send('Error del servidor');
    }
};