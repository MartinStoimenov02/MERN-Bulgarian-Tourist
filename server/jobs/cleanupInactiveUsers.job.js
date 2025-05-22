import cron from 'node-cron';
import dayjs from 'dayjs';
import UserModel from '../models/user.model.js';
import deleteUserAndRelatedData from '../utils/deleteUserAndRelatedData.js';
import { sendEmail } from '../utils/email.js';

cron.schedule('0 2 * * *', async () => {
// cron.schedule('* * * * *', async () => {
  console.log('[CRON] Стартиране на проверка за неактивни потребители...');
  try {
    const users = await UserModel.find();

    const now = dayjs();

    for (const user of users) {
      const lastLogin = user.lastLogin || user.createdAt;
      const lastLoginDate = dayjs(lastLogin);
      const monthsInactive = now.diff(lastLoginDate, 'month');
      const daysInactive = now.diff(lastLoginDate, 'day');
      const daysUntilDeletion = 365 - daysInactive;

      // Предупредителни имейли на 6, 10 и 11 месеца
      if ([6, 10, 11].includes(monthsInactive)) {
        try {
          await sendEmail(
            user.email,
            'Предупреждение: Неактивност в профила Ви в "Български турист"',
            `<p>Здравейте, ${user.name || 'драги потребителю'},</p>
            <p>Не сте влизали в профила си в "Български турист" от ${monthsInactive} месеца.</p>
            <p>Ако не го използвате до навършване на 12 месеца неактивност, профилът Ви ще бъде изтрит автоматично и <b>няма да може да бъде възтановен</b>!</p>`
          );
          console.log(`[EMAIL] Изпратено предупреждение до ${user.email} (${monthsInactive} месеца неактивност)`);
        } catch (err) {
          next(err);
          logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
          console.error(`[EMAIL ERROR] Неуспешно изпращане до ${user.email}:`, err);
        }
      }

      // Последна седмица - ежедневно напомняне
      if (monthsInactive === 11 && daysUntilDeletion <= 7 && daysUntilDeletion > 0) {
        try {
          await sendEmail(
            user.email,
            `Важно: Профилът Ви в "Български турист" ще бъде изтрит след ${daysUntilDeletion} дни`,
            `<p>Здравейте,</p>
            <p>Профилът Ви в "Български турист" е неактивен от почти година.</p>
            <p>След <b>${daysUntilDeletion}</b> дни той ще бъде <b>автоматично изтрит</b>, ако не влезете отново и <b>няма да може да бъде възтановен</b>!</p>`
          );
          console.log(`[EMAIL] Изпратено ежедневно напомняне до ${user.email} (${daysUntilDeletion} дни остават)`);
        } catch (err) {
          next(err);
          logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
          console.error(`[EMAIL ERROR] Неуспешно изпращане до ${user.email}:`, err);
        }
      }

      // Изтриване след 12 месеца (365 дни)
      if (daysInactive >= 365) {
        try {
          const result = await deleteUserAndRelatedData(user._id);
          if (result.success) {
            console.log(`[CRON] Успешно изтрит потребител: ${user.email}`);

            // Имейл след изтриване
            try {
              await sendEmail(
                user.email,
                'Профилът Ви в "Български турист" е изтрит',
                `<p>Здравейте,</p>
                <p>Профилът Ви в "Български турист" беше изтрит автоматично поради 12 месеца неактивност.</p>
                <p>Той не подлежи на възстановяване.</p>`
              );
              console.log(`[EMAIL] Изпратен финален имейл до ${user.email}`);
            } catch (err) {
              next(err);
              logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
              console.error(`[EMAIL ERROR] Неуспешно изпращане на финален имейл до ${user.email}:`, err);
            }
          } else {
            console.log(`[CRON] Грешка при изтриване на ${user.email}: ${result.error}`);
          }
        } catch (err) {
          next(err);
          logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
          console.error(`[CRON ERROR] Грешка при обработка на ${user.email}:`, err);
        }
      }
    }
  } catch (err) {
    next(err);
    logError(err, null, { className: 'cleanupInactiveUsers.job', functionName: 'cron.schedule' });
    console.error('[CRON ERROR] Грешка при обща проверка за неактивност:', err);
  }
});
