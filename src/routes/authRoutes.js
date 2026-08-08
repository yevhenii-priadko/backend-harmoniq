import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUserController,
} from '../controllers/authController.js';
import { loginSchame } from '../validations/authValidation.js';
import { registerUserValidation } from '../validations/authValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/auth/register', registerUserValidation, registerUserController);
router.post('/auth/login', celebrate(loginSchame), loginUser);
router.post('/auth/logout', authenticate, logoutUser);
router.post('/auth/refresh', refreshUserSession);

export default router;
