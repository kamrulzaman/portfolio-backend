// auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-2026';

module.exports = {
    // Verify JWT token
    authenticate: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'No token provided' 
            });
        }
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Token expired' 
                });
            }
            return res.status(403).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }
    },

    // Check if user has required role
    authorize: (roles = []) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Unauthorized' 
                });
            }
            
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Insufficient permissions' 
                });
            }
            
            next();
        };
    },

    // Generate JWT token
    generateToken: (user) => {
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                name: user.name 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
};