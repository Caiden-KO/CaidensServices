import { useState } from 'react';
import { Menu, X, Code2 } from 'lucide-react';

type NavProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'quotes', label: 'Get a Quote' },
];

export default function Navbar({ currentPage, onNavigate }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-gray-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 text-white">
            <Code2 className="h-5 w-5" />
          </span>
          <span>
            Caidens<span className="text-pink-500">Services</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === link.id
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <button
            onClick={() => handleNav('checkout')}
            className="rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25"
          >
            Start a Project
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-pink-50 hover:text-pink-600 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-pink-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  currentPage === link.id
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('checkout')}
              className="mt-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white"
            >
              Start a Project
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
