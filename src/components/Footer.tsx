import { Code2, Mail, Github, Twitter, Linkedin, Heart } from 'lucide-react';

type FooterProps = {
  onNavigate: (page: string) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-pink-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                <Code2 className="h-4 w-4" />
              </span>
              <span>
                Caidens<span className="text-pink-500">Services</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              Web development and custom coding by Caiden, a 16-year-old developer
              building websites for individuals, businesses, and big companies.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('pricing')}
                  className="text-gray-600 transition-colors hover:text-pink-600"
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quotes')}
                  className="text-gray-600 transition-colors hover:text-pink-600"
                >
                  Get a Quote
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('coupons')}
                  className="text-gray-600 transition-colors hover:text-pink-600"
                >
                  Coupon Codes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="text-gray-600 transition-colors hover:text-pink-600"
                >
                  Services
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Get In Touch
            </h4>
            <a
              href="mailto:caiden@caidensservices.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-pink-600"
            >
              <Mail className="h-4 w-4" />
              caiden@caidensservices.com
            </a>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-pink-200 text-gray-500 transition-colors hover:border-pink-400 hover:text-pink-600"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-pink-200 text-gray-500 transition-colors hover:border-pink-400 hover:text-pink-600"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-pink-200 text-gray-500 transition-colors hover:border-pink-400 hover:text-pink-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-pink-100 pt-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1.5">
            &copy; {new Date().getFullYear()} CaidensServices. Made with
            <Heart className="h-3.5 w-3.5 text-pink-400 fill-pink-400" />
            by Caiden
          </p>
        </div>
      </div>
    </footer>
  );
}
