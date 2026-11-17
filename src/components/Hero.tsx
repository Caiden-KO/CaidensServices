import { ArrowRight, Sparkles, CheckCircle2, Heart } from 'lucide-react';

type HeroProps = {
  onNavigate: (page: string) => void;
};

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 via-rose-50 to-white">
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-rose-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-300 bg-white/80 px-4 py-1.5 text-sm font-medium text-pink-600 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Web Development & Custom Coding Services
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Websites and code that
            <span className="block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              grow your business
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            I'm Caiden, a 16-year-old developer who builds websites, web apps, and
            custom code for individuals, businesses, and big companies. I'm still
            learning and growing, but I pour my heart into every project — fair
            prices, honest work, and real dedication.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => onNavigate('pricing')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-7 py-3.5 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-xl hover:shadow-pink-500/25"
            >
              View Pricing Plans
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('quotes')}
              className="inline-flex items-center gap-2 rounded-xl border border-pink-300 bg-white px-7 py-3.5 text-base font-semibold text-pink-600 transition-all hover:border-pink-400 hover:bg-pink-50"
            >
              Get a Free Quote
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-pink-500" />
              100% Custom Built
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-pink-500" />
              Affordable Rates
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-pink-500" />
              Honest & Upfront
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              Passion-Driven
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
