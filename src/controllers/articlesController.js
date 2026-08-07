import createHttpError from 'http-errors';
import Article from '../models/article.js';

export const deleteArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const article = await Article.findOne({ _id: id });

    if (!article) {
      throw createHttpError(404, 'Article not found');
    }

    if (article.authorId.toString() !== userId) {
      throw createHttpError(403, 'No rights to delete the article');
    }

    await Article.findOneAndDelete({ _id: id });

    return res.status(200).json({
      message: 'Article is successfully deleted',
    });
  } catch (error) {
      next(error);
  }
};
