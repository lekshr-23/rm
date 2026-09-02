import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE_NAME = 'rm_session';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

export type SessionUser = {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'driver';
};

type SessionPayload = SessionUser & { iat: number };

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is not configured. Set it in .env.local before enabling login.');
  }

  return secret;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = { ...user, iat: Date.now() };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (Date.now() - payload.iat > SESSION_MAX_AGE_SECONDS * 1000) {
      return null;
    }

    return { id: payload.id, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
};
