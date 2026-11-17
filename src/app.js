const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { AppError } = require('./utils/AppError');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use((req, res, next) => {
    next(new AppError('Page not found', 404));
})

app.use(errorMiddleware);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})