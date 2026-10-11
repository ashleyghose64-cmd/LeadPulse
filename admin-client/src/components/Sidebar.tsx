import { useStore } from '../store/useStore';
import { 
  Search, LayoutDashboard, Settings, 
  MessageSquare, Target, Activity, Mail
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, setTopUpOpen } = useStore();
  const location = useLocation();

  // Interchanged positions: Outreach Center is first, then CRM Pipeline, then Lead Finder
  const navItems = [
    { name: 'Outreach Center', path: '/outreach', icon: Mail },
    { name: 'CRM Pipeline', path: '/crm', icon: Target },
    { name: 'Lead Finder', path: '/finder', icon: Search },
    { name: 'Analytics', path: '/analytics', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Settings });
  }

  const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <div className="w-[260px] bg-white border-r border-[#E4E4E7] flex flex-col justify-between py-6 shrink-0 h-screen sticky top-0">
      <div>
        <div className="px-6 flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-sm shadow-accent/20">
            <span className="text-white font-bold text-xl leading-none">N</span>
          </div>
          <span className="font-bold text-xl tracking-tight">LeadPulse</span>
        </div>
        
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#F4F4F5] text-[#09090B] font-semibold shadow-sm border border-[#E4E4E7]/50' 
                    : 'text-gray-500 hover:bg-[#F4F4F5]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} /> {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4">
        {/* Profile Card Section with Integrated Dashboard Navigation */}
        <div className="bg-white border border-[#E4E4E7] p-3 rounded-xl shadow-sm mb-3">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">{user?.name || 'Alex R.'}</div>
              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
              </div>
            </div>
          </div>

          {/* Moved Dashboard Link Inside Profile Section */}
          <Link 
            to="/dashboard"
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all mb-1 ${
              isDashboardActive 
                ? 'bg-accent text-white shadow-xs' 
                : 'text-gray-700 hover:bg-[#F4F4F5] hover:text-[#09090B]'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className={`w-3.5 h-3.5 ${isDashboardActive ? 'text-white' : 'text-accent'}`} />
              <span>Dashboard Overview</span>
            </div>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
              isDashboardActive ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'
            }`}>
              HQ
            </span>
          </Link>

          <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-charcoal py-1 cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5" /> Feedback & Support
          </button>
        </div>

        <button 
          onClick={() => setTopUpOpen(true)} 
          className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl py-3 font-semibold shadow-md shadow-accent/20 transition-colors flex items-center justify-center gap-2 mb-2 cursor-pointer"
        >
          Upgrade Tier <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">3</span>
        </button>
        <button 
          onClick={() => { useStore.getState().setToken(null); useStore.getState().setUser(null); }} 
          className="w-full bg-white border border-[#E4E4E7] hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-xl py-2.5 font-semibold transition-colors text-sm cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
