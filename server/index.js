import userRoutes from './routes/user.route.js';
import emailRoutes from './routes/email.route.js';
import googleRoutes from "./routes/google.route.js";
import placesRoutes from "./routes/place.route.js";
import nationalSitesRoutes from "./routes/nationalSite.route.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import notificationRoutes from './routes/notification.route.js';
import logsRoutes from './routes/adminLogs.route.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import './jobs/deleteUserNotifications.job.js';
import './jobs/cleanupInactiveUsers.job.js';

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://mern-bulgarian-tourist.onrender.com'],
  credentials: true
}));


// const mongoDbKey = process.env.MONGODB_KEY;
const mongoDbConnection = process.env.MONGODB_CONNECTION;
await mongoose.connect(mongoDbConnection);



app.use((err, req,res,next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const success = "false";
  return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
  });
});

app.use((req, res, next) => {
  next();
});

app.use("/users", userRoutes);
app.use('/email', emailRoutes);
app.use("/google", googleRoutes);
app.use("/places", placesRoutes);
app.use("/nationalSites", nationalSitesRoutes);
app.use("/feedback", feedbackRoutes);
app.use('/notifications', notificationRoutes);
app.use('/logs', logsRoutes);

app.listen(3001, () => {
    console.log("server runs perfectly!");
});