import pool from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'El correo y la contraseña son requeridos.' });
    }

    try {
        const userResult = await pool.query(
            'SELECT u.id, u.name, u.email, u.password_hash, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const payload = { user: { id: user.id, name: user.name, role: user.role } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};