import express from 'express';
import { getAllLogs, deleteLogById, deleteMultipleLogs } from '../controllers/logs.controller.js';

const router = express.Router();

router.get('/getAllLogs', getAllLogs);
router.delete('/deleteLogById/:id', deleteLogById);
router.post('/deleteMultipleLogs', deleteMultipleLogs);

export default router;
