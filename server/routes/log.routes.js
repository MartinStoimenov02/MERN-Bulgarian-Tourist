import express from 'express';
import { createLog } from '../controllers/log.controller.js';

const router = express.Router();

router.post('/createLog', (req, res, next) => {
    console.log('Received request at /createLog');
    next();
}, createLog);


export default router;
