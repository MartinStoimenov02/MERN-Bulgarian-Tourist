import LogModel from '../models/log.model.js';
import logError from '../utils/logger.js';

export const getAllLogs = async (req, res) => {
    try {
        const logsList = await LogModel.find()
            .populate('user', 'email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, logs: logsList });
    } catch (err) {
        next(err);
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'getAllLogs' });
        res.status(500).json({ success: false, message: 'Грешка при зареждането на логовете' });
    }
};

export const deleteLogById = async (req, res) => {
    try {
        await LogModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Логът е изтрит' });
    } catch (err) {
        next(err);
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'deleteLogById' });
        res.status(500).json({ success: false, message: 'Грешка при изтриване на лог' });
    }
};

export const deleteMultipleLogs = async (req, res) => {
    const { ids } = req.body;
    try {
        await LogModel.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ success: true, message: 'Избраните логове са изтрити' });
    } catch (err) {
        next(err);
        console.error(err);
        logError(err, req, { className: 'logs.controller', functionName: 'deleteMultipleLogs' });
        res.status(500).json({ success: false, message: 'Грешка при групово изтриване на логовете' });
    }
};
