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

test('documents the private current-user profile update', () => {
  const operation = openApiSpec.paths['/users/me']?.patch;
  const schema = openApiSpec.components.schemas.UpdateUserRequest;

  assert.ok(operation);
  assert.deepEqual(operation.security, [
    { sessionIdCookie: [], accessTokenCookie: [] },
  ]);
  assert.equal(
    operation.requestBody.content['multipart/form-data'].schema.$ref,
    '#/components/schemas/UpdateUserRequest',
  );
  assert.equal(schema.required, undefined);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.username.minLength, 2);
  assert.equal(schema.properties.username.maxLength, 32);
  assert.equal(schema.properties.avatar.format, 'binary');
  assert.match(schema.properties.avatar.description, /1 MB/i);
  assert.equal(
    operation.responses[200].content['application/json'].schema.properties.user
      .$ref,
    '#/components/schemas/User',
  );
  assert.deepEqual(Object.keys(operation.responses).sort(), [
    '200',
    '400',
    '401',
    '404',
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
    'UpdateUserRequest',
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
    schemas.UpdateUserRequest.properties.avatar,
  ];

  for (const field of binaryFields) {
    assert.equal(field.format, 'binary');
    assert.match(field.description, /image/i);
    assert.match(field.description, /1 MB/i);
  }
});

test('documents Celebrate validation errors', () => {
  const schema = openApiSpec.components.schemas.ValidationErrorResponse;
  const registerErrorRef =
    openApiSpec.paths['/auth/register'].post.responses[400].content[
      'application/json'
    ].schema.$ref;

  assert.ok(schema);
  assert.deepEqual([...schema.required].sort(), [
    'error',
    'message',
    'statusCode',
    'validation',
  ]);
  assert.equal(
    registerErrorRef,
    '#/components/schemas/ValidationErrorResponse',
  );
});

test('documents MongoDB ObjectId path parameters', () => {
  const idParameters = Object.values(openApiSpec.paths).flatMap((pathItem) =>
    Object.values(pathItem).flatMap((operation) =>
      (operation.parameters ?? []).filter((parameter) =>
        ['articleId', 'id'].includes(parameter.name),
      ),
    ),
  );

  assert.ok(idParameters.length > 0);
  for (const parameter of idParameters) {
    assert.equal(parameter.schema.pattern, '^[0-9a-fA-F]{24}$');
  }
});
