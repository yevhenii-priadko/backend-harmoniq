import { User } from '../models/user.js';

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
