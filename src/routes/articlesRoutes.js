import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import {
  addSavedArticle,
  removeSavedArticle,
} from '../controllers/articlesController';

const router = Router();
router.use('/users', authenticate);

router.post('/users/saved/:articleId', addSavedArticle);

router.delete('/users/saved/:articleId', removeSavedArticle);
