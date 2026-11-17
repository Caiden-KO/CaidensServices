import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Smartphone,
  Check,
  Trash2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { generateTotpSecret, buildTotpUri, generateQrCodeDataUrl, verifyTotpCode } from '@/lib/totp';

type Step = 'loading' | 'enroll' | 'verify' | 'enabled';

export default function Security() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('loading');
  const [secret, setSecret] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setStep(profile.two_factor_enabled ? 'enabled' : 'enroll');
    }
  }, [profile]);

  const startEnrollment = async () => {
    if (!user) return;
    setBusy(true);
    setError('');

    // Remove any old unverified secrets
    await supabase.from('totp_secrets').delete().eq('user_id', user.id).eq('verified', false);

    const newSecret = generateTotpSecret();
    const uri = buildTotpUri(newSecret, user.email ?? 'user');
    const qr = await generateQrCodeDataUrl(uri);

    const { error: insertError } = await supabase.from('totp_secrets').insert({
      user_id: user.id,
      secret: newSecret,
      verified: false,
    });

    if (insertError) {
      setError('Failed to start 2FA enrollment. Please try again.');
      setBusy(false);
      return;
    }

    setSecret(newSecret);
    setQrUrl(qr);
    setStep('verify');
    setBusy(false);
  };

  const confirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError('');

    // Verify the code
    const valid = verifyTotpCode(secret, totpCode);
    if (!valid) {
      setError('Invalid code. Please try again.');
      setBusy(false);
      return;
    }

    // Mark secret as verified
    const { error: updateError } = await supabase
      .from('totp_secrets')
      .update({ verified: true })
      .eq('user_id', user.id)
      .eq('secret', secret);

    if (updateError) {
      setError('Failed to verify. Please try again.');
      setBusy(false);
      return;
    }

    // Enable 2FA on profile
    await supabase.from('profiles').update({ two_factor_enabled: true }).eq('id', user.id);
    await refreshProfile();

    setBusy(false);
    setStep('enabled');
  };

  const disable2FA = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return;

    setBusy(true);
    await supabase.from('totp_secrets').delete().eq('user_id', user.id);
    await supabase.from('profiles').update({ two_factor_enabled: false }).eq('id', user.id);
    await refreshProfile();
    setBusy(false);
    setStep('enroll');
    setTotpCode('');
    setQrUrl('');
    setSecret('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-pink-50 py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/account')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-pink-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </button>

        <div className="rounded-2xl border border-pink-200 bg-white p-8 shadow-xl shadow-pink-200/30">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-300/40">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage two-factor authentication for your account
              </p>
            </div>
          </div>

          {/* Step: Enabled */}
          {step === 'enabled' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-700">
                      Two-Factor Authentication is Active
                    </h3>
                    <p className="mt-1 text-sm text-emerald-600">
                      Your account is protected with an authenticator app. You'll need
                      to enter a verification code each time you sign in.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={disable2FA}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldOff className="h-4 w-4" />
                )}
                Disable 2FA
              </button>
            </div>
          )}

          {/* Step: Enroll (not yet enabled) */}
          {step === 'enroll' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-6">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-pink-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Set Up Two-Factor Authentication
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Protect your account with an extra layer of security. You'll need
                      an authenticator app like Google Authenticator, Authy, or 1Password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl bg-gray-50 p-6">
                <h4 className="text-sm font-semibold text-gray-700">How it works:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">1</span>
                    Download an authenticator app on your phone
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">2</span>
                    Scan the QR code with the app
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">3</span>
                    Enter the 6-digit code the app generates to confirm
                  </li>
                </ol>
              </div>

              <button
                onClick={startEnrollment}
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-5 w-5" />
                    Begin Setup
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step: Verify QR code */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Scan this QR code
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Open your authenticator app and scan the code below
                </p>
              </div>

              <div className="flex justify-center">
                {qrUrl && (
                  <div className="rounded-2xl border-2 border-pink-200 bg-white p-4">
                    <img src={qrUrl} alt="2FA QR Code" className="h-48 w-48" />
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Can't scan? Enter this code manually:
                </p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-800">
                  {secret}
                </p>
              </div>

              <form onSubmit={confirmVerification} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Enter the 6-digit verification code
                  </label>
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || totpCode.length !== 6}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Confirm & Enable 2FA
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
