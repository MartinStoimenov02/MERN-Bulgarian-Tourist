import express from 'express';
import { createFeedback, getAllFeedback, deleteFeedbackById, deleteMultipleFeedback, } from '../controllers/feedback.controller.js';

const router = express.Router();

router.post('/createFeedback', createFeedback);
router.get('/getAllFeedback', getAllFeedback);
router.delete('/deleteFeedbackById/:id', deleteFeedbackById);
router.post('/deleteMultipleFeedback', deleteMultipleFeedback);

export default router;
