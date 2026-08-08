import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { Article } from '../models/article.js';

export const updateUserAvatar = async (req, res, next) => {
  const { file, user } = req;
  if (!file) {
    throw createHttpError(400, 'No file');
  }

  const result = await saveFileToCloudinary(file.buffer, user._id);

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    { avatar: result.secure_url },
    { returnDocument: 'after' },
  );

  res.status(200).json({ url: updatedUser.avatar });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id }).select('-password');

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json({ user });
};

export const getUserArticles = async (req, res) => {
  const { id } = req.params;
  const { page = 1, perPage = 12 } = req.query;

  const skip = (page - 1) * perPage;

  const articleQuery = Article.find({
    userId: id,
  });

  const [totalArticles, articles] = await Promise.all([
    articleQuery.clone().countDocuments(),
    articleQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalArticles / perPage);

  res.status(200).json({
    page,
    perPage,
    totalArticles,
    totalPages,
    articles,
  });
};

export const getSavedArticles = async (req, res) => {
  const { page = 1, perPage = 12 } = req.query;

  const skip = (page - 1) * perPage;

  const articleQuery = Article.find({
    _id: { $in: req.user.savedArticles},
  });

  const [totalArticles, articles] = await Promise.all([
    articleQuery.clone().countDocuments(),
    articleQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalArticles / perPage);

  res.status(200).json({
    page,
    perPage,
    totalArticles,
    totalPages,
    articles,
  });
};
