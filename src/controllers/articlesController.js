import { Article } from "../models/article.js";
import createHttpError from 'http-errors';

export const getAllArticles = async (req, res) => {
  const { page = 1, perPage = 10 } = req.query;
  const skip = (page - 1) * perPage;
  const articlesQuery = Article.find();

  const [totalArticles, articles] = await Promise.all([
    articlesQuery.clone().countDocuments(),

    articlesQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalArticles / perPage);

  res.status(200).json({ page, perPage, totalArticles, totalPages, articles });
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

export const createArticle = async (req, res) => {
  const article = await Article.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(article);
};
