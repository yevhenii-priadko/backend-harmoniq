# Backend — Harmoniq

REST API для платформи статей: реєстрація/авторизація користувачів (сесії на access/refresh JWT), робота зі статтями, категоріями, аватарами (Cloudinary) та збереженими статтями.

## Стек технологій

- Node.js + Express 5
- MongoDB + Mongoose
- Автентифікація: JWT (access + refresh токени), сесії зберігаються в колекції `Session`
- Валідація: `celebrate` (Joi)
- Завантаження файлів: `multer` (пам'ять) + Cloudinary
- Документація API: Swagger (`swagger-ui-express`)
- Логування: `pino-http`

## Встановлення та запуск

```bash
git clone git@github.com:yevhenii-priadko/backend-harmoniq.git
cd backend-harmoniq
npm install
code .
```

Створити файл `.env` у корені проєкту (зразок — `.env.example`):

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Запуск сервера для розробки:

```bash
npm run dev
```

Запуск у продакшн-режимі:

```bash
npm start
```

## Архітектура сервера

- Підключені необхідні модулі (express, cors, cookie-parser, dotenv, mongoose, helmet тощо)
- CORS дозволяє запити з хостів, вказаних у `FRONTEND_URL`, та з `http://localhost:3000`, з підтримкою кук (`credentials: true`)
- Централізована обробка помилок: `celebrate`-помилки валідації відловлюються окремим `errors()` middleware, решта помилок — спільним `errorHandler` (помилки `http-errors` повертаються з власним статусом і повідомленням, інші — як 500)
- Автентифікація побудована на httpOnly-куках (`sessionId`, `accessToken`, `refreshToken`), а не на JWT у заголовку Authorization — сесія і обидва токени зберігаються в колекції `Session`

## База даних

Колекції: `User`, `Article`, `Session`.

- `User` — `username`, `email` (унікальний), `password` (хеш), `avatar`, `savedArticles` (масив `ObjectId` → `Article`)
- `Article` — `title`, `description`, `photo`, `date`, `author`, `userId` (`ObjectId` → `User`)
- `Session` — `userId`, `accessToken`, `refreshToken`, терміни дії обох токенів

Підключення до БД — через змінну середовища `MONGO_URL`.

## Документація ендпоінтів

Інтерактивна Swagger-документація доступна за адресою `/api-docs` (роутер піднятий у `server.js`), сира специфікація — за `/api-docs.json`.

## Auth

| Метод | Ендпоінт | Доступ | Опис |
|---|---|---|---|
| POST | `/auth/register` | Публічний | Реєстрація користувача |
| POST | `/auth/login` | Публічний | Логін користувача, видає access/refresh токени (httpOnly cookies) |
| POST | `/auth/logout` | Приватний | Вихід користувача з системи, видаляє сесію та очищає cookies |
| POST | `/auth/refresh` | Захищений (refresh token) | Оновлення сесії користувача; валідність refresh-токена перевіряється в контролері |

**Реєстрація — валідація полів (`application/json`):**
- `username`: обов'язкове, 2–32 символи
- `email`: обов'язкове, до 64 символів, валідний email
- `password`: обов'язкове, 8–64 символи

**Логін — валідація полів:**
- `email`: обов'язкове, до 64 символів
- `password`: обов'язкове, 8–64 символи

**Middleware авторизації** (`authenticate`) — перевіряє наявність і валідність сесії (`sessionId` + `accessToken` у cookies) для приватних маршрутів, підставляє `req.user`.

## User

| Метод | Ендпоінт | Доступ | Опис |
|---|---|---|---|
| GET | `/users` | Публічний | Список користувачів з пагінацією (`page`, `perPage`, за замовчуванням 20, максимум 100) |
| PATCH | `/users/avatar` | Приватний | Додавання/зміна аватару користувача (`multipart/form-data`, поле `avatar`, до 1 MB) |
| GET | `/users/:id` | Публічний | Інформація про користувача (автора) |
| GET | `/users/:id/articles` | Публічний | Список статей, створених юзером, з пагінацією (`page`, `perPage`, за замовчуванням 12) |
| GET | `/users/me/saved-articles` | Приватний | Список збережених статей поточного юзера, з пагінацією |
| POST | `/users/saved/:articleId` | Приватний | Додати статтю до збережених |
| DELETE | `/users/saved/:articleId` | Приватний | Видалити статтю зі збережених |
| PATCH | `/users/me` | — | Оновлення інформації про користувача — ще не реалізовано (додаткове завдання) |

## Articles

| Метод | Ендпоінт | Доступ | Опис |
|---|---|---|---|
| GET | `/articles` | Публічний | Список статей з пагінацією та фільтрами: `page` (за замовчуванням 1), `perPage` (5–20, за замовчуванням 12), `sortOrder` (`asc`/`desc`, за замовчуванням `desc`), `filter` (`all`/`popular`, за замовчуванням `all`) |
| GET | `/articles/:articleId` | Публічний | Отримання статті за id |
| POST | `/articles` | Приватний | Створення статті (`application/json` з `photo`-URL, або `multipart/form-data` з полем `photo`-файлом — сервер сам завантажить фото на Cloudinary) |
| PATCH | `/articles/:articleId` | Приватний, лише власник статті | Редагування статті за id |
| DELETE | `/articles/:articleId` | Приватний, лише власник статті | Видалення статті за id |

**Створення/редагування статті — валідація полів:**
- `title`: обов'язкове, 3–48 символів
- `description`: обов'язкове, 100–4000 символів
- `photo`: обов'язкове (URL-рядок у тілі запиту або файл до 1 MB у `multipart/form-data`)
- `date`: обов'язкове, формат `рррр-мм-дд`
- `author`: приймається у запиті, але ігнорується — сервер завжди підставляє ім'я з автентифікованої сесії

Фільтр `filter=popular` сортує статті за кількістю користувачів, які додали статтю до збережених (`savedArticles`), а не за окремим полем рейтингу.

## Categories

| Метод | Ендпоінт | Доступ | Опис |
|---|---|---|---|
| GET | `/categories` | Публічний | Список категорій статей: `popular`, `general` |

## Порядок виконання завдань

1. Базова версія (сервер, CORS, обробка помилок, БД) — готово
2. Auth — готово
3. User — готово (крім `PATCH /users/me`)
4. Articles — готово, включно з фільтрами/сортуванням
5. Swagger-документація — готово (`/api-docs`)
6. Додаткові завдання, що лишились: `PATCH /users/me` (оновлення інформації користувача)
