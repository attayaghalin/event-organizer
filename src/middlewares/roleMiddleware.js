const { AppError } = require("../utils/AppError");

const roleMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(AppError('Forbidden', 403));
    }
    next();
};

module.exports = { roleMiddleware };