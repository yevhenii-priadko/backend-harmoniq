import { Joi, Segments } from 'celebrate';

export const loginSchame = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().max(64).required(),
    password: Joi.string().min(8).max(64).required(),
  }),
};
