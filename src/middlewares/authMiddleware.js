const { AppError } = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Unauthorized', 401);
        }

        const token = authHeader.split(' ')[1];


        const decoded = verifyToken(token);
        req.user = decoded;
        next();

    } catch (error) {
        next(error);
    }
}

module.exports = {authMiddleware};