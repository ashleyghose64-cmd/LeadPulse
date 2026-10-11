import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onBack?: () => void;
}

const Login = ({ onBack }: LoginProps) => {
  const { token, setToken, setUser } = useStore();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in via browser memory, automatically route to dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const res = await axios.post('http://localhost:3001/api/auth/google', {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name
      });
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google login failed', err);
      setError(err.response?.data?.error || 'Google authentication failed on server. Please sign in via email or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const res = await axios.post('http://localhost:3001/api/auth/register', { email, password, name });
        setToken(res.data.token);
        setUser(res.data.user);
      } else {
        const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
        setToken(res.data.token);
        setUser(res.data.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="w-full max-w-md bg-white rounded-md shadow-xl flex flex-col overflow-hidden border border-slate-200 relative">
        
        {onBack && (
          <button 
            type="button"
            onClick={onBack} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-8 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-3 bg-slate-100 border border-slate-200 rounded-sm text-[10px] font-delight font-semibold uppercase tracking-wider text-slate-600">
                LeadPulse Access Gateway
              </div>
              <h2 className="text-xl font-bold font-delight tracking-tight text-slate-900">
                {isSignUp ? 'Create Workspace Account' : 'Authenticate Session'}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {isSignUp ? 'Initialize your multi-channel prospecting engine.' : 'Enter your credentials to access your LeadPulse workspace.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-sm text-xs font-delight font-medium mb-5 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3.5 mb-5" autoComplete="on">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-[11px] font-delight font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs font-delight font-normal focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-[11px] font-delight font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                  Work Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs font-delight font-normal focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-[11px] font-delight font-semibold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs font-delight font-normal focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-delight font-semibold text-xs py-2.5 rounded-sm transition-colors border border-slate-800 shadow-xs cursor-pointer"
              >
                {isLoading ? 'Authenticating...' : isSignUp ? 'Create Workspace' : 'Sign In with Email'}
              </button>
            </form>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-200 w-full absolute"></div>
              <span className="bg-white px-3 text-[11px] font-delight font-semibold text-slate-400 relative z-10">OR PROVIDER ACCESS</span>
            </div>

            <div className="flex flex-col items-center gap-2.5 w-full">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google Sign-In popup could not complete. Please sign in via email or try again.');
                  }}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  width="320"
                />
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              {isSignUp ? 'Already provisioned?' : 'Need a workspace?'}{' '}
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-blue-600 font-medium hover:underline ml-1 cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
