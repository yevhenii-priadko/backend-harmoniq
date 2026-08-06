import { Router } from 'express';
// import { celebrate } from 'celebrate';
import { refreshUserSession } from '../controllers/authController.js';
import { celebrate } from 'celebrate';
import { loginSchame } from '../validations/authValidation.js';

const router = Router();

router.post('/auth/login', celebrate(loginSchame));
router.post('/auth/refresh', refreshUserSession);

export default router;
