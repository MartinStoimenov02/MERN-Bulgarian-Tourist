import FeedbackModel from '../models/feedback.model.js';
import mongoose from 'mongoose';
import logError from '../utils/logger.js';

export const createFeedback = async (req, res, next) => {
    const { userId, feedbackType, message, rating } = req.body;

    try {
        const newFeedback = new FeedbackModel({
            user: userId, // user._id е ID-то на потребителя, който изпраща обратната връзка
            feedbackType,
            message,
            rating,
        });

        await newFeedback.save();

        res.status(201).json({
            success: true,
            message: 'Обратната връзка е успешно записана!',
        });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'feedback.controller', functionName: 'createFeedback', user: req.body.userId });
        console.error("Error creating feedback:", err);
        res.status(500).json({
            success: false,
            message: 'Грешка при записването на обратната връзка!',
        });
    }
};
