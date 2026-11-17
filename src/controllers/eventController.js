const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, registerEvent, unregisterEvent } = require('../services/eventService');
const { AppError } = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const getEventsController = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, available } = req.query;
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.max(1, Number(limit) || 10);
        const availableFilter = available === 'true';
        const { events, totalEvents } = await getEvents({ page: pageNumber, limit: limitNumber, search, available: availableFilter });
        const totalPages = Math.ceil(totalEvents / limitNumber);
        return successResponse(res, 200, 'Events retrieved successfully', { events, totalEvents, totalPages });
    } 
    
    catch (error) {
        next(error);
    }
}

const getEventByIdController = async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const parsedId = Number(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new AppError('Invalid event ID', 400);
        }
        const event = await getEventById(parsedId);
        return successResponse(res, 200, 'Event retrieved successfully', event);
    } catch (error) {
        next(error);
    }
}

const createEventController = async (req, res, next) => {

    try {
        const { title, description, date, quota, location } = req.body;
        if (!title || !description || !date || quota === undefined || quota === null || quota === '' || !location) {
            throw new AppError('All fields are required', 400);
        }

        if (isNaN(Number(quota)) || Number(quota) < 0) {
            throw new AppError('Invalid input', 400);
        }

        if (isNaN(new Date(date).getTime())) {
            throw new AppError('Invalid input', 400);
        }
        const newEvent = await createEvent({ title, description, date, quota, location });
        return successResponse(res, 201, 'Event created successfully', newEvent);

    } catch (error) {
        next(error);
    }
}

const updateEventController = async (req, res, next) => {
    
    try {
        const { id } = req.params;
        const { title, description, date, quota, location } = req.body;

        const parsedId = Number(id);

        if (isNaN(parsedId) || parsedId <= 0) {
            throw new AppError('Invalid event ID', 400);
        }

        if (quota !== undefined && (isNaN(Number(quota)) || Number(quota) < 0)) {
            throw new AppError('Invalid input', 400);
        }

        if (date !== undefined && isNaN(new Date(date).getTime())) {
            throw new AppError('Invalid input', 400);
        }

        const updatedEvent = await updateEvent(parsedId, { title, description, date, quota, location });
        return successResponse(res, 200, 'Event updated successfully', updatedEvent);
    } catch (error) {
        next(error);
    }
}

const deleteEventController = async (req, res, next) => {

    try {
        const { id } = req.params;
        const parsedId = Number(id);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new AppError('Invalid event ID', 400);
        }
        const deletedEvent = await deleteEvent(parsedId);
        return successResponse(res, 200, 'Event deleted successfully', deletedEvent);
    } catch (error) {
        next(error);
    }
}

const registerEventController = async (req, res, next) => {

    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const parsedEventId = Number(eventId);

        if(isNaN(parsedEventId) || parsedEventId <= 0) {
            throw new AppError('Invalid event ID', 400);
        }
        const registration = await registerEvent({ userId, eventId: parsedEventId });
        return successResponse(res, 201, 'User registered for event successfully', registration);
    } catch (error) {
        next(error);
    }
}

const unregisterEventController = async (req, res, next) => {

    try {
        const { eventId } = req.params;
        const userId = req.user.id;
        const parsedEventId = Number(eventId);

        if(isNaN(parsedEventId) || parsedEventId <= 0) {
            throw new AppError('Invalid event ID', 400);
        }
        const unregistration = await unregisterEvent({ userId,  eventId: parsedEventId });
        return successResponse(res, 200, 'User unregistered for event successfully', unregistration);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEventsController,
    getEventByIdController,
    createEventController,
    updateEventController,
    deleteEventController, 
    registerEventController,
    unregisterEventController
};