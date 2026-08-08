import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUser,
  refreshUserSession,
} from '../controllers/authController.js';
import { loginSchame } from '../validations/authValidation.js';

const router = Router();

router.post('/auth/login', celebrate(loginSchame), loginUser);
router.post('/auth/refresh', refreshUserSession);

export default router;
