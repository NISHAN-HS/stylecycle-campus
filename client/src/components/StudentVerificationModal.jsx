import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, KeyRound, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { featureApi } from '../api/featureApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const { user } = useAuth();
  const [collegeEmail, setCollegeEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [loading, setLoading] = useState(false);
  const [demoOtpHint, setDemoOtpHint] = useState('');

  useEffect(() => {
    if (user?.email) {
      setCollegeEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!collegeEmail || !collegeEmail.includes('@')) {
      toast.error('Please enter a valid campus email address.');
      return;
    }
    try {
      setLoading(true);
      const res = await featureApi.requestStudentOtp({
        collegeEmail,
        studentIdNumber: studentId,
      });
      toast.success(res.message || 'OTP generated!');
      if (res.demoOtp) {
        setDemoOtpHint(res.demoOtp);
      }
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the 6-digit OTP code.');
      return;
    }
    try {
      setLoading(true);
      const res = await featureApi.verifyStudentOtp({ otp: otp.trim() });
      toast.success('🎉 You are now a Verified Campus Student!');
      if (onVerified) onVerified(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-dark-900 font-editorial">
              Verified Campus Student System
            </h3>
            <p className="text-xs text-muted-600">
              Exclusive campus access with verified institution credentials
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5">
                Campus / Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@campus.edu or .ac.in"
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  className="input-field pl-10 text-xs py-2.5"
                />
              </div>
              <p className="text-[11px] text-muted-500 mt-1">
                Accepted domains: .edu, .ac.in, or university domains.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5">
                Student ID / Roll Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. STU-2024-8849"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="input-field text-xs py-2.5"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Send One-Time Passcode (OTP)</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-forest-50 border border-forest-100 rounded-xl text-xs text-forest-900">
              <p>Passcode sent to <strong className="font-semibold">{collegeEmail}</strong>.</p>
              {demoOtpHint && (
                <p className="mt-1 font-bold text-emerald-800">
                  Demo Fast-Pass OTP: <span className="underline">{demoOtpHint}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider mb-1.5">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field pl-10 text-center tracking-widest text-lg font-bold py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-muted-600 hover:text-dark-900 underline"
              >
                Change Email
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify & Activate Badge</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentVerificationModal;

