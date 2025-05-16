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

export const getAllFeedback = async (req, res) => {
    try {
      const feedbackList = await FeedbackModel.find()
        .populate('user', 'email') // само email от user
        .sort({ createdAt: 1 }); // по-новите най-отгоре
  
      res.status(200).json({ success: true, feedback: feedbackList });
    } catch (err) {
        console.error(err);
      logError(err, req, { className: 'feedback.controller', functionName: 'getAllFeedback' });
      res.status(500).json({ success: false, message: 'Грешка при зареждането на обратната връзка' });
    }
  };
  
  export const deleteFeedbackById = async (req, res) => {
    try {
      await FeedbackModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, message: 'Обратната връзка е изтрита' });
    } catch (err) {
        console.error(err);
      logError(err, req, { className: 'feedback.controller', functionName: 'deleteFeedbackById' });
      res.status(500).json({ success: false, message: 'Грешка при изтриване' });
    }
  };
  
  export const deleteMultipleFeedback = async (req, res) => {
    const { ids } = req.body; // масив от ID-та
    try {
      await FeedbackModel.deleteMany({ _id: { $in: ids } });
      res.status(200).json({ success: true, message: 'Избраните записи са изтрити' });
    } catch (err) {
        console.error(err);
      logError(err, req, { className: 'feedback.controller', functionName: 'deleteMultipleFeedback' });
      res.status(500).json({ success: false, message: 'Грешка при групово изтриване' });
    }
  };
  
