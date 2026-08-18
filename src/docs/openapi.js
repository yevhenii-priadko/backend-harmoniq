const objectIdExample = '64f8a6e8c2d4a12f0b7f4b91';

const userSchema = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
      example: objectIdExample,
    },
    username: {
      type: 'string',
      example: 'Olena Kovalenko',
    },
    email: {
      type: 'string',
      format: 'email',
      example: 'olena@example.com',
    },
    avatar: {
      type: 'string',
      example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
    },
    savedArticles: {
      type: 'array',
      items: {
        type: 'string',
        example: objectIdExample,
      },
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

const articleSchema = {
  type: 'object',
  required: ['title', 'description', 'photo', 'date', 'author', 'userId'],
  properties: {
    _id: {
      type: 'string',
      example: objectIdExample,
    },
    title: {
      type: 'string',
      minLength: 3,
      maxLength: 48,
      example: 'How music shapes daily focus',
    },
    description: {
      type: 'string',
      minLength: 100,
      maxLength: 4000,
      example:
        'A long-form article description with at least one hundred characters that explains the topic and gives readers context.',
    },
    photo: {
      type: 'string',
      example: 'https://res.cloudinary.com/demo/image/upload/article.jpg',
    },
    date: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      example: '2026-08-12',
    },
    author: {
      type: 'string',
      minLength: 4,
      maxLength: 50,
      example: 'Olena Kovalenko',
    },
    userId: {
      type: 'string',
      example: objectIdExample,
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

const errorResponses = {
  Unauthorized: {
    description: 'Authentication credentials are missing or invalid.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  Forbidden: {
    description: 'The current user is not allowed to perform this action.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  NotFound: {
    description: 'Requested resource was not found.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
  ValidationError: {
    description: 'Request validation failed.',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
      },
    },
  },
};

const paginationParameters = [
  {
    in: 'query',
    name: 'page',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
    required: false,
  },
  {
    in: 'query',
    name: 'perPage',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 12,
    },
    required: false,
  },
];

const articleIdParameter = {
  in: 'path',
  name: 'articleId',
  required: true,
  schema: {
    type: 'string',
    example: objectIdExample,
  },
};

const userIdParameter = {
  in: 'path',
  name: 'id',
  required: true,
  schema: {
    type: 'string',
    example: objectIdExample,
  },
};

const articleRequestProperties = {
  title: {
    type: 'string',
    minLength: 3,
    maxLength: 48,
    example: 'How music shapes daily focus',
  },
  description: {
    type: 'string',
    minLength: 100,
    maxLength: 4000,
    example:
      'A long-form article description with at least one hundred characters that explains the topic and gives readers context.',
  },
  photo: {
    type: 'string',
    example: 'https://res.cloudinary.com/demo/image/upload/article.jpg',
  },
  date: {
    type: 'string',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    example: '2026-08-12',
  },
  author: {
    type: 'string',
    minLength: 4,
    maxLength: 50,
    example: 'Olena Kovalenko',
  },
};

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Harmoniq API',
    version: '1.0.0',
    description:
      'REST API documentation for Harmoniq articles platform. The protected endpoints use session cookies set by the auth routes.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
    {
      url: 'https://backend-harmoniq.onrender.com',
      description: 'Render production server',
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Registration, login, logout, and session refresh.',
    },
    {
      name: 'Users',
      description: 'User profiles, avatars, and user article lists.',
    },
    {
      name: 'Articles',
      description: 'Article listing, details, creation, and deletion.',
    },
    {
      name: 'Categories',
      description: 'Available article categories.',
    },
    {
      name: 'Saved Articles',
      description: 'Current user saved article actions.',
    },
    {
      name: 'Documentation',
      description: 'OpenAPI document endpoints.',
    },
  ],
  components: {
    securitySchemes: {
      sessionIdCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'sessionId',
      },
      accessTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
      refreshTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
    schemas: {
      User: userSchema,
      Article: articleSchema,
      ErrorResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Validation error',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: {
            type: 'string',
            minLength: 2,
            maxLength: 32,
            example: 'Olena Kovalenko',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 64,
            example: 'olena@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 64,
            format: 'password',
            example: 'password123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            maxLength: 64,
            example: 'olena@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 64,
            format: 'password',
            example: 'password123',
          },
        },
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'User registered successfully',
          },
          data: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
        },
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Article added to saved',
          },
        },
      },
      UsersListResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          perPage: {
            type: 'integer',
            example: 20,
          },
          totalUsers: {
            type: 'integer',
            example: 42,
          },
          totalPages: {
            type: 'integer',
            example: 3,
          },
          users: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
      ArticlesListResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          perPage: {
            type: 'integer',
            example: 12,
          },
          totalArticles: {
            type: 'integer',
            example: 24,
          },
          totalPages: {
            type: 'integer',
            example: 2,
          },
          articles: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Article',
            },
          },
        },
      },
      CreateArticleRequest: {
        type: 'object',
        required: ['title', 'description', 'photo', 'date', 'author'],
        properties: articleRequestProperties,
      },
      CreateArticleMultipartRequest: {
        type: 'object',
        required: ['title', 'description', 'photo', 'date', 'author'],
        properties: {
          ...articleRequestProperties,
          photo: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      UpdateArticleRequest: {
        type: 'object',
        properties: articleRequestProperties,
      },
      UpdateArticleMultipartRequest: {
        type: 'object',
        properties: {
          ...articleRequestProperties,
          photo: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      AvatarUploadRequest: {
        type: 'object',
        required: ['avatar'],
        properties: {
          avatar: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      AvatarUploadResponse: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            example: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
          },
        },
      },
    },
  },
  paths: {
    '/api-docs.json': {
      get: {
        tags: ['Documentation'],
        summary: 'Get OpenAPI specification as JSON',
        responses: {
          200: {
            description: 'OpenAPI document.',
          },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get article categories',
        responses: {
          200: {
            description: 'Available article categories.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['popular', 'general'],
                  },
                  example: ['popular', 'general'],
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterResponse',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
          409: {
            description: 'Email already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in a user and set session cookies',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'User logged in successfully.',
            headers: {
              'Set-Cookie': {
                description: 'sessionId, accessToken, and refreshToken cookies.',
                schema: {
                  type: 'string',
                },
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
          401: errorResponses.Unauthorized,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out the current user',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        responses: {
          204: {
            description: 'User logged out successfully.',
          },
          401: errorResponses.Unauthorized,
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh the current session',
        security: [
          {
            sessionIdCookie: [],
            refreshTokenCookie: [],
          },
        ],
        responses: {
          200: {
            description: 'Session refreshed successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
                example: {
                  message: 'Session refreshed',
                },
              },
            },
          },
          401: errorResponses.Unauthorized,
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get users list',
        parameters: paginationParameters.map((parameter) =>
          parameter.name === 'perPage'
            ? {
                ...parameter,
                schema: {
                  ...parameter.schema,
                  default: 20,
                  maximum: 100,
                },
              }
            : parameter,
        ),
        responses: {
          200: {
            description: 'Paginated users list.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UsersListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/users/avatar': {
      patch: {
        tags: ['Users'],
        summary: 'Upload or replace the current user avatar',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/AvatarUploadRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Avatar URL was updated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AvatarUploadResponse',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
          401: errorResponses.Unauthorized,
        },
      },
    },
    '/users/me/saved-articles': {
      get: {
        tags: ['Saved Articles'],
        summary: 'Get current user saved articles',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        parameters: paginationParameters,
        responses: {
          200: {
            description: 'Paginated saved articles list.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ArticlesListResponse',
                },
              },
            },
          },
          401: errorResponses.Unauthorized,
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get public user profile by id',
        parameters: [userIdParameter],
        responses: {
          200: {
            description: 'User profile.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          404: errorResponses.NotFound,
        },
      },
    },
    '/users/{id}/articles': {
      get: {
        tags: ['Users'],
        summary: 'Get articles created by a user',
        parameters: [userIdParameter, ...paginationParameters],
        responses: {
          200: {
            description: 'Paginated user articles list.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ArticlesListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/articles': {
      get: {
        tags: ['Articles'],
        summary: 'Get articles list',
        parameters: [
          ...paginationParameters.map((parameter) =>
            parameter.name === 'perPage'
              ? {
                  ...parameter,
                  schema: {
                    ...parameter.schema,
                    minimum: 5,
                    maximum: 20,
                  },
                }
              : parameter,
          ),
          {
            in: 'query',
            name: 'sortOrder',
            required: false,
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
          {
            in: 'query',
            name: 'filter',
            required: false,
            schema: {
              type: 'string',
              enum: ['all', 'popular'],
              default: 'all',
            },
          },
        ],
        responses: {
          200: {
            description: 'Paginated articles list.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ArticlesListResponse',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
        },
      },
      post: {
        tags: ['Articles'],
        summary: 'Create an article',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateArticleRequest',
              },
            },
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/CreateArticleMultipartRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Article created successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Article',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
          401: errorResponses.Unauthorized,
        },
      },
    },
    '/articles/{articleId}': {
      get: {
        tags: ['Articles'],
        summary: 'Get article by id',
        parameters: [articleIdParameter],
        responses: {
          200: {
            description: 'Article details.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Article',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
          404: errorResponses.NotFound,
        },
      },
      patch: {
        tags: ['Articles'],
        summary: 'Update article by id',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        parameters: [articleIdParameter],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateArticleRequest',
              },
            },
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/UpdateArticleMultipartRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Article updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Article',
                },
              },
            },
          },
          400: errorResponses.ValidationError,
          401: errorResponses.Unauthorized,
          404: errorResponses.NotFound,
        },
      },
      delete: {
        tags: ['Articles'],
        summary: 'Delete article by id',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        parameters: [articleIdParameter],
        responses: {
          200: {
            description: 'Article deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
                example: {
                  message: 'Article is deleted successfully',
                },
              },
            },
          },
          401: errorResponses.Unauthorized,
          403: errorResponses.Forbidden,
          404: errorResponses.NotFound,
        },
      },
    },
    '/users/saved/{articleId}': {
      post: {
        tags: ['Saved Articles'],
        summary: 'Save article for current user',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        parameters: [articleIdParameter],
        responses: {
          200: {
            description: 'Article added to saved.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
                example: {
                  message: 'Article added to saved',
                },
              },
            },
          },
          401: errorResponses.Unauthorized,
        },
      },
      delete: {
        tags: ['Saved Articles'],
        summary: 'Remove article from current user saved list',
        security: [
          {
            sessionIdCookie: [],
            accessTokenCookie: [],
          },
        ],
        parameters: [articleIdParameter],
        responses: {
          200: {
            description: 'Article removed from saved.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
                example: {
                  message: 'Article removed from saved',
                },
              },
            },
          },
          401: errorResponses.Unauthorized,
        },
      },
    },
  },
};
