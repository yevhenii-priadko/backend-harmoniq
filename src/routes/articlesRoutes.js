import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
import { saveArticlePhotoToCloudinary } from '../utils/saveFileToCloudinary.js';
import {
  createArticle,
  getAllArticles,
  getArticleById,
  addSavedArticle,
  removeSavedArticle,
  deleteArticleById,
  updateArticle,
} from '../controllers/articlesController.js';
import {
  articleIdSchema,
  createArticleSchema,
  getAllArticlesSchema,
  updateArticleSchema,
} from '../validations/articlesValidation.js';

const router = Router();

// Якщо клієнт надіслав файл (multipart/form-data, поле "photo") — вантажимо
// його на Cloudinary і підставляємо готовий URL у req.body.photo ДО того,
// як celebrate провалідує тіло запиту. Саму Joi-схему (createArticleSchema)
// чіпати не треба — вона як і раніше просто чекає на photo як на рядок.
//
// ⚠️ Зворотна сумісність: якщо файлу немає (req.file відсутній — клієнт
// надіслав звичайний JSON з photo-URL, як зараз робить фронт), middleware
// просто викликає next() нічого не змінюючи. Старий спосіб продовжує
// працювати паралельно з новим.
const attachArticlePhotoUrl = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await saveArticlePhotoToCloudinary(
        req.file.buffer,
        `${Date.now()}_${req.user._id}`,
      );
      req.body.photo = result.secure_url;
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get('/articles', celebrate(getAllArticlesSchema), getAllArticles);
router.get('/articles/:articleId', celebrate(articleIdSchema), getArticleById);
router.post(
  '/articles',
  authenticate,
  upload.single('photo'),
  attachArticlePhotoUrl,
  celebrate(createArticleSchema),
  createArticle,
);
router.patch(
  '/articles/:articleId',
  authenticate,
  upload.single('photo'),
  attachArticlePhotoUrl,
  celebrate(updateArticleSchema),
  updateArticle,
);
router.delete('/articles/:articleId', authenticate, deleteArticleById);

router.use('/users', authenticate);
router.post('/users/saved/:articleId', addSavedArticle);
router.delete('/users/saved/:articleId', removeSavedArticle);

export default router;
