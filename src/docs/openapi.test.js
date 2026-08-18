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
