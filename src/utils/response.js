const successResponse = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message: message
    }

    if(data !== null) {
        response.data = data
    }

    return res.status(statusCode).json(response);

}

const errorResponse = (res, statusCode, message) => {
    const response = {
        success: false,
        message: message
    }

    return res.status(statusCode).json(response);
}

module.exports = {
    successResponse,
    errorResponse
}