import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { Article } from '../models/article.js';

const parsePositiveInteger = (value, defaultValue) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return defaultValue;
  }

  return parsedValue;
};

export const getUsers = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const perPage = Math.min(parsePositiveInteger(req.query.perPage, 20), 100);
  const skip = (page - 1) * perPage;

  const userQuery = User.find()
    .select('-password -savedArticles -__v')
    .sort({ createdAt: -1 });

  const [totalUsers, users] = await Promise.all([
    userQuery.clone().countDocuments(),
    userQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalUsers / perPage);

  res.status(200).json({
    page,
    perPage,
    totalUsers,
    totalPages,
    users,
  });
};

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

  const user = await User.findOne({ _id: id }).select('-password -savedArticles -__v');

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
