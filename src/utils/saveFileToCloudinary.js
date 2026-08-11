import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function saveFileToCloudinary(buffer, userId) {
  const options = {
    folder: 'harmoniq/avatars',
    public_id: `avatar_${userId}`,
    resource_type: 'image',
    overwrite: true,
    unique_filename: false,
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'auto' },
      { fetch_format: 'auto', quality: 'auto' },
    ],
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

// Окрема функція для фото статей — не можна перевикористати saveFileToCloudinary
// один-в-один: там folder/public_id захардкожені під аватар (overwrite: true
// на основі userId означає, що друга стаття того самого автора перезаписала б
// фото першої). Тут public_id будується на timestamp, а не на userId,
// щоб кожне фото статті було унікальним файлом.
export async function saveArticlePhotoToCloudinary(buffer, uniqueSuffix) {
  const options = {
    folder: 'harmoniq/articles',
    public_id: `article_${uniqueSuffix}`,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
    transformation: [{ fetch_format: 'auto', quality: 'auto' }],
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}
