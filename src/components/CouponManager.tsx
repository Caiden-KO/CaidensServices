import { useEffect, useState } from 'react';
import {
  Ticket,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pencil,
  X,
} from 'lucide-react';
import { supabase, type Coupon } from '@/lib/supabase';

type FormState = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  expires_at: string;
  max_uses: string;
  active: boolean;
};

const emptyForm: FormState = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  expires_at: '',
  max_uses: '',
  active: true,
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError('Failed to load coupons');
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false;
    return new Date(coupon.expires_at) < new Date();
  };

  const isExhausted = (coupon: Coupon) => {
    return coupon.max_uses !== null && coupon.times_used >= coupon.max_uses;
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.active) return { label: 'Inactive', color: 'slate', icon: XCircle };
    if (isExpired(coupon)) return { label: 'Expired', color: 'red', icon: XCircle };
    if (isExhausted(coupon))
      return { label: 'Used Up', color: 'amber', icon: AlertTriangle };
    return { label: 'Active', color: 'emerald', icon: CheckCircle2 };
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off`;
    }
    return `$${Number(coupon.discount_value).toFixed(0)} off`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description.trim(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      active: form.active,
    };

    if (payload.discount_value <= 0) {
      setError('Discount value must be greater than 0');
      setSaving(false);
      return;
    }

    if (form.discount_type === 'percentage' && payload.discount_value > 100) {
      setError('Percentage discount cannot exceed 100%');
      setSaving(false);
      return;
    }

    let result;
    if (editingId) {
      result = await supabase.from('coupons').update(payload).eq('id', editingId);
    } else {
      result = await supabase.from('coupons').insert(payload);
    }

    if (result.error) {
      setError(
        result.error.code === '23505'
          ? 'A coupon with that code already exists'
          : 'Failed to save coupon'
      );
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setSaving(false);
    fetchCoupons();
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().slice(0, 10)
        : '',
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      active: coupon.active,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon code? This cannot be undone.')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      setError('Failed to delete coupon');
      return;
    }
    fetchCoupons();
  };

  const cancelForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const statusColors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-300',
    red: 'bg-red-50 text-red-600 border-red-300',
    amber: 'bg-amber-50 text-amber-600 border-amber-300',
    slate: 'bg-gray-100 text-gray-500 border-gray-300',
  };

  return (
    <section id="coupons" className="min-h-screen bg-pink-50 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-300 bg-white px-4 py-1.5 text-sm font-medium text-pink-600 shadow-sm">
              <Ticket className="h-4 w-4" />
              Coupon Codes
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Manage Coupon Codes
            </h2>
            <p className="mt-2 text-gray-600">
              View, create, and track discount codes for your customers.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600"
            >
              <Plus className="h-4 w-4" />
              New Coupon
            </button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-2xl border border-pink-200 bg-white p-6 shadow-lg shadow-pink-200/20 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-lg p-2 text-gray-400 hover:bg-pink-50 hover:text-pink-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Coupon Code *
                </label>
                <input
                  required
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 uppercase placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="SAVE20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="20% off for new customers"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Discount Type
                </label>
                <select
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })
                  }
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Discount Value *
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder={form.discount_type === 'percentage' ? '20' : '10'}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Expiration Date (optional)
                </label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Max Uses (optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  className="w-full rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="100"
                />
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-5 w-5 rounded border-pink-300 bg-pink-50 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Active (customers can use this code)</span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-xl border border-pink-300 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-pink-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="rounded-2xl border border-pink-200 bg-white py-20 text-center shadow-lg shadow-pink-200/20">
              <Ticket className="mx-auto h-12 w-12 text-pink-300" />
              <p className="mt-4 text-lg text-gray-600">No coupon codes yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Create your first coupon to offer discounts at checkout.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-lg shadow-pink-200/20">
              <table className="w-full">
                <thead className="bg-pink-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-4 sm:px-6">Code</th>
                    <th className="hidden px-4 py-4 sm:table-cell">Discount</th>
                    <th className="hidden px-4 py-4 md:table-cell">Expires</th>
                    <th className="hidden px-4 py-4 sm:table-cell">Uses</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 bg-white">
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <tr key={coupon.id} className="transition-colors hover:bg-pink-50/50">
                        <td className="px-4 py-4 sm:px-6">
                          <div className="font-mono text-sm font-bold text-gray-900">
                            {coupon.code}
                          </div>
                          {coupon.description && (
                            <div className="mt-0.5 text-xs text-gray-400">
                              {coupon.description}
                            </div>
                          )}
                        </td>
                        <td className="hidden px-4 py-4 sm:table-cell">
                          <span className="text-sm font-medium text-pink-600">
                            {formatDiscount(coupon)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-4 md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(coupon.expires_at)}
                          </div>
                        </td>
                        <td className="hidden px-4 py-4 sm:table-cell">
                          <span className="text-sm text-gray-500">
                            {coupon.times_used}
                            {coupon.max_uses !== null && ` / ${coupon.max_uses}`}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[status.color]}`}
                          >
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(coupon)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-pink-100 hover:text-pink-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
