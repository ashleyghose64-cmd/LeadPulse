import { useState } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setToken, setUser } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      const res = await axios.post('http://localhost:3001/api/auth/google', {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name
      });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8F9FA] items-center justify-center p-4">
      <div className="w-full max-w-[1100px] h-[700px] bg-white rounded-3xl shadow-2xl flex overflow-hidden border border-[#E4E4E7]">
        
        {/* LEFT PANEL - Gradient & Copy */}
        <div className="w-5/12 relative overflow-hidden flex flex-col justify-between p-12 text-white" 
             style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)' }}>
          
          {/* Abstract Background Lines (Simulated with SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C30,60 70,60 100,0" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M0,80 C40,40 80,40 100,-20" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M-20,100 C20,60 60,60 100,20" stroke="white" strokeWidth="0.5" fill="none" />
            <path d="M0,120 C40,80 80,80 120,40" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>

          <div className="relative z-10">
            <div className="mb-12">
              {/* Asterisk Logo */}
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <path d="M2 12h20M5 17l14-10M5 7l14 10" />
              </svg>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-6">
              Hello<br/>LeadPulse! 👋
            </h1>
            
            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
              Skip repetitive and manual sales-marketing tasks. Get highly productive through automation and save tons of time!
            </p>
          </div>

          <div className="relative z-10 text-white/60 text-sm font-medium">
            © 2026 LeadPulse. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - Form */}
        <div className="w-7/12 p-12 flex flex-col relative">
          
          <div className="mb-12">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#09090B]">LeadPulse</span>
            </div>
          </div>

          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-[#09090B] mb-2">{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {isSignUp ? (
                <>Already have an account? <button onClick={() => setIsSignUp(false)} className="text-charcoal font-bold underline decoration-2 underline-offset-2">Login here.</button></>
              ) : (
                <>Don't have an account? <button onClick={() => setIsSignUp(true)} className="text-charcoal font-bold underline decoration-2 underline-offset-2">Create a new account now.</button><br/>It's FREE! Takes less than a minute.</>
              )}
            </p>

            {error && <div className="mb-4 text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              
              {isSignUp && (
                <div>
                  <input 
                    type="text" 
                    required
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-sm font-medium focus:border-[#09090B] outline-none transition-colors placeholder:text-gray-400"
                  />
                </div>
              )}

              <div>
                <input 
                  type="email" 
                  required
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-sm font-medium focus:border-[#09090B] outline-none transition-colors placeholder:text-gray-400"
                />
              </div>
              
              <div className="mb-8">
                <input 
                  type="password" 
                  required
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-sm font-medium focus:border-[#09090B] outline-none transition-colors placeholder:text-gray-400"
                />
              </div>

              <button type="submit" className="w-full bg-[#09090B] hover:bg-black text-white font-bold py-3.5 rounded-lg transition-colors mb-4 shadow-lg shadow-black/10">
                {isSignUp ? 'Sign Up Now' : 'Login Now'}
              </button>
            </form>

            <div className="flex justify-center w-full mt-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>

            {!isSignUp && (
              <div className="text-center mt-10">
                <a href="#" className="text-gray-500 text-sm hover:text-[#09090B] font-medium transition-colors">
                  Forgot password? <span className="font-bold underline decoration-2 underline-offset-2">Click here</span>
                </a>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
