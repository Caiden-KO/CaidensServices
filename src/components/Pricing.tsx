import { Check, Star, ArrowRight, Heart } from 'lucide-react';
import { pricingPlans } from '@/lib/data';

type PricingProps = {
  onNavigate: (page: string) => void;
  onSelectPlan: (planId: string) => void;
};

export default function Pricing({ onNavigate, onSelectPlan }: PricingProps) {
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-pink-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Simple, affordable pricing. I'm 16 and still learning, so my rates are
            way lower than agencies — but I give every project my full effort. Have
            a coupon code? Apply it at checkout for an extra discount.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.popular
                  ? 'border-pink-400 bg-white shadow-2xl shadow-pink-200/50 lg:scale-105'
                  : 'border-pink-100 bg-white/80 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-200/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-white" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-gray-500">starting</span>
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  onSelectPlan(plan.id);
                  onNavigate(plan.id === 'enterprise' ? 'quotes' : 'checkout');
                }}
                className={`group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25'
                    : 'border border-pink-300 bg-white text-pink-600 hover:bg-pink-50 hover:border-pink-400'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
          <span>Every project helps me learn and grow as a developer — thank you for your support!</span>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Need something custom?{' '}
          <button
            onClick={() => onNavigate('quotes')}
            className="font-medium text-pink-600 hover:text-pink-700"
          >
            Request a personalized quote
          </button>
        </p>
      </div>
    </section>
  );
}
