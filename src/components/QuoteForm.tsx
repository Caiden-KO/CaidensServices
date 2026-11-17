import { useState } from 'react';
import { Send, Loader2, CheckCircle2, Mail, User, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { projectTypes, budgetRanges, timelineOptions } from '@/lib/data';

export default function QuoteForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    project_type: 'website' as const,
    budget: '',
    timeline: '',
    description: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase.from('quote_requests').insert({
      name: form.name,
      email: form.email,
      company: form.company || null,
      project_type: form.project_type,
      budget: form.budget || null,
      timeline: form.timeline || null,
      description: form.description,
    });

    if (error) {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again or email me directly.');
      return;
    }

    setStatus('success');
    setForm({
      name: '',
      email: '',
      company: '',
      project_type: 'website',
      budget: '',
      timeline: '',
      description: '',
    });
  };

  if (status === 'success') {
    return (
      <section id="quotes" className="bg-pink-50 py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-pink-200 bg-white p-12 text-center shadow-lg shadow-pink-200/30">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
              <CheckCircle2 className="h-8 w-8 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quote Request Sent!</h2>
            <p className="mt-3 text-gray-600">
              Thanks for reaching out! I'll review your project details and email you
              back with a personalized quote as soon as I can.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 rounded-xl border border-pink-300 bg-white px-6 py-3 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-50"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quotes" className="bg-pink-50 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Get a Free Quote
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tell me about your project and I'll email you a personalized quote. No
            obligation, no pressure — I'm happy to just talk through your idea.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-6 rounded-2xl border border-pink-200 bg-white p-8 shadow-lg shadow-pink-200/30"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-300" />
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-300" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="jane@example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company Name (optional)
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-300" />
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Project Type
              </label>
              <select
                value={form.project_type}
                onChange={(e) =>
                  setForm({ ...form, project_type: e.target.value as typeof form.project_type })
                }
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 px-4 text-gray-900 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                {projectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Budget
              </label>
              <select
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 px-4 text-gray-900 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">Select range</option>
                {budgetRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Timeline
              </label>
              <select
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 px-4 text-gray-900 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="">Select timeline</option>
                {timelineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Project Details *
            </label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-pink-200 bg-pink-50/50 py-3 px-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              placeholder="Tell me about what you need built, any features you want, examples of sites you like, etc."
            />
          </div>

          {status === 'error' && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 text-base font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Quote Request
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500">
            I'll get back to your email as soon as I can.
          </p>
        </form>
      </div>
    </section>
  );
}
