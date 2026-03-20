import { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import api from '../api/axios';
import { Brain, ArrowRight, Loader } from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (location.state?.signupSuccess) {
      setInfoMessage('Account created successfully. Please log in to continue.');
      setEmail(location.state.email ?? '');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.detail;
      const message = serverMessage || 'Failed to login. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-900 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-3 mb-8 text-primary-600">
            <div className="p-2.5 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200">
              <Brain size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">QuizOnline</h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Sign up today
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all hover:ring-slate-400 bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <button type="button" className="text-xs font-semibold text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all hover:ring-slate-400 bg-white"
                  placeholder="********"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600">
                  Remember me
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              {infoMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-1">
                  {infoMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? <Loader size={20} className="animate-spin" /> : 'Log in'}
                {!isLoading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-primary-900">
        <div className="absolute inset-0 h-full w-full bg-slate-950 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

          <div className="relative h-full w-full flex flex-col items-center justify-center p-20 z-10">
            <div className="max-w-xl text-center">
              <div className="mb-8 inline-flex p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <Brain size={40} className="text-white" />
              </div>
              <h2 className="text-5xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
                Empower your teaching with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">data-driven</span> quizzes.
              </h2>
              <p className="text-slate-300 text-xl leading-relaxed font-medium">
                Create engaging assessments, track real-time analytics, and help your students succeed like never before.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
