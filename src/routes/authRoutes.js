import { Router } from 'express';
import {
  refreshUserSession,
  registerUserController,
} from '../controllers/authController.js';
import { registerUserValidation } from '../validations/authValidation.js';

const router = Router();

router.post(
  '/auth/register',
  registerUserValidation,
  registerUserController,
);

router.post('/auth/refresh', refreshUserSession);

export default router;
