'use server';

import { cookies } from 'next/headers';

import { supabase } from '@/lib/supabase';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions, type SessionUser } from '@/lib/session';

export async function login(username: string, password: string): Promise<SessionUser> {
  const trimmedUsername = username.trim();

  if (!trimmedUsername || !password) {
    throw new Error('Username and password are required.');
  }

  const { data, error } = await supabase.rpc('verify_app_user', {
    p_username: trimmedUsername,
    p_password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const user = data?.[0] as SessionUser | undefined;

  if (!user) {
    throw new Error('Invalid username or password.');
  }

  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);

  return user;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
