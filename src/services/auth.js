import jwt from 'jsonwebtoken';
import { Session } from '../models/session.js';

const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

export const createSession = async (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '30d',
    },
  );

  const now = Date.now();

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + ACCESS_TOKEN_TTL),
    refreshTokenValidUntil: new Date(now + REFRESH_TOKEN_TTL),
  });

  return session;
};

export const setSessionCookies = (res, session) => {
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    sameSite: 'lax',
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    expires: session.accessTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    expires: session.refreshTokenValidUntil,
  });
};
