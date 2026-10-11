import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import axios from 'axios';

// Configure Axios Defaults for Admin
axios.defaults.headers.common['x-admin-gateway-token'] = import.meta.env.VITE_ADMIN_GATEWAY_SECRET || 'your_super_secret_cryptographic_gateway_token_here';

const App = () => {
  const { user, token } = useStore();

  if (!token) {
    return <Login />;
  }

  // Only allow SUPER_ADMIN or superadmin
  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have Super Admin privileges.</p>
          <button 
            onClick={() => useStore.getState().setToken(null)}
            className="px-4 py-2 bg-charcoal text-white rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper font-sans text-charcoal flex">
        <Routes>
          <Route path="/*" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
