import UserModel from '../models/user.model.js';
import crypto from "crypto";
import mongoose from "mongoose";

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
        console.error(err);
        return res.status(500).json({ success: false, message: "Грешка при проверката на имейла" });
    }
};


export const getUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = hashPassword(password);
        // Find user by email
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

        res.json({
            success: true,
            message: "Успешно влизане!",
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                points: user.points,
                firstLogin: user.firstLogin
            }
        });

    } catch (err) {
        next(err);
        console.error(err);
    }
};

// Проверяваме дали записът може да бъде създаден, без да го комитваме
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

        // Опитваме да създадем потребителя, но няма да комитваме транзакцията
        await newUser.save({ session });

        // Ако стигнем дотук, значи данните са валидни и можем да изпратим верификационен код
        await session.abortTransaction(); // Отменяме транзакцията, за да не се запише

        res.status(200).json({ success: true, message: "Данните са валидни." });
    } catch (err) {
        console.error("err: ", err);
        await session.abortTransaction(); // Отменяме транзакцията при грешка
        res.status(400).json({ success: false, message: "Невалидни данни: " + err.message });
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
        console.log(err);
        return res.status(404).json({
            success: false,
            message: err.message + "!"
        });
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Потребителят не е намерен!"
            });
        }

        // Hash the new password
        const hashedPassword = hashPassword(password);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Паролата е успешно сменена!"
        });

    } catch (err) {
        next(err);
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

        res.status(200).json({
            success: true,
            message: "Google login successful!",
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || null
            }
        });

    } catch (err) {
        console.error("Error in Google Auth:", err);
        res.status(500).json({
            success: false,
            message: "Google login error!"
        });
    }
};
