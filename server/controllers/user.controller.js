import UserModel from '../models/user.model.js';
import crypto from "crypto";
import mongoose from "mongoose";
import logError from '../utils/logger.js';
import deleteUserAndRelatedData from '../utils/deleteUserAndRelatedData.js';

const hashPassword = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex");
};

export const checkUserExists = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (user) {
            return res.status(200).json({ success: true, exists: true });
        } else {
            return res.status(200).json({ success: true, exists: false });
        }
    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'checkUserExists', user: email });
        console.error("checkUserExists: ", err);
        return res.status(500).json({ success: false, message: "Грешка при проверката на имейла" });
    }
};


export const getUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = hashPassword(password);
        const user = await UserModel.findOne({ 
            email: email,
            password: hashedPassword
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Невалиден имейл адрес или парола!'
            });
        }

        user.lastLogin = new Date();
        await user.save();;
        
        res.json({
            success: true,
            message: "Успешно влизане!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                points: user.points,
                firstLogin: user.firstLogin,
                points: user.points,
                isGoogleAuth: user.isGoogleAuth,
                hasPassword: user.password!=undefined ? true : false,
                isAdmin: user.isAdmin
            }
        });

    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'getUser', user: email });
        console.error("error getting user: ", err);
        res.status(500).json({ success: false, message: "error getting use: " + err.message });
    }
};

export const validateUser = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction(); 

    try {
        const { name, email, password, phoneNumber } = req.body;
        const hashedPassword = hashPassword(password);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        await newUser.save({ session });
        await session.abortTransaction(); 
        res.status(200).json({ success: true, message: "Данните са валидни." });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'validateUser', user: req.body?.email });
        console.error("validateUser: ", err);
        await session.abortTransaction(); 
        res.status(500).json({ success: false, message: "Невалидни данни: " + err.message });
    } finally {
        session.endSession();
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const hashedPassword = hashPassword(password);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Регистрацията е успешна!'
        });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'createUser', user: email });
        console.error("createUser: ", err);
        return res.status(500).json({
            success: false,
            message: err.message + "!"
        });
    }
};

export const updatePoints = async (req, res, next) => {
    try {
        const { id, nto100 } = req.body;
        const addingPoints = nto100!=null ? 5 : 2;
        const user = await UserModel.findById( id );
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Потребителят не е намерен!"
            });
        }

        const totalPoints = user.points+addingPoints;
        user.points = totalPoints;
        
        await user.save();

        res.status(200).json({
            totalPoints: totalPoints,
            success: true,
            message: "Точките са добавени успешно!"
        });

    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'updatePoints', user: req.body.id });
        console.error("Error updating points:", err);
        res.status(500).json({
            success: false,
            message: "Грешка при добавяне на точките!"
        });
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Потребителят не е намерен!"
            });
        }
        const hashedPassword = hashPassword(password);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Паролата е успешно сменена!"
        });

    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'resetPassword', user: req.body.email });
        console.error("Error resetting password:", err);
        res.status(500).json({
            success: false,
            message: "Грешка при смяната на паролата!"
        });
    }
};

export const googleAuth = async (req, res, next) => {
    try {
        const { email, name, phoneNumber } = req.body.userData;

        let user = await UserModel.findOne({ email });

        if (!user) {
            user = new UserModel({
                name,
                email,
                isGoogleAuth: true
            });

            if (phoneNumber && phoneNumber.trim() !== "") {
                user.phoneNumber = phoneNumber;
            }

            await user.save();
        }

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Google login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || null,
                isGoogleAuth: user.isGoogleAuth,
                firstLogin: user.firstLogin,
                points: user.points,
                hasPassword: user.password!=undefined ? true : false,
                isAdmin: user.isAdmin
            }
        });

    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'googleAuth', user: email });
        console.error("Error in Google Auth:", err);
        res.status(500).json({
            success: false,
            message: "Google login error!"
        });
    }
};

export const updateField = async (req, res, next) => {
    const { id, field, newValue } = req.body;

    try {
      const user = await UserModel.findById( id );
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Потребителят не е намерен!"
        });
      }
  
      if (field === "password") {
        user.password = hashPassword(newValue);
      } else if (["name", "phoneNumber", "email", "firstLogin"].includes(field)) {
        user[field] = newValue;
      }
       else {
        return res.status(400).json({
          success: false,
          message: "Невалидно поле за обновяване."
        });
      }
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: `${field === "password" ? "Паролата" : "Полето"} е успешно обновено!`
      });
    } catch (err) {
      next(err);
      logError(err, req, { className: 'user.controller', functionName: 'updateUserField', user: req.body.id });
      console.error("Error updating user field:", err);
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  };
  
export const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await deleteUserAndRelatedData(userId);

    if (!result.success) throw new Error(result.error);

    res.status(200).json({ success: true, message: "Потребителят е успешно изтрит." });
  } catch (err) {
    next(err);
    logError(err, req, { className: 'user.controller', functionName: 'deleteAccount' });
    console.error("Error deleting user field:", err);
    res.status(500).json({ success: false, message: "Грешка при изтриване на потребителя" });
  }
};

export const getTopUsers = async (req, res, next) => {
    try {
        const topUsers = await UserModel.find({})
            .sort({ points: -1 })
            .limit(3)
            .select('_id name points'); 

        res.status(200).json({
            success: true,
            topUsers
        });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'getTopUsers' });
        console.error("Error getting top users:", err);
        res.status(500).json({
            success: false,
            message: "Грешка при извличането на топ потребителите!"
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
      const users = await UserModel.find();
      res.json({ users });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'getAllUsers' });
        console.error("Error getting users:", err);
        res.status(500).json({ success: false, error: 'Грешка при извличане на потребители' });
    }
  };
  
  export const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      await UserModel.findByIdAndUpdate(id, updates);
      res.json({ message: 'Потребителят е обновен успешно' });
    } catch (err) {
        next(err);
        logError(err, req, { className: 'user.controller', functionName: 'updateUser' });
        console.error("Error updating users:", err);
        res.status(500).json({ error: 'Грешка при обновяване' });
    }
  };