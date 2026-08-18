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
