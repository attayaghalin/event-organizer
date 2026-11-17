const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 1. 

const generateToken = (user) => {
    const token =  jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h',
        }
    );
    return token;
}

// 2.

const verifyToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}

module.exports = {
    generateToken,
    verifyToken,
};