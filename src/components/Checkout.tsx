import { useState } from 'react';
import {
  Ticket,
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { supabase, type Coupon } from '@/lib/supabase';
import { pricingPlans } from '@/lib/data';

type CheckoutProps = {
  selectedPlanId: string;
  onNavigate: (page: string) => void;
};

export default function Checkout({ selectedPlanId, onNavigate }: CheckoutProps) {
  const plan =
    pricingPlans.find((p) => p.id === selectedPlanId) || pricingPlans[0];

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponStatus, setCouponStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');
  const [couponMessage, setCouponMessage] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? (plan.price * Number(appliedCoupon.discount_value)) / 100
      : Math.min(Number(appliedCoupon.discount_value), plan.price)
    : 0;

  const total = Math.max(plan.price - discountAmount, 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus('checking');
    setCouponMessage('');
    setAppliedCoupon(null);

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase().trim())
      .eq('active', true)
      .maybeSingle();

    if (error || !data) {
      setCouponStatus('invalid');
      setCouponMessage('Coupon code not found or inactive');
      return;
    }

    const now = new Date();
    if (data.expires_at && new Date(data.expires_at) < now) {
      setCouponStatus('invalid');
      setCouponMessage('This coupon has expired');
      return;
    }

    if (data.max_uses !== null && data.times_used >= data.max_uses) {
      setCouponStatus('invalid');
      setCouponMessage('This coupon has reached its usage limit');
      return;
    }

    setCouponStatus('valid');
    setAppliedCoupon(data as Coupon);
    setCouponMessage(
      data.discount_type === 'percentage'
        ? `${data.discount_value}% discount applied!`
        : `$${Number(data.discount_value).toFixed(0)} discount applied!`
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponStatus('idle');
    setCouponMessage('');
  };

  const handleCheckout = async () => {
    if (appliedCoupon) {
      await supabase
        .from('coupons')
        .update({ times_used: appliedCoupon.times_used + 1 })
        .eq('id', appliedCoupon.id);
    }
    setOrderComplete(true);
  };

  if (orderComplete) {
    return (
      <section className="min-h-screen bg-pink-50 py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-pink-200 bg-white p-12 text-center shadow-lg shadow-pink-200/30">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Order Started!</h2>
            <p className="mt-3 text-gray-600">
              You've selected the <strong className="text-gray-900">{plan.name}</strong> plan
              {total < plan.price && (
                <> with a coupon discount applied</>
              )}. I'll reach out to your email shortly to kick things off and collect
              payment details.
            </p>
            <div className="mt-6 rounded-xl border border-pink-100 bg-pink-50/50 p-6 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium text-gray-900">{plan.name}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">Original Price</span>
                <span className="font-medium text-gray-900">
                  ${plan.price}
                </span>
              </div>
              {appliedCoupon && (
                <>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-500">Discount ({appliedCoupon.code})</span>
                    <span className="font-medium text-emerald-600">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="my-3 border-t border-pink-200" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-pink-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="mt-8 rounded-xl border border-pink-300 bg-white px-6 py-3 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-50"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-pink-50 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('pricing')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-pink-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </button>

        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Checkout
        </h2>
        <p className="mt-2 text-gray-600">
          Review your plan and apply a coupon code if you have one.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-pink-200 bg-white p-6 shadow-lg shadow-pink-200/20">
              <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project Details (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Tell me briefly what you need built..."
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-4">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <CreditCard className="h-5 w-5 text-pink-300" />
                    Payment details will be collected via email after your order is placed.
                  </div>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5" />
                  Secure payment via invoice link
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-pink-200 bg-white p-6 shadow-lg shadow-pink-200/20">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Ticket className="h-5 w-5 text-pink-500" />
                Coupon Code
              </h3>
              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponStatus === 'valid'}
                  className="flex-1 rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 font-mono text-gray-900 uppercase placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 disabled:opacity-50"
                  placeholder="SAVE20"
                />
                {couponStatus === 'valid' ? (
                  <button
                    onClick={removeCoupon}
                    className="rounded-xl border border-pink-300 px-5 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-pink-50"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={applyCoupon}
                    disabled={couponStatus === 'checking' || !couponCode.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-pink-100 px-5 py-3 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-200 disabled:opacity-50"
                  >
                    {couponStatus === 'checking' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                )}
              </div>

              {couponStatus === 'valid' && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {couponMessage}
                </div>
              )}
              {couponStatus === 'invalid' && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  {couponMessage}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-pink-200 bg-white p-6 shadow-lg shadow-pink-200/20">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Plan</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {plan.name}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${plan.price}
                    </span>
                  </div>
                </div>

                {appliedCoupon && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-600">Discount</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        -${discountAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Code: {appliedCoupon.code}
                    </div>
                  </div>
                )}

                <div className="border-t border-pink-100 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-pink-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  {total < plan.price && (
                    <p className="mt-1 text-xs text-emerald-600">
                      You saved ${(plan.price - total).toFixed(2)}!
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25"
              >
                Place Order
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                No payment now — you'll be billed via email invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
