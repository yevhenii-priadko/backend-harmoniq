import { Router } from 'express';
import {
  refreshUserSession,
  registerUserController,
} from '../controllers/authController.js';
import { registerUserValidation } from '../validations/authValidation.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.post(
  '/auth/register',
  upload.single('avatar'),
  registerUserValidation,
  registerUserController,
);

router.post('/auth/refresh', refreshUserSession);

export default router;
