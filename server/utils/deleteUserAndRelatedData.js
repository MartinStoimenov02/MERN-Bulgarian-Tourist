import UserModel from '../models/user.model.js';
import PlaceModel from '../models/place.model.js';
import mongoose from 'mongoose';

const deleteUserAndRelatedData = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await PlaceModel.deleteMany({ user: userId }).session(session);
    const deletedUser = await UserModel.findByIdAndDelete(userId).session(session);

    if (!deletedUser) throw new Error("User not found");

    await session.commitTransaction();
    session.endSession();
    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
    logError(err, null, { className: 'deleteUserAndRelatedData', functionName: 'deleteUserAndRelatedData', user: userId });
    console.error(`[CRON DELETE USER ERROR] ID: ${userId} -`, err.message);
    return { success: false, error: err.message };
  }
};

export default deleteUserAndRelatedData;
