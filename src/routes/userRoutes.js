import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getSavedArticles,
  getUserArticles,
  getUserById,
  getUsers,
  updateCurrentUser,
  updateUserAvatar,
} from '../controllers/userController.js';
import {
  addSavedArticle,
  removeSavedArticle,
} from '../controllers/articlesController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadAvatar } from '../middleware/multer.js';
import {
  paginationSchema,
  updateUserSchema,
} from '../validations/usersValidation.js';

const router = Router();

router.patch(
  '/users/avatar',
  authenticate,
  uploadAvatar,
  updateUserAvatar,
);
router.patch(
  '/users/me',
  authenticate,
  uploadAvatar,
  celebrate(updateUserSchema),
  updateCurrentUser,
);
router.get('/users', getUsers);
router.get(
  '/users/me/saved-articles',
  authenticate,
  celebrate(paginationSchema),
  getSavedArticles,
);
router.post('/users/saved/:articleId', authenticate, addSavedArticle);
router.delete('/users/saved/:articleId', authenticate, removeSavedArticle);
router.get('/users/:id/articles', celebrate(paginationSchema), getUserArticles);
router.get('/users/:id/', getUserById);

export default router;
