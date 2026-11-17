const { registerService, loginService } = require('../services/authService');
const { AppError } = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const registerController = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            throw new AppError('All fields required', 400);
        }

        const newUser = await registerService({ name, email, password });
        return successResponse(res, 201, 'User registered successfully', newUser)
    } catch (error) {
        next(error);
    }
}

const loginController = async (req, res, next) => {
    

    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            throw new AppError('All fields required', 400);
        }

        const { token, user } = await loginService({ email, password });
        return successResponse(res, 200, 'Login successful', { token, user });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    registerController,
    loginController
};