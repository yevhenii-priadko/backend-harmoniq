import assert from 'node:assert/strict';
import test from 'node:test';
import { Segments } from 'celebrate';
import {
  buildUserProfileUpdate,
  updateCurrentUser,
} from './userController.js';
import { updateUserSchema } from '../validations/usersValidation.js';
import { User } from '../models/user.js';
import userRoutes from '../routes/userRoutes.js';
import { toAvatarUploadError } from '../middleware/multer.js';

const validateUpdateBody = (body) =>
  updateUserSchema[Segments.BODY].validate(body);

test('accepts usernames from 2 through 32 trimmed characters', () => {
  const shortest = validateUpdateBody({ username: '  Jo  ' });
  const longest = validateUpdateBody({ username: 'a'.repeat(32) });

  assert.equal(shortest.error, undefined);
  assert.equal(shortest.value.username, 'Jo');
  assert.equal(longest.error, undefined);
});

test('rejects usernames outside the allowed range and unknown fields', () => {
  assert.ok(validateUpdateBody({ username: 'a' }).error);
  assert.ok(validateUpdateBody({ username: 'a'.repeat(33) }).error);
  assert.ok(validateUpdateBody({ username: 'Valid', role: 'admin' }).error);
});

test('builds a username-only update', async () => {
  const update = await buildUserProfileUpdate({
    username: 'Updated name',
    userId: 'user-id',
  });

  assert.deepEqual(update, { username: 'Updated name' });
});

test('builds an avatar update using the supplied uploader', async () => {
  const file = { buffer: Buffer.from('avatar') };
  const calls = [];

  const update = await buildUserProfileUpdate({
    file,
    userId: 'user-id',
    uploadAvatar: async (buffer, userId) => {
      calls.push({ buffer, userId });
      return { secure_url: 'https://res.cloudinary.com/avatar.jpg' };
    },
  });

  assert.deepEqual(calls, [{ buffer: file.buffer, userId: 'user-id' }]);
  assert.deepEqual(update, {
    avatar: 'https://res.cloudinary.com/avatar.jpg',
  });
});

test('rejects an update without username or avatar', async () => {
  await assert.rejects(
    buildUserProfileUpdate({ userId: 'user-id' }),
    (error) => error.status === 400 && error.message === 'Provide a username or avatar',
  );
});

test('updates only the authenticated user and returns a sanitized response', async (t) => {
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;
  const calls = [];
  const safeUser = {
    _id: 'user-id',
    username: 'Updated name',
    email: 'user@example.com',
    avatar: null,
  };

  User.findByIdAndUpdate = (id, update, options) => {
    calls.push({ id, update, options, select: null });
    return {
      select: async (selection) => {
        calls[0].select = selection;
        return safeUser;
      },
    };
  };

  t.after(() => {
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  const req = {
    user: { _id: 'user-id' },
    body: { username: 'Updated name' },
  };
  const response = { statusCode: null, payload: null };
  const res = {
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(payload) {
      response.payload = payload;
      return this;
    },
  };

  await updateCurrentUser(req, res);

  assert.deepEqual(calls, [
    {
      id: 'user-id',
      update: { username: 'Updated name' },
      options: { new: true, runValidators: true },
      select: '_id username email avatar',
    },
  ]);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, { user: safeUser });
});

test('registers the private current-user update route in middleware order', () => {
  const layer = userRoutes.stack.find(
    (candidate) => candidate.route?.path === '/users/me',
  );

  assert.ok(layer, 'PATCH /users/me route is missing');
  assert.equal(layer.route.methods.patch, true);
  assert.equal(layer.route.stack.length, 4);
  assert.equal(layer.route.stack[0].handle.name, 'authenticate');
  assert.equal(layer.route.stack[1].handle.name, 'uploadAvatar');
  assert.equal(layer.route.stack[3].handle.name, 'updateCurrentUser');
});

test('maps avatar upload failures to client errors', () => {
  const oversized = toAvatarUploadError({
    code: 'LIMIT_FILE_SIZE',
    message: 'File too large',
  });
  const invalidType = toAvatarUploadError({
    message: 'Only images allowed',
  });

  assert.equal(oversized.status, 400);
  assert.equal(oversized.message, 'Maximum file size is 1 MB');
  assert.equal(invalidType.status, 400);
  assert.equal(invalidType.message, 'Only images allowed');
});
