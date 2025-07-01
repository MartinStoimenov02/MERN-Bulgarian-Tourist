import LogModel from '../models/log.model.js';

const logError = async (error, req = null, customInfo = {}) => {
    try {
        const logData = {
            errorStatus: error.status || '500',
            errorMessage: error.message || 'Unknown error',
            stackTrace: error.stack || 'No stack trace',
            className: customInfo.className || 'Unknown',
            functionName: customInfo.functionName || 'Unknown',
            requestData: req ? { body: req.body, params: req.params, query: req.query } : null,
            user: customInfo.user,
        };

        await LogModel.create(logData);
    } catch (logError) {
        console.error('Failed to save log:', logError);
        throw new error(err);
    }
};

export default logError;
