import { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ArrowRight, Phone, Mail, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Owner Portal Login',
  description: 'Access your Surf or Sound property owner dashboard to view bookings, statements, and manage your vacation rental.',
};

export default function OwnerPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Owner Portal</h1>
          <p className="text-slate-400">Access your property dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Sign In to Portal
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Not a property owner yet?{' '}
              <Link href="/owners" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Learn about our services
              </Link>
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-4">Need help accessing your account?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:800-237-1138"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>800.237.1138</span>
            </a>
            <a
              href="mailto:owners@surforsound.com"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>owners@surforsound.com</span>
            </a>
          </div>
        </div>

        {/* Back to main site */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Surf or Sound
          </Link>
        </div>
      </div>
    </div>
  );
}
