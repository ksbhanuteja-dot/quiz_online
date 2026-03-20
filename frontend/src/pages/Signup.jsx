import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Brain, ArrowRight, Loader } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { name, email, password, confirmPassword, role } = formData;
      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
        confirm_password: confirmPassword,
        role,
      });

      if (response.data?.message) {
        navigate('/login', {
          replace: true,
          state: {
            signupSuccess: true,
            email,
          },
        });
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to create account. Please try again.');
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
              Create an account
            </h2>
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all hover:ring-slate-400 bg-white"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all hover:ring-slate-400 bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all hover:ring-slate-400 bg-white"
                    placeholder="********"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all hover:ring-slate-400 bg-white"
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                  I am a...
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 transition-all bg-white"
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? <Loader size={20} className="animate-spin" /> : 'Create Account'}
                  {!isLoading && <ArrowRight size={20} />}
                </button>
              </div>
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
                Join thousands of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">educators</span> and learners.
              </h2>
              <p className="text-slate-300 text-xl leading-relaxed font-medium">
                Build interactive quizzes, measure real-time performance, and unlock your true potential today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
