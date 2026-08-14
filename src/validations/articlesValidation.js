import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

export const getAllArticlesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(12),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    filter: Joi.string().valid('all', 'popular').default('all'),
  }),
};

export const createArticleSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(3).max(48).trim().required(),
    description: Joi.string().min(100).max(4000).trim().required(),
    photo: Joi.string().required(),
    date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required(),
    author: Joi.string().min(2).max(50).required(),
  }),
};

const objIdValidator = (value, helpers) => {
  if (isValidObjectId(value)) {
    return value;
  }

  return helpers.message('Bad id format');
};

export const articleIdSchema = {
  [Segments.PARAMS]: Joi.object({
    articleId: Joi.string().custom(objIdValidator).required(),
  }),
};
