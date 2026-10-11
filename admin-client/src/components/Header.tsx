import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { 
  Search, Bell, MessageSquare, MoreHorizontal, Check, 
  Trash2, Shield, ShoppingCart, LogOut, 
  Sparkles, Send, X, ArrowRight, Inbox,
  Zap, LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface HeaderProps {
  title: string;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'system' | 'credits' | 'leads';
}

const Header = ({ title }: HeaderProps) => {
  const { user, setUser, setToken, setTopUpOpen } = useStore();
  const navigate = useNavigate();

  // Modal / Dropdown states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Support / feedback message state
  const [msgInput, setMsgInput] = useState('');
  const [msgCategory, setMsgCategory] = useState<'support' | 'outreach'>('support');
  const [msgSent, setMsgSent] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Real-time Scraper Engine Online',
      desc: 'Headless Puppeteer scraper is active and listening for local business searches.',
      time: 'Just now',
      read: false,
      type: 'system'
    },
    {
      id: '2',
      title: 'Cloud Firestore Connected',
      desc: 'Production database synchronized with your Google Cloud project.',
      time: '5m ago',
      read: false,
      type: 'system'
    },
    {
      id: '3',
      title: 'Lead Credits Balance',
      desc: `You currently have ${user?.lead_credits ?? 100} credits available.`,
      time: '1h ago',
      read: false,
      type: 'credits'
    }
  ]);

  // Dropdown reference handlers for outside click
  const notifRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsMsgOpen(false);
        setIsMoreOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setMsgSent(true);
    setTimeout(() => {
      setMsgInput('');
      setMsgSent(false);
      setIsMsgOpen(false);
    }, 1200);
  };

  // Quick navigation items for Search Modal
  const quickNav = [
    { name: 'Dashboard', path: '/', hint: 'Command Center & Real-time Stream' },
    { name: 'CRM Pipeline', path: '/crm', hint: 'Kanban & Table Lead Pipeline' },
    { name: 'Outreach Center', path: '/outreach', hint: 'Automated Email & WhatsApp Outreach' },
    ...(user?.role === 'SUPER_ADMIN' ? [{ name: 'Super Admin Panel', path: '/admin', hint: 'Platform metrics & user management' }] : [])
  ];

  const filteredNav = quickNav.filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.hint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-[90px] px-8 flex items-center justify-between border-b border-[#E4E4E7] bg-white shrink-0 relative z-30">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#09090B]">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* 1. SEARCH BUTTON & COMMAND PALETTE */}
        <div className="relative">
          <button 
            onClick={() => setIsSearchOpen(true)}
            title="Global Search (Ctrl+K)"
            className="w-10 h-10 rounded-full border border-[#E4E4E7] flex items-center justify-center text-gray-600 hover:text-[#09090B] hover:bg-[#F4F4F5] transition-all hover:border-gray-400 shadow-sm"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* 2. NOTIFICATIONS BELL & DROPDOWN */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen((prev) => !prev);
              setIsMoreOpen(false);
            }}
            title="Notifications"
            className="w-10 h-10 rounded-full border border-[#E4E4E7] flex items-center justify-center text-gray-600 hover:text-[#09090B] hover:bg-[#F4F4F5] relative transition-all hover:border-gray-400 shadow-sm"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-84 sm:w-96 bg-white border border-[#E4E4E7] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#09090B]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead} 
                      className="text-gray-500 hover:text-accent font-medium transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications} 
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Clear all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E4E7]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 text-gray-300" />
                    <span>No notifications right now</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 transition-colors hover:bg-[#FAFAFA] flex items-start gap-3 ${!item.read ? 'bg-accent/5' : ''}`}
                    >
                      <div className="mt-0.5">
                        {item.type === 'credits' ? (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className={`text-xs font-bold leading-none ${!item.read ? 'text-[#09090B]' : 'text-gray-700'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-[#F4F4F5] border-t border-[#E4E4E7] text-center">
                <span className="text-[11px] text-gray-500">Live system telemetry synchronized</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. MESSAGES / QUICK SUPPORT MODAL BUTTON */}
        <div className="relative">
          <button 
            onClick={() => setIsMsgOpen(true)}
            title="Messages & Quick Outreach"
            className="w-10 h-10 rounded-full border border-[#E4E4E7] flex items-center justify-center text-gray-600 hover:text-[#09090B] hover:bg-[#F4F4F5] transition-all hover:border-gray-400 shadow-sm"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* 4. MORE HORIZONTAL / QUICK ACTIONS MENU */}
        <div className="relative" ref={moreRef}>
          <button 
            onClick={() => {
              setIsMoreOpen((prev) => !prev);
              setIsNotifOpen(false);
            }}
            title="More Options"
            className="w-10 h-10 rounded-full border border-[#E4E4E7] flex items-center justify-center text-gray-600 hover:text-[#09090B] hover:bg-[#F4F4F5] transition-all hover:border-gray-400 shadow-sm"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Quick Actions Dropdown */}
          {isMoreOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-[#E4E4E7] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-[#E4E4E7] bg-[#FAFAFA]">
                <p className="text-xs font-bold text-[#09090B] truncate">{user?.name || 'LeadPulse User'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'user@leadpulse.io'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user?.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Standard Member'}
                  </span>
                  <span className="text-[10px] text-gray-400">• {user?.lead_credits ?? 100} credits</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5 text-xs font-medium text-gray-700">
                <button 
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-accent/10 hover:text-accent font-bold transition-colors text-left"
                >
                  <LayoutDashboard className="w-4 h-4 text-accent" />
                  <span>Dashboard Overview</span>
                </button>

                <button 
                  onClick={() => {
                    setIsMoreOpen(false);
                    setTopUpOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F4F4F5] hover:text-[#09090B] transition-colors text-left"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>Buy Lead Top-Up</span>
                </button>

                <button 
                  onClick={() => {
                    setIsMoreOpen(false);
                    navigate('/outreach');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F4F4F5] hover:text-[#09090B] transition-colors text-left"
                >
                  <Send className="w-4 h-4 text-blue-500" />
                  <span>Outreach Center</span>
                </button>

                {user?.role === 'SUPER_ADMIN' && (
                  <button 
                    onClick={() => {
                      setIsMoreOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-700 font-semibold transition-colors text-left"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>Super Admin Panel</span>
                  </button>
                )}
              </div>

              <div className="border-t border-[#E4E4E7] p-1 mt-1">
                <button 
                  onClick={() => {
                    setIsMoreOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 font-semibold transition-colors text-left text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. INTERACTIVE GLOBAL SEARCH MODAL (CMD + K PALETTE)         */}
      {/* ============================================================ */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4">
          <div className="bg-white border border-[#E4E4E7] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#E4E4E7] flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search views, lead actions, or type a page name..."
                className="w-full bg-transparent text-sm font-medium outline-none text-[#09090B] placeholder:text-gray-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#F4F4F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-72 overflow-y-auto">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                Quick Navigation
              </p>
              {filteredNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigate(item.path);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#F4F4F5] text-left transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-[#09090B] group-hover:text-accent transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.hint}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </button>
              ))}

              {filteredNav.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">
                  No direct commands found for "{searchQuery}". Press Enter to search Google Maps.
                </div>
              )}
            </div>

            <div className="p-3 bg-[#FAFAFA] border-t border-[#E4E4E7] flex justify-between items-center text-[11px] text-gray-400 px-4">
              <span>Navigation shortcut: <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] text-gray-600">Esc</kbd> to close</span>
              <span>LeadPulse Command System</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. INTERACTIVE MESSAGES & FAST DISPATCH MODAL                */}
      {/* ============================================================ */}
      {isMsgOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E4E4E7] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#09090B]">LeadPulse Dispatch & Support</h3>
                  <p className="text-xs text-gray-500">Fast contact center and priority support</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMsgOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#F4F4F5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex bg-[#F4F4F5] p-1 rounded-xl mb-4 text-xs font-bold">
                <button 
                  onClick={() => setMsgCategory('support')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${msgCategory === 'support' ? 'bg-white text-[#09090B] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Direct Support Query
                </button>
                <button 
                  onClick={() => setMsgCategory('outreach')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${msgCategory === 'outreach' ? 'bg-white text-[#09090B] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Quick Outreach Draft
                </button>
              </div>

              {msgSent ? (
                <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-green-900">Message Dispatched!</h4>
                  <p className="text-xs text-green-700 mt-1">Your query has been logged and queued for response.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {msgCategory === 'support' ? 'What can we help you with?' : 'Outreach Message Template / Note'}
                    </label>
                    <textarea 
                      rows={4}
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      placeholder={msgCategory === 'support' ? 'Describe any request, bug report, or feature priority...' : 'Draft a custom message note for your next lead outreach batch...'}
                      className="w-full bg-white border border-[#E4E4E7] rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-accent resize-none placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-gray-400">Response turnaround: ~5 mins</span>
                    <button 
                      type="submit"
                      className="bg-[#09090B] hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Dispatch</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
