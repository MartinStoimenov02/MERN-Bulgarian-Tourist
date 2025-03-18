import userRoutes from './routes/user.route.js';
import emailRoutes from './routes/email.route.js';
import googleRoutes from "./routes/google.route.js";
import placesRoutes from "./routes/place.route.js";
import nationalSitesRoutes from "./routes/nationalSite.route.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import logRoutes from "./routes/log.routes.js";
import notificationRoutes from './routes/notification.route.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
//without this every post request will give an error
app.use(express.json());
app.use(cors());

const mongoDbKey = process.env.MONGODB_KEY;
//env for database connection
await mongoose.connect("mongodb+srv://martinstoimenov02:"+mongoDbKey+"@bulgarian-tourist.x2ofb.mongodb.net/");



app.use((err, req,res,next) => {
  const statusCode = err.statusCode || 500;
  // noinspection JSUnresolvedReference
  const message = err.message || 'Internal Server Error';
  const success = "false";
  // noinspection JSUnresolvedReference
  return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
  });
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use("/users", userRoutes);
app.use('/email', emailRoutes);
app.use("/google", googleRoutes);
app.use("/places", placesRoutes);
app.use("/nationalSites", nationalSitesRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/logs", logRoutes);
app.use('/notifications', notificationRoutes);

app.listen(3001, () => {
    console.log("server runs perfectly!");
});