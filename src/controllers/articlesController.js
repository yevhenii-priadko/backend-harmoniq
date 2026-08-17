import { Article } from '../models/article.js';
import { User } from '../models/user.js';
import createHttpError from 'http-errors';

export const getAllArticles = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortOrder = 'desc',
    filter = 'all',
  } = req.query;
  const skip = (page - 1) * perPage;

  if (filter === 'all') {
    const articlesQuery = Article.find().sort({
      createdAt: sortOrder === 'asc' ? 1 : -1,
    });

    const [totalArticles, articles] = await Promise.all([
      articlesQuery.clone().countDocuments(),
      articlesQuery.skip(skip).limit(perPage),
    ]);

    const totalPages = Math.ceil(totalArticles / perPage);

    return res
      .status(200)
      .json({ page, perPage, totalArticles, totalPages, articles });
  }

  const users = await User.find().select('savedArticles');

  const savedCount = {};

  users.forEach((user) => {
    user.savedArticles.forEach((articleId) => {
      const id = articleId.toString();

      savedCount[id] = (savedCount[id] || 0) + 1;
    });
  });

  const articles = await Article.find();

  const popularArticles = articles
    .map((article) => ({
      ...article.toObject(),
      savedCount: savedCount[article._id.toString()] || 0,
    }))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.savedCount - b.savedCount;
      }

      return b.savedCount - a.savedCount;
    });

  const totalArticles = popularArticles.length;

  const paginatedArticles = popularArticles.slice(skip, skip + Number(perPage));

  const totalPages = Math.ceil(totalArticles / perPage);

  return res.status(200).json({
    page,
    perPage,
    totalArticles,
    totalPages,
    articles: paginatedArticles,
  });
};

export const getArticleById = async (req, res) => {
  const { articleId } = req.params;
  const article = await Article.findOne({
    _id: articleId,
  });

  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  res.status(200).json(article);
};

export const deleteArticleById = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  const article = await Article.findOne({
    _id: articleId,
  });
  if (!article) {
    throw createHttpError(404, 'Article not found');
  }
  if (article.userId.toString() !== userId.toString()) {
    throw createHttpError(403, 'No rights to delete the article');
  }

  await Article.findOneAndDelete({
    _id: articleId,
  });

  res.status(200).json({
    message: 'Article is deleted successfully',
  });
};

export const createArticle = async (req, res) => {
  const article = await Article.create({
    ...req.body,
    // author ігноруємо з тіла запиту: довіряти клієнту нема сенсу (застаріле
    // значення з локального стору, "Unknown" при не залогіненому фронті і т.д.) —
    // беремо ім'я напряму з автентифікованого користувача, як і userId нижче.
    author: req.user.username,
    userId: req.user._id,
  });
  res.status(201).json(article);
};

export const updateArticle = async (req, res) => {
  const { articleId } = req.params;

  const updatedArticle = await Article.findOneAndUpdate(
    { _id: articleId, userId: req.user._id }, // Захист: оновлюємо тільки якщо стаття належить користувачу
    { ...req.body, author: req.user.username }, // author завжди з req.user, не з тіла
    { new: true, runValidators: true },
  );

  if (!updatedArticle) {
    return res
      .status(404)
      .json({ message: 'Article not found or unauthorized' });
  }

  res.status(200).json(updatedArticle);
};

// Додавання статті до збережених
export const addSavedArticle = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    $addToSet: {
      savedArticles: articleId,
    },
  });

  res.status(200).json({
    message: 'Article added to saved',
  });
};

// Видалення статті зі збережених
export const removeSavedArticle = async (req, res) => {
  const { articleId } = req.params;
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    $pull: {
      savedArticles: articleId,
    },
  });

  res.status(200).json({
    message: 'Article removed from saved',
  });
};
