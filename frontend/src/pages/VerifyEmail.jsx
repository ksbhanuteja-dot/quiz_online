import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ loading: true, message: '', success: false });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus({ loading: false, message: 'Missing verification token.', success: false });
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus({ loading: false, message: response.data.message || 'Email verified successfully.', success: true });
      } catch (err) {
        setStatus({
          loading: false,
          message: err.response?.data?.detail || err.response?.data?.message || 'Invalid or expired verification token.',
          success: false,
        });
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-sm border border-slate-200">
        {status.loading ? (
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            <p className="text-sm text-slate-600">Verifying your email...</p>
          </div>
        ) : (
          <div className="text-center">
            {status.success ? (
              <div>
                <CheckCircle2 size={52} className="mx-auto text-emerald-600" />
                <h2 className="mt-6 text-2xl font-bold text-slate-900">Email Verified!</h2>
              </div>
            ) : (
              <div>
                <XCircle size={52} className="mx-auto text-red-600" />
                <h2 className="mt-6 text-2xl font-bold text-slate-900">Verification Failed</h2>
              </div>
            )}

            <p className={`mt-4 text-sm ${status.success ? 'text-slate-600' : 'text-red-600'}`}>{status.message}</p>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
