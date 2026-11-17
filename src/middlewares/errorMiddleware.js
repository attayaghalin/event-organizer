const { errorResponse } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Invalid Token';
    }

    return errorResponse(res, statusCode, message);
}

module.exports = {
    errorMiddleware
}