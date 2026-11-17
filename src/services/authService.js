const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerService = async (userData) => {
    const isExist = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (isExist) {
        throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(userData.password);
    const newUser = await prisma.user.create({
        data:{
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
        }
    })

    return { id: newUser.id, name: newUser.name, email: newUser.email };
}

const loginService = async ({email, password}) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return {token, user:{id: user.id, name: user.name, email: user.email, role: user.role}};
}

module.exports = {
    registerService,
    loginService
};