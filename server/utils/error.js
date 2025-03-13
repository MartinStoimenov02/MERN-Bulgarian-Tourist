export const errorHandler = (statusCode, message) => {
    const error = new Error(message);
    error.StatusCode = statusCode;
    error.message = message;
    return error;
};