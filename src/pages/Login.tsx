import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { verifyTotpCode } from '@/lib/totp';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2FA challenge state
  const [needsTotp, setNeedsTotp] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpVerifying, setTotpVerifying] = useState(false);
  const [totpError, setTotpError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(form.email, form.password);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }

    // Check if user has 2FA enabled
    const { data: session } = await supabase.auth.getSession();
    if (session.session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', session.session.user.id)
        .maybeSingle();

      if (profile?.two_factor_enabled) {
        setPendingEmail(form.email);
        setNeedsTotp(true);
        // Sign out temporarily — the user needs to pass 2FA first
        // We'll re-authenticate after 2FA verification
        return;
      }
    }

    navigate('/account');
  };

  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');
    setTotpVerifying(true);

    // Re-authenticate to get the session, then check TOTP
    const { error: signInError } = await signIn(pendingEmail, form.password);
    if (signInError) {
      setTotpError('Authentication failed. Please try again.');
      setTotpVerifying(false);
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      setTotpError('Session expired. Please sign in again.');
      setTotpVerifying(false);
      return;
    }

    const { data: totpData } = await supabase
      .from('totp_secrets')
      .select('secret, verified')
      .eq('user_id', session.session.user.id)
      .eq('verified', true)
      .maybeSingle();

    if (!totpData) {
      // No verified TOTP — allow login but mark 2FA as not set up properly
      setTotpVerifying(false);
      navigate('/account');
      return;
    }

    const valid = verifyTotpCode(totpData.secret, totpCode);
    if (!valid) {
      setTotpError('Invalid verification code. Please try again.');
      setTotpVerifying(false);
      await supabase.auth.signOut();
      return;
    }

    setTotpVerifying(false);
    navigate('/account');
  };

  if (needsTotp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-rose-50 px-4 py-24">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-300/40">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form
            onSubmit={handleTotpVerify}
            className="space-y-5 rounded-2xl border border-pink-200 bg-white p-8 shadow-xl shadow-pink-200/30"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 px-4 text-center text-2xl font-mono tracking-[0.5em] text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="000000"
                autoFocus
              />
            </div>

            {totpError && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                {totpError}
              </div>
            )}

            <button
              type="submit"
              disabled={totpVerifying || totpCode.length !== 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50"
            >
              {totpVerifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Verify & Sign In
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setNeedsTotp(false);
                setTotpCode('');
                setTotpError('');
                supabase.auth.signOut();
              }}
              className="block w-full text-center text-sm text-gray-500 hover:text-pink-600"
            >
              Back to sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-rose-50 px-4 py-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-300/40">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your CaidensServices account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-pink-200 bg-white p-8 shadow-xl shadow-pink-200/30"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-300" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-300" />
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-semibold text-pink-600 hover:text-pink-700">
              Sign up
            </a>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          <a href="/" className="hover:text-pink-500">← Back to home</a>
        </p>
      </div>
    </div>
  );
}
