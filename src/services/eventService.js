const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getEvents = async ({page, limit, search, available}) => {
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
        where.OR = [
                {title: { contains: search, mode: 'insensitive' }},
                {description: { contains: search, mode: 'insensitive' }}
            ]
        }

    if (available) {
        where.quota = { gt: 0 };
    }

    const events = await prisma.event.findMany({
        where: where,
        skip: skip,
        take: limit
    })

    const totalEvents = await prisma.event.count({ where: where });

    return { events, totalEvents };
}

const getEventById = async (id) => {
    const event = await prisma.event.findUnique({
        where: { id: id }
    });

    if (!event) {
        throw new Error('Event not found');
    }

    return event;
}

const createEvent = async (eventData) => {
    const parsedDate = new Date(eventData.date);
    const parsedQuota = Number(eventData.quota);
    const newEvent = await prisma.event.create({
        data: {
            title: eventData.title,
            description: eventData.description,
            date: parsedDate,
            quota: parsedQuota,
            location: eventData.location
        }
    });

    return newEvent;
}

const updateEvent = async (id, eventData) => {
    await getEventById(id); 
    const dataToUpdate = {};
    if (eventData.title !== undefined) {
        dataToUpdate.title = eventData.title;
    }
    if (eventData.description !== undefined) {
        dataToUpdate.description = eventData.description;
    }
    if (eventData.date !== undefined) {
        dataToUpdate.date = new Date(eventData.date);
    }
    if (eventData.quota !== undefined) {
        dataToUpdate.quota = Number(eventData.quota);
    }
    if (eventData.location !== undefined) {
        dataToUpdate.location = eventData.location;
    }

    const updatedEvent = await prisma.event.update({
        where: { id: id },
        data: dataToUpdate
    });

    return updatedEvent;
}

const deleteEvent = async (id) => {
    await getEventById(id); 
    const deletedEvent = await prisma.event.delete({
        where: { id: id }
    });
    return deletedEvent;
}

const registerEvent = async ({ userId, eventId }) => {
     return await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if(!event) {
            throw new Error('Event not found');
        }

        if(event.quota <= 0) {
            throw new Error('Event is full');
        }

        if(await tx.registration.findUnique({ where: { userId_eventId: { userId, eventId } } })) {
            throw new Error('User already registered for this event');
        }

        const eventRegistration = await tx.registration.create({
            data: {
                userId: userId,
                eventId: eventId
            }
        });

        await tx.event.update({
            where: { id: eventId },
            data: { quota: { decrement: 1 } }
        })

        return eventRegistration;
    })
}

const unregisterEvent = async ({ userId, eventId }) => {
     return await prisma.$transaction(async (tx) => {
        if( !(await tx.registration.findUnique({ where: { userId_eventId: { userId, eventId } } }))) {
            throw new Error('User is not registered for this event');
        }

        const eventUnregistration = await tx.registration.delete({
            where: { userId_eventId: { userId, eventId } }
        })

        await tx.event.update({
            where: { id: eventId },
            data: { quota: { increment: 1 } }
        })

        return eventUnregistration;
    })
}

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerEvent,
    unregisterEvent
};