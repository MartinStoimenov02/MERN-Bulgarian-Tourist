import cron from 'node-cron';
import UserNotificationModel from '../models/userNotification.model.js';

// Джоб, който се изпълнява всеки ден в 02:00
cron.schedule('0 12 * * *', async () => {
  try {
    const today = new Date();
    const oneMonthAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate()
    );

    // Задаваме граници за точния ден
    const startOfDay = new Date(oneMonthAgo.setHours(0, 0, 0, 0));
    const endOfDay = new Date(oneMonthAgo.setHours(23, 59, 59, 999));

    const result = await UserNotificationModel.deleteMany({
      readOn: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    console.log(`[CRON] Deleted ${result.deletedCount} notifications from ${oneMonthAgo.toISOString().slice(0, 10)}`);
  } catch (err) {
    next(err);
    logError(err, null, { className: 'deleteUserNotifications.job', functionName: 'cron.schedule' });
    console.error('[CRON ERROR]', err);
  }
});
