import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, CheckCircle2, Copy, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { featureApi } from '../api/featureApi';
import toast from 'react-hot-toast';

const QrExchangeVerificationModal = ({ isOpen, onClose, request, onVerifiedSuccess }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (isOpen && request?._id) {
      fetchPass();
    }
  }, [isOpen, request]);

  const fetchPass = async () => {
    try {
      setLoading(true);
      const res = await featureApi.generateQrPass(request._id);
      if (res && res.data) {
        setQrData(res.data);
        setManualCode(res.data.qrCode);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate QR pass.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmScan = async () => {
    try {
      setConfirming(true);
      const res = await featureApi.confirmQrVerification(manualCode || qrData?.qrCode);
      toast.success('🎉 Physical exchange verified! Handshake complete.');
      if (onVerifiedSuccess) onVerifiedSuccess(res.data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'QR verification failed.');
    } finally {
      setConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center">
        <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
          <QrCode className="w-6 h-6 text-emerald-300" />
        </div>

        <h3 className="text-xl font-bold text-dark-900 font-editorial mb-1">
          QR Handshake Pass
        </h3>
        <p className="text-xs text-muted-600 mb-6">
          Meet in person at the agreed campus spot. Either student can present or scan this code to confirm physical transfer and unlock sustainability points.
        </p>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-forest-800" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* The QR Code Container */}
            <div className="p-6 bg-ivory-50 border border-forest-100 rounded-2xl inline-block shadow-inner">
              {qrData?.qrCode ? (
                <QRCodeSVG
                  value={qrData.qrCode}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="w-44 h-44 bg-gray-100 flex items-center justify-center text-xs text-muted-400">
                  QR Generating...
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-muted-500 tracking-wider block">
                Verification Passcode
              </span>
              <span className="font-mono text-sm font-bold text-forest-900 bg-forest-50 px-3 py-1 rounded-lg border border-forest-100 mt-1 inline-block">
                {qrData?.qrCode || 'SC-PASS-XXXX'}
              </span>
            </div>

            <div className="p-3 bg-forest-50 border border-forest-100 rounded-xl text-left text-xs text-forest-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Anti-Fraud Handshake Protection</span>
              </div>
              <p className="text-[11px] text-muted-600">
                Location: {qrData?.meetupLocation || 'Campus Public Zone'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline text-xs py-2 px-4 flex-1"
              >
                Close Pass
              </button>
              <button
                type="button"
                onClick={handleConfirmScan}
                disabled={confirming}
                className="btn-primary text-xs py-2 px-4 flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800"
              >
                {confirming ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm Handover</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrExchangeVerificationModal;

