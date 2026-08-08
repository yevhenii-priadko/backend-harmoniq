import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  addSavedArticle,
  removeSavedArticle,
} from '../controllers/articlesController.js';

const router = Router();
router.use('/users', authenticate);

router.post('/users/saved/:articleId', addSavedArticle);

router.delete('/users/saved/:articleId', removeSavedArticle);

export default router;
