import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { 
  Users, ArrowLeft, Activity, DollarSign, 
  RefreshCw, Cpu, Send, Trash2, CheckCircle2,
  AlertTriangle, Download, Search, Zap,
  Server, Database,
  ShieldCheck, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'overview' | 'scraper' | 'credits' | 'users' | 'outreach' | 'leads';

const AdminPanel = () => {
  const { user } = useStore();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    totalRevenue: 0,
    scraper: { activeWorkers: 0, queuedJobs: 0, status: 'IDLE' },
    system: { database: 'Google Cloud Firestore', uptime: 0, nodeVersion: '', memoryUsage: '0 MB' }
  });

  // 2. Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'USER'>('ALL');

  // 3. System Workflow Settings State
  const [settings, setSettings] = useState({
    freeCreditsOnSignup: 15,
    creditCostPerSearch: 1,
    scraperConcurrency: 2,
    scrapeTimeoutSecs: 30,
    proxyRotation: false,
    deepEnrichment: true,
    smtpProvider: 'System Nodemailer / SendGrid',
    maxOutreachPerHour: 50,
    complianceFooterEnforced: true,
    suppressionList: ['test@example.com', 'spam@domain.com']
  });
  const [newSuppressionItem, setNewSuppressionItem] = useState('');

  // 4. Global Leads State
  const [globalLeads, setGlobalLeads] = useState<any[]>([]);
  const [leadSearch, setLeadSearch] = useState('');

  // Custom Credit Adjustment Modal
  const [creditModalUser, setCreditModalUser] = useState<any | null>(null);
  const [creditAdjustmentAmount, setCreditAdjustmentAmount] = useState('100');
  const [creditAdjustmentMode, setCreditAdjustmentMode] = useState<'add' | 'set'>('add');

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const fetchAllData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const headers = { userid: user._id };
      const [statsRes, usersRes, settingsRes, leadsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/v1/stats', { headers }).catch(() => ({ data: stats })),
        axios.get('http://localhost:3001/api/admin/v1/users', { headers }).catch(() => ({ data: [] })),
        axios.get('http://localhost:3001/api/admin/v1/settings', { headers }).catch(() => ({ data: settings })),
        axios.get('http://localhost:3001/api/admin/v1/leads', { headers }).catch(() => ({ data: [] }))
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setSettings(settingsRes.data);
      setGlobalLeads(leadsRes.data);
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to sync admin data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Adjust User Credits
  const handleUpdateCredits = async (userId: string, amount: number, mode: 'add' | 'set' = 'add') => {
    try {
      await axios.post(
        `http://localhost:3001/api/admin/v1/users/${userId}/credits`,
        { amount, mode },
        { headers: { userid: user?._id } }
      );
      showNotification(`Successfully updated credits for user.`);
      setCreditModalUser(null);
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to update credits', true);
    }
  };

  // Change Role
  const handleChangeRole = async (userId: string, newRole: 'SUPER_ADMIN' | 'USER') => {
    try {
      await axios.post(
        `http://localhost:3001/api/admin/v1/users/${userId}/role`,
        { role: newRole },
        { headers: { userid: user?._id } }
      );
      showNotification(`User role updated to ${newRole}.`);
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to update role', true);
    }
  };

  // Reset Onboarding
  const handleResetOnboarding = async (userId: string) => {
    try {
      await axios.post(
        `http://localhost:3001/api/admin/v1/users/${userId}/reset-onboarding`,
        {},
        { headers: { userid: user?._id } }
      );
      showNotification('Onboarding flow reset for user.');
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to reset onboarding', true);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${email}? This action is irreversible.`)) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/v1/users/${userId}`, {
        headers: { userid: user?._id }
      });
      showNotification(`User ${email} deleted successfully.`);
      fetchAllData();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to delete user', true);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      await axios.post('http://localhost:3001/api/admin/v1/settings', settings, {
        headers: { userid: user?._id }
      });
      showNotification('Workflow settings and platform economics saved successfully!');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to save settings', true);
    }
  };

  // Flush Scraper Queue
  const handleClearScraperQueue = async () => {
    try {
      const res = await axios.post('http://localhost:3001/api/admin/v1/scraper/clear', {}, {
        headers: { userid: user?._id }
      });
      showNotification(`Scraper queue cleared. Dropped ${res.data.droppedJobs} pending jobs.`);
      fetchAllData();
    } catch (err: any) {
      showNotification('Failed to clear queue', true);
    }
  };

  // Purge All Leads
  const handlePurgeLeads = async () => {
    if (!confirm('DANGER: This will delete ALL leads across the entire database. Are you absolutely certain?')) return;
    try {
      const res = await axios.delete('http://localhost:3001/api/admin/v1/leads/purge', {
        headers: { userid: user?._id }
      });
      showNotification(`Purged ${res.data.deletedCount} leads from Firestore.`);
      fetchAllData();
    } catch (err: any) {
      showNotification('Failed to purge leads', true);
    }
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    if (globalLeads.length === 0) {
      showNotification('No leads available to export', true);
      return;
    }
    const headers = ['Business Name', 'Category', 'Phone', 'Website', 'Rating', 'Location', 'Created At'];
    const rows = globalLeads.map((l) => [
      `"${l.businessName || ''}"`,
      `"${l.category || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.website || ''}"`,
      `"${l.rating || ''}"`,
      `"${l.location || ''}"`,
      `"${l.createdAt || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadPulse_Master_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Master JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(globalLeads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LeadPulse_Master_Dump_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.company_name || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered Leads
  const filteredLeads = globalLeads.filter((l) => 
    (l.businessName || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.category || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.phone || '').toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="flex-1 h-screen overflow-auto bg-[#F8F9FA] flex flex-col w-full font-sans text-[#09090B]">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TELEMETRY RIBBON                          */}
      {/* ======================================================== */}
      <div className="p-6 sm:px-8 border-b border-[#E4E4E7] bg-white sticky top-0 z-20 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2.5 hover:bg-[#F4F4F5] rounded-xl text-gray-600 transition-colors border border-[#E4E4E7]"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#09090B]">Mission Control Super Admin</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Full Root Access
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Logged in as <span className="font-semibold text-charcoal">{user?.email}</span> • Complete Workflow Management A to Z
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchAllData}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-[#E4E4E7] text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#F4F4F5] transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
            </button>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firestore Connected</span>
            </div>
          </div>
        </div>

        {/* Global Toast Alerts */}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. NAVIGATION TABS                                       */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar border-t border-[#E4E4E7] pt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-[#09090B] text-white shadow-md' : 'text-gray-600 hover:bg-[#F4F4F5]'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & Telemetry</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('scraper')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'scraper' ? 'bg-[#09090B] text-white shadow-md' : 'text-gray-600 hover:bg-[#F4F4F5]'}`}
          >
            <Cpu className="w-4 h-4" />
            <span>Scraper Engine Orchestration</span>
          </button>

          <button 
            onClick={() => setActiveTab('credits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'credits' ? 'bg-[#09090B] text-white shadow-md' : 'text-gray-600 hover:bg-[#F4F4F5]'}`}
          >
            <Zap className="w-4 h-4" />
            <span>Credit Economics & Pricing</span>
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-[#09090B] text-white shadow-md' : 'text-gray-600 hover:bg-[#F4F4F5]'}`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Access Control ({users.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('outreach')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'outreach' ? 'bg-[#09090B] text-white shadow-md' : 'text-gray-600 hover:bg-[#F4F4F5]'}`}
          >
            <Send className="w-4 h-4" />
            <span>Outreach Gateway & Rules</span>
          </button>

          <button 
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'leads' ? 'bg-[#09090B] text-white shadow-md' : 'text-gray-600 hover:bg-[#F4F4F5]'}`}
          >
            <Database className="w-4 h-4" />
            <span>Master Leads ({globalLeads.length})</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TAB CONTENT SECTIONS                                  */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 flex-1 max-w-7xl mx-auto w-full">

        {/* -------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & TELEMETRY                              */}
        {/* -------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Registered Users</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#09090B]">{stats.totalUsers}</div>
                <p className="text-[11px] text-gray-400 mt-1">Platform accounts</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Leads Extracted</span>
                  <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#09090B]">{stats.totalLeads}</div>
                <p className="text-[11px] text-gray-400 mt-1">Stored in Google Cloud</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Platform Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#09090B]">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Verified transactions</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Scraper Engine</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#09090B]">
                  {stats.scraper?.queuedJobs} <span className="text-xs font-normal text-gray-400">queued</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Status: <span className="font-bold text-charcoal">{stats.scraper?.status}</span>
                </p>
              </div>
            </div>

            {/* Quick Engine Command Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E4E4E7] shadow-xs">
                <h3 className="text-sm font-bold text-[#09090B] mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-accent" />
                  <span>Cloud Server Telemetry</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#E4E4E7]">
                    <span className="text-gray-500">Database Engine</span>
                    <span className="font-bold text-gray-800">{stats.system?.database}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E4E4E7]">
                    <span className="text-gray-500">Node Runtime</span>
                    <span className="font-bold text-gray-800">{stats.system?.nodeVersion}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#E4E4E7]">
                    <span className="text-gray-500">Server Memory Footprint</span>
                    <span className="font-bold text-gray-800">{stats.system?.memoryUsage}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Scraper Pool Mode</span>
                    <span className="font-bold text-emerald-600">Headless Chromium Cluster</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E4E4E7] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#09090B] mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Master Operational Shortcuts</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Trigger platform-wide maintenance routines directly from root command.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleClearScraperQueue}
                    className="p-3 bg-[#F4F4F5] hover:bg-gray-200 text-[#09090B] rounded-xl text-xs font-bold transition-colors text-left flex flex-col justify-between h-20"
                  >
                    <span className="text-[11px] text-gray-500">Flush Job Queue</span>
                    <span className="font-extrabold">Reset Scraper</span>
                  </button>

                  <button 
                    onClick={handleExportCSV}
                    className="p-3 bg-[#F4F4F5] hover:bg-gray-200 text-[#09090B] rounded-xl text-xs font-bold transition-colors text-left flex flex-col justify-between h-20"
                  >
                    <span className="text-[11px] text-gray-500">Master Export</span>
                    <span className="font-extrabold">Download CSV</span>
                  </button>

                  <button 
                    onClick={handleExportJSON}
                    className="p-3 bg-[#F4F4F5] hover:bg-gray-200 text-[#09090B] rounded-xl text-xs font-bold transition-colors text-left flex flex-col justify-between h-20"
                  >
                    <span className="text-[11px] text-gray-500">Database Dump</span>
                    <span className="font-extrabold">Export JSON</span>
                  </button>

                  <button 
                    onClick={handlePurgeLeads}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors text-left flex flex-col justify-between h-20 border border-red-200"
                  >
                    <span className="text-[11px] text-red-500">Master Wipe</span>
                    <span className="font-extrabold">Purge All Leads</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB 2: SCRAPER ENGINE ORCHESTRATION                      */}
        {/* -------------------------------------------------------- */}
        {activeTab === 'scraper' && (
          <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-lg font-extrabold text-[#09090B]">Headless Puppeteer Scraper Configuration</h2>
              <p className="text-xs text-gray-500">
                Tune Google Maps navigation speed, browser resource limits, and anti-scraping countermeasures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Browser Concurrency Limit (Workers)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={settings.scraperConcurrency}
                    onChange={(e) => setSettings({ ...settings, scraperConcurrency: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Recommended: 2 to 4 workers for optimal CPU usage.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Map Search Timeout (Seconds)
                  </label>
                  <input 
                    type="number"
                    min="5"
                    max="120"
                    value={settings.scrapeTimeoutSecs}
                    onChange={(e) => setSettings({ ...settings, scrapeTimeoutSecs: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Duration before refunding user credit if Google Maps stalls.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#09090B]">Rotating Proxy Gateway</h4>
                    <p className="text-[11px] text-gray-500">Distribute requests across residential IP pools.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.proxyRotation}
                    onChange={(e) => setSettings({ ...settings, proxyRotation: e.target.checked })}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#09090B]">Deep Lead Enrichment</h4>
                    <p className="text-[11px] text-gray-500">Extract external website URLs and social handles.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.deepEnrichment}
                    onChange={(e) => setSettings({ ...settings, deepEnrichment: e.target.checked })}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E4E4E7] pt-6 flex items-center justify-between">
              <button 
                onClick={handleClearScraperQueue}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors border border-red-200"
              >
                Flush Pending Scraper Queue
              </button>
              <button 
                onClick={handleSaveSettings}
                className="bg-[#09090B] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Save Scraper Settings
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB 3: CREDIT ECONOMICS & PRICING RULES                  */}
        {/* -------------------------------------------------------- */}
        {activeTab === 'credits' && (
          <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-lg font-extrabold text-[#09090B]">Credit Economics & Monetization Rules</h2>
              <p className="text-xs text-gray-500">
                Configure sign-up perks, credit burn rates, and billing tiers across the app.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Free Trial Credits on Account Registration
                  </label>
                  <input 
                    type="number"
                    value={settings.freeCreditsOnSignup}
                    onChange={(e) => setSettings({ ...settings, freeCreditsOnSignup: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Default is 100 free leads given upon sign up.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Credit Cost Per Search Execution
                  </label>
                  <input 
                    type="number"
                    value={settings.creditCostPerSearch}
                    onChange={(e) => setSettings({ ...settings, creditCostPerSearch: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Deducted from user balance upon query submit.</p>
                </div>
              </div>

              <div className="bg-[#FAFAFA] border border-[#E4E4E7] p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-[#09090B]">Active In-App Purchase Packages</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-[#E4E4E7] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-charcoal">Starter Pack</span>
                      <p className="text-[10px] text-gray-400">100 Extra Leads</p>
                    </div>
                    <span className="font-extrabold text-[#09090B]">₹499 INR</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4E4E7] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-charcoal">Growth Pack</span>
                      <p className="text-[10px] text-gray-400">350 Extra Leads</p>
                    </div>
                    <span className="font-extrabold text-[#09090B]">₹1,499 INR</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E4E4E7] pt-6 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                className="bg-[#09090B] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Save Economics Configuration
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB 4: USERS & ACCESS CONTROL                            */}
        {/* -------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="p-5 border-b border-[#E4E4E7] flex flex-wrap items-center justify-between gap-4 bg-[#FAFAFA]">
              <div className="flex-1 min-w-[260px] relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users by name, email, or company..."
                  className="w-full bg-white border border-[#E4E4E7] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Role:</span>
                <select 
                  value={selectedRoleFilter}
                  onChange={(e: any) => setSelectedRoleFilter(e.target.value)}
                  className="bg-white border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                >
                  <option value="ALL">All Roles ({users.length})</option>
                  <option value="SUPER_ADMIN">Super Admins Only</option>
                  <option value="USER">Standard Users Only</option>
                </select>
              </div>
            </div>

            {/* Users Master Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7] text-gray-600 font-bold">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Company & Niche</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Onboarding</th>
                    <th className="p-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7]">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#09090B]">{u.name || 'Unnamed'}</div>
                        <div className="text-gray-500 text-[11px]">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{u.company_name || 'Not provided'}</div>
                        <div className="text-[11px] text-gray-400">{u.field_of_work || 'General'}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#09090B]">
                        <span className="text-sm">{u.lead_credits}</span>
                      </td>
                      <td className="p-4">
                        {u.onboarding_complete ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Credit Adjuster Button */}
                          <button 
                            onClick={() => {
                              setCreditModalUser(u);
                              setCreditAdjustmentAmount('100');
                              setCreditAdjustmentMode('add');
                            }}
                            className="bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors"
                            title="Adjust Credits"
                          >
                            Credits
                          </button>

                          {/* Role Toggle */}
                          <button 
                            onClick={() => handleChangeRole(u._id, u.role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN')}
                            className="bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors"
                            title="Toggle Admin Privilege"
                          >
                            {u.role === 'SUPER_ADMIN' ? 'Demote' : 'Make Admin'}
                          </button>

                          {/* Reset Onboarding */}
                          <button 
                            onClick={() => handleResetOnboarding(u._id)}
                            className="bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-500 hover:text-charcoal px-2 py-1 rounded-lg text-[11px] transition-colors"
                            title="Reset Onboarding Flow"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          <button 
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            className="bg-white border border-red-200 hover:bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[11px] transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No users match the search criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB 5: OUTREACH GATEWAY & RULES                          */}
        {/* -------------------------------------------------------- */}
        {activeTab === 'outreach' && (
          <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-lg font-extrabold text-[#09090B]">Multi-Channel Outreach Gateway & Anti-Spam Compliance</h2>
              <p className="text-xs text-gray-500">
                Control global outbound dispatch limits, legal compliance footers, and domain suppression.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Global SMTP / Dispatch Engine
                  </label>
                  <select 
                    value={settings.smtpProvider}
                    onChange={(e) => setSettings({ ...settings, smtpProvider: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="System Nodemailer / SendGrid">System Nodemailer / SendGrid (Recommended)</option>
                    <option value="Amazon SES Gateway">Amazon SES Gateway</option>
                    <option value="Postmark Transactional">Postmark Transactional</option>
                    <option value="Twilio / Meta WhatsApp Cloud">Twilio & Meta WhatsApp Cloud API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Max Outbound Messages / Hour (Per User)
                  </label>
                  <input 
                    type="number"
                    value={settings.maxOutreachPerHour}
                    onChange={(e) => setSettings({ ...settings, maxOutreachPerHour: Number(e.target.value) })}
                    className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Safeguard IP reputation and prevent spam blacklisting.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#09090B]">Mandatory CAN-SPAM Unsubscribe Footers</h4>
                    <p className="text-[11px] text-gray-500">Automatically append opt-out instructions to all emails.</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.complianceFooterEnforced}
                    onChange={(e) => setSettings({ ...settings, complianceFooterEnforced: e.target.checked })}
                    className="w-5 h-5 accent-accent cursor-pointer"
                  />
                </div>

                {/* Suppression Blacklist Manager */}
                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                  <h4 className="text-xs font-bold text-[#09090B] mb-1">Global Suppression Blacklist</h4>
                  <p className="text-[11px] text-gray-500 mb-3">Emails/domains that cannot be scraped or contacted.</p>
                  
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text"
                      placeholder="Add domain or email..."
                      value={newSuppressionItem}
                      onChange={(e) => setNewSuppressionItem(e.target.value)}
                      className="flex-1 bg-white border border-[#E4E4E7] rounded-lg px-3 py-1.5 text-xs outline-none"
                    />
                    <button 
                      onClick={() => {
                        if (newSuppressionItem.trim()) {
                          setSettings({
                            ...settings,
                            suppressionList: [...settings.suppressionList, newSuppressionItem.trim()]
                          });
                          setNewSuppressionItem('');
                        }
                      }}
                      className="bg-[#09090B] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {settings.suppressionList.map((item, idx) => (
                      <span key={idx} className="bg-white border border-[#E4E4E7] text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>{item}</span>
                        <button 
                          onClick={() => {
                            setSettings({
                              ...settings,
                              suppressionList: settings.suppressionList.filter((_, i) => i !== idx)
                            });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E4E4E7] pt-6 flex justify-end">
              <button 
                onClick={handleSaveSettings}
                className="bg-[#09090B] hover:bg-black text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Save Outreach Rules
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB 6: GLOBAL LEAD DATABASE MASTER                       */}
        {/* -------------------------------------------------------- */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E4E4E7] flex flex-wrap items-center justify-between gap-4 bg-[#FAFAFA]">
              <div className="flex-1 min-w-[260px] relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input 
                  type="text" 
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search across all platform leads by name or phone..."
                  className="w-full bg-white border border-[#E4E4E7] rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button 
                  onClick={handleExportJSON}
                  className="bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Dump JSON
                </button>
                <button 
                  onClick={handlePurgeLeads}
                  className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F4F5] border-b border-[#E4E4E7] text-gray-600 font-bold">
                    <th className="p-4">Business Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Website</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Owner User ID</th>
                    <th className="p-4">Scraped On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7]">
                  {filteredLeads.map((l) => (
                    <tr key={l._id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-4 font-bold text-[#09090B]">{l.businessName}</td>
                      <td className="p-4 text-gray-600">{l.category}</td>
                      <td className="p-4 text-gray-700 font-medium">{l.phone}</td>
                      <td className="p-4 text-gray-500 truncate max-w-xs">{l.website}</td>
                      <td className="p-4 font-bold text-amber-500">★ {l.rating || '4.8'}</td>
                      <td className="p-4 text-gray-400 font-mono text-[10px] truncate max-w-[120px]">{l.userId}</td>
                      <td className="p-4 text-gray-500 text-[11px]">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No leads recorded in the database yet.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 4. MODAL: ADJUST CREDITS DIALOG                           */}
      {/* ======================================================== */}
      {creditModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E4E4E7] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-extrabold text-base text-[#09090B]">Adjust Lead Credits</h3>
              <p className="text-xs text-gray-500">
                Target User: <span className="font-bold text-charcoal">{creditModalUser.email}</span>
              </p>
              <p className="text-xs text-gray-500">
                Current Balance: <span className="font-bold text-accent">{creditModalUser.lead_credits}</span> credits
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex bg-[#F4F4F5] p-1 rounded-xl text-xs font-bold">
                <button 
                  onClick={() => setCreditAdjustmentMode('add')}
                  className={`flex-1 py-2 rounded-lg transition-all ${creditAdjustmentMode === 'add' ? 'bg-white text-[#09090B] shadow-sm' : 'text-gray-500'}`}
                >
                  Add Credits (+)
                </button>
                <button 
                  onClick={() => setCreditAdjustmentMode('set')}
                  className={`flex-1 py-2 rounded-lg transition-all ${creditAdjustmentMode === 'set' ? 'bg-white text-[#09090B] shadow-sm' : 'text-gray-500'}`}
                >
                  Set Absolute Total (=)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {creditAdjustmentMode === 'add' ? 'Credits to Add (can be negative to deduct)' : 'New Total Credit Balance'}
                </label>
                <input 
                  type="number"
                  value={creditAdjustmentAmount}
                  onChange={(e) => setCreditAdjustmentAmount(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex gap-2">
                {[50, 100, 500, 1000].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => {
                      setCreditAdjustmentMode('add');
                      setCreditAdjustmentAmount(String(quick));
                    }}
                    className="flex-1 py-1.5 bg-[#F4F4F5] hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    +{quick}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                onClick={() => setCreditModalUser(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-charcoal transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdateCredits(creditModalUser._id, Number(creditAdjustmentAmount), creditAdjustmentMode)}
                className="bg-[#09090B] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Apply Credits
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
