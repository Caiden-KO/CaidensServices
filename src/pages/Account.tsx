import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Loader2,
  Package,
  LogOut,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase, type Order } from '@/lib/supabase';

export default function Account() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setOrders((data as Order[]) || []);
          setOrdersLoading(false);
        });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'confirmed':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-300';
      case 'confirmed':
        return 'bg-blue-50 text-blue-600 border-blue-300';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-300';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-300';
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="rounded-2xl border border-pink-200 bg-white p-8 shadow-lg shadow-pink-200/20">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl font-bold text-white shadow-lg shadow-pink-300/40">
                {profile?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.username ?? 'User'}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                <div className="mt-2">
                  {profile?.two_factor_enabled ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      2FA Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                      <Shield className="h-3.5 w-3.5" />
                      2FA Not Set Up
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/security')}
                className="inline-flex items-center gap-2 rounded-xl border border-pink-300 bg-white px-5 py-2.5 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-50"
              >
                <Shield className="h-4 w-4" />
                Security Settings
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Orders section */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Package className="h-5 w-5 text-pink-500" />
              Your Orders
            </h2>
            <button
              onClick={() => navigate('/checkout')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600"
            >
              <Plus className="h-4 w-4" />
              New Order
            </button>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-pink-200 bg-white py-20 text-center shadow-lg shadow-pink-200/20">
              <Package className="mx-auto h-12 w-12 text-pink-300" />
              <p className="mt-4 text-lg text-gray-600">No orders yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Choose a plan to get started on your first project.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:from-pink-600 hover:to-rose-600"
              >
                View Pricing Plans
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-pink-200 bg-white p-6 shadow-lg shadow-pink-200/20 transition-all hover:border-pink-300"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.plan_name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor(order.status)}`}
                        >
                          {statusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(order.created_at)}
                        </span>
                        <span>Order #{order.id.slice(0, 8)}</span>
                        {order.coupon_code && (
                          <span className="text-pink-600">Coupon: {order.coupon_code}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {order.discount_amount > 0 && (
                        <div className="text-sm text-gray-400 line-through">
                          ${Number(order.original_price).toFixed(2)}
                        </div>
                      )}
                      <div className="text-2xl font-bold text-pink-600">
                        ${Number(order.total_price).toFixed(2)}
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="text-xs text-emerald-600">
                          Saved ${Number(order.discount_amount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
