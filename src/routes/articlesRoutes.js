import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  createArticle,
  getAllArticles,
  getArticleById,
  addSavedArticle,
  removeSavedArticle,
} from '../controllers/articlesController.js';
import {
  articleIdSchema,
  createArticleSchema,
  getAllArticlesSchema,
} from '../validations/articlesValidation.js';

const router = Router();

router.get('/articles', celebrate(getAllArticlesSchema), getAllArticles);
router.get('/articles/:articleId', celebrate(articleIdSchema), getArticleById);
router.post('/articles', authenticate, celebrate(createArticleSchema), createArticle);

router.use('/users', authenticate);
router.post('/users/saved/:articleId', addSavedArticle);
router.delete('/users/saved/:articleId', removeSavedArticle);

export default router;
