import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSubmitted(true);
      if (res.demoResetToken) {
        setDemoToken(res.demoResetToken);
      }
      toast.success('Password reset instructions sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to request password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-border rounded-3xl p-8 shadow-card animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 font-editorial">
            Forgot Password?
          </h1>
          <p className="text-xs text-muted-600 mt-1">
            Enter your college email address to receive password reset instructions.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-dark-900 font-medium">
              Check your inbox for a reset link.
            </p>
            <p className="text-xs text-muted-500">
              We've dispatched password recovery details to <strong>{email}</strong>.
            </p>

            {demoToken && (
              <div className="mt-4 p-3 bg-ivory-100 border border-border rounded-xl text-left">
                <p className="text-xs font-semibold text-forest-800 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Dev Reset Link:
                </p>
                <Link
                  to={`/reset-password?token=${demoToken}&email=${encodeURIComponent(email)}`}
                  className="text-xs text-forest-700 underline break-all font-mono"
                >
                  Click to Reset Password Immediately &rarr;
                </Link>
              </div>
            )}

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-forest-800 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-800 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-border rounded-xl text-sm text-dark-900 focus:outline-none focus:border-forest-600 transition"
                  required
                />
                <Mail className="w-4 h-4 text-muted-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-sm"
            >
              {submitting ? 'Sending Link...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-600 hover:text-dark-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
