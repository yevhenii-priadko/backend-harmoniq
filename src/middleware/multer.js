import multer from 'multer';
import createHttpError from 'http-errors';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  },
});

export const toAvatarUploadError = (error) => {
  const message =
    error.code === 'LIMIT_FILE_SIZE'
      ? 'Maximum file size is 1 MB'
      : error.message;

  return createHttpError(400, message);
};

export const uploadAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    next(toAvatarUploadError(error));
  });
};
