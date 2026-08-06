import { Router } from 'express';
// import { celebrate } from 'celebrate';
import { refreshUserSession } from '../controllers/authController.js';

const router = Router();

router.post('/auth/refresh', refreshUserSession);

export default router;
