'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { login } from '@/app/actions/auth';

const roleHome: Record<string, string> = {
  admin: '/admin',
  user: '/bookings',
  driver: '/',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await login(username, password);
      const redirectTo = searchParams.get('redirect') || roleHome[user.role] || '/';
      router.push(redirectTo as never);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-600">Rental Management</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Use your admin, user, or driver account.</p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
            placeholder="jane.doe"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-brand-500"
            placeholder="••••••••"
          />
        </label>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}
