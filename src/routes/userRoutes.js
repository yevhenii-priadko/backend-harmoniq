import { Router } from 'express';
import { getSavedArticles, getUserArticles, getUserById, updateUserAvatar } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.patch('/users/avatar', authenticate, upload.single('avatar'), updateUserAvatar);
router.get('/users/me/saved-articles', authenticate, getSavedArticles);
router.get('/users/:id/articles', getUserArticles);
router.get('/users/:id/', getUserById);

export default router;
