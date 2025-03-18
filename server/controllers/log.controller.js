import LogModel from '../models/log.model.js';
import mongoose from 'mongoose';

export const createLog = async (req, res, next) => {
    console.log("write log 1!");

    //const { user, feedbackType, message, rating } = req.body;

    try {
        // const newLog = new LogModel({
        //     userEmail: user.email, // user._id е ID-то на потребителя, който изпраща обратната връзка
        //     feedbackType,
        //     message,
        //     rating,
        // });

        // await newLog.save();
        console.log("write log!");

    } catch (err) {
        next(err);
        console.error("Error creating log:", err);
    }
};
