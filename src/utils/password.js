const bcrypt = require('bcryptjs');

// 1. Fungsi Hash Password (Register)
const hashPassword = async (password) => {
    const saltrounds = 10;
    const hashedPassowrd = await bcrypt.hash(password, saltrounds);
    return hashedPassowrd;
} 

// 2. Fungsi Compare Password (Login)
const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

module.exports = {
    hashPassword,
    comparePassword
};