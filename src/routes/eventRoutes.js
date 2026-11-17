const express = require('express');
const router = express.Router();
const { getEventsController, getEventByIdController, createEventController, updateEventController, deleteEventController, registerEventController, unregisterEventController } = require('../controllers/eventController');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', getEventsController);
router.get('/:id', getEventByIdController);
router.post('/', authMiddleware, roleMiddleware, createEventController);
router.put('/:id', authMiddleware, roleMiddleware, updateEventController);
router.delete('/:id', authMiddleware, roleMiddleware, deleteEventController);
router.post('/:eventId/register', authMiddleware, registerEventController);
router.delete('/:eventId/unregister', authMiddleware, unregisterEventController);
module.exports = router;