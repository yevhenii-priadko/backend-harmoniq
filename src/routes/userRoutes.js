import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  getSavedArticles,
  getUserArticles,
  getUserById,
  getUsers,
  updateUserAvatar,
} from '../controllers/userController.js';
import {
  addSavedArticle,
  removeSavedArticle,
} from '../controllers/articlesController.js';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
import { paginationSchema } from '../validations/usersValidation.js';

const router = Router();

router.patch(
  '/users/avatar',
  authenticate,
  upload.single('avatar'),
  updateUserAvatar,
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
