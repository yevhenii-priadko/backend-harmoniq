import assert from 'node:assert/strict';
import test from 'node:test';
import { openApiSpec } from './openapi.js';

test('documents PATCH /articles/{articleId}', () => {
  const operation = openApiSpec.paths['/articles/{articleId}']?.patch;

  assert.ok(operation);
  assert.ok(operation.requestBody.content['application/json']);
  assert.ok(operation.requestBody.content['multipart/form-data']);
  assert.equal(
    openApiSpec.components.schemas.UpdateArticleRequest.required,
    undefined,
  );
  assert.deepEqual(Object.keys(operation.responses).sort(), [
    '200',
    '400',
    '401',
    '404',
  ]);
  assert.deepEqual(operation.security, [
    { sessionIdCookie: [], accessTokenCookie: [] },
  ]);
});

test('uses a restricted schema for public user responses', () => {
  const schemas = openApiSpec.components.schemas;
  const usersListRef = schemas.UsersListResponse.properties.users.items.$ref;
  const userProfileRef =
    openApiSpec.paths['/users/{id}'].get.responses[200].content[
      'application/json'
    ].schema.properties.user.$ref;

  assert.equal(usersListRef, '#/components/schemas/PublicUser');
  assert.equal(userProfileRef, '#/components/schemas/PublicUser');

  const publicProperties = schemas.PublicUser.properties;
  assert.equal(publicProperties.email, undefined);
  assert.equal(publicProperties.savedArticles, undefined);
  assert.equal(publicProperties.password, undefined);
  assert.ok(schemas.User.properties.email);
  assert.ok(schemas.User.properties.savedArticles);
});

test('documents validated pagination for user article lists', () => {
  const paths = ['/users/me/saved-articles', '/users/{id}/articles'];

  for (const path of paths) {
    const operation = openApiSpec.paths[path].get;
    const perPage = operation.parameters.find(
      (parameter) => parameter.name === 'perPage',
    );

    assert.equal(perPage.schema.maximum, 100);
    assert.ok(operation.responses[400]);
  }
});

test('rejects unknown fields in validated request schemas', () => {
  const requestSchemas = [
    'RegisterRequest',
    'LoginRequest',
    'CreateArticleRequest',
    'CreateArticleMultipartRequest',
    'UpdateArticleRequest',
    'UpdateArticleMultipartRequest',
  ];

  for (const schemaName of requestSchemas) {
    assert.equal(
      openApiSpec.components.schemas[schemaName].additionalProperties,
      false,
      schemaName,
    );
  }
});

test('documents cookies returned by session refresh', () => {
  const header =
    openApiSpec.paths['/auth/refresh'].post.responses[200].headers?.[
      'Set-Cookie'
    ];

  assert.ok(header);
  assert.match(header.description, /sessionId/);
  assert.match(header.description, /accessToken/);
  assert.match(header.description, /refreshToken/);
});

test('documents image upload constraints', () => {
  const schemas = openApiSpec.components.schemas;
  const binaryFields = [
    schemas.AvatarUploadRequest.properties.avatar,
    schemas.CreateArticleMultipartRequest.properties.photo,
    schemas.UpdateArticleMultipartRequest.properties.photo,
  ];

  for (const field of binaryFields) {
    assert.equal(field.format, 'binary');
    assert.match(field.description, /image/i);
    assert.match(field.description, /1 MB/i);
  }
});
