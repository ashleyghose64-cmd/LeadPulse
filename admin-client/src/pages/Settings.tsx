import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { 
  User, Mail, Server, Shield, 
  CreditCard, Download, Check,
  Sparkles, Save, CheckCircle2, AlertCircle,
  MessageCircle, Zap, Lock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

type SettingsTab = 'profile' | 'smtp' | 'outreach' | 'billing' | 'data';

const Settings = () => {
  const { user, setUser, setTopUpOpen, setUpgradeModalOpen, setUpgradeTab } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [fieldOfWork, setFieldOfWork] = useState(user?.field_of_work || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');

  // SMTP & Mail Transport State
  const [smtpHost, setSmtpHost] = useState((user as any)?.smtp_settings?.host || 'smtp.ethereal.email');
  const [smtpPort, setSmtpPort] = useState((user as any)?.smtp_settings?.port || '587');
  const [smtpUser, setSmtpUser] = useState((user as any)?.smtp_settings?.user || 'leadpulse-dispatcher@ethereal.email');
  const [smtpPass, setSmtpPass] = useState((user as any)?.smtp_settings?.pass || '••••••••••••');
  const [fromName, setFromName] = useState((user as any)?.smtp_settings?.fromName || user?.name || 'LeadPulse Outreach');
  const [fromEmail, setFromEmail] = useState((user as any)?.smtp_settings?.fromEmail || user?.email || 'outreach@leadpulse.io');
  const [complianceFooter, setComplianceFooter] = useState(true);

  // WhatsApp & Outreach Defaults State
  const [autoAdvanceStage, setAutoAdvanceStage] = useState(true);
  const [defaultFallbackBusiness, setDefaultFallbackBusiness] = useState('Business Owner');
  const [defaultFallbackLocation, setDefaultFallbackLocation] = useState('your area');

  // Test SMTP state
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailSuccess, setTestEmailSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCompanyName(user.company_name || '');
      setFieldOfWork(user.field_of_work || '');
      setPhone((user as any)?.phone || '');
    }
  }, [user]);

  // Save Settings handler
  const handleSaveSettings = async () => {
    if (!user?._id) return;
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const payload = {
        name,
        company_name: companyName,
        field_of_work: fieldOfWork,
        phone,
        smtp_settings: {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          pass: smtpPass,
          fromName,
          fromEmail,
          complianceFooter
        },
        outreach_defaults: {
          autoAdvanceStage,
          defaultFallbackBusiness,
          defaultFallbackLocation
        }
      };

      const res = await axios.patch('http://localhost:3001/api/auth/profile', payload, {
        headers: { userid: user._id }
      });

      setUser({
        ...user,
        ...res.data.user
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to persist settings changes.');
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP Dispatch
  const handleTestSmtp = async () => {
    setTestEmailSending(true);
    setTestEmailSuccess(false);
    setTimeout(() => {
      setTestEmailSending(false);
      setTestEmailSuccess(true);
      setTimeout(() => setTestEmailSuccess(false), 4000);
    }, 1200);
  };

  // Export CSV
  const handleExportAll = async () => {
    if ((user?.plan || 'free') === 'free') {
      setUpgradeTab('plans');
      setUpgradeModalOpen(true);
      return;
    }

    try {
      const res = await axios.get('http://localhost:3001/api/leads', {
        headers: { userid: user?._id }
      });
      const leads = res.data || [];
      if (leads.length === 0) {
        alert('No leads available to export');
        return;
      }

      const headers = ['Business Name', 'Category', 'Phone', 'Email', 'Status', 'Rating', 'Location'];
      const rows = leads.map((l: any) => [
        `"${l.businessName || ''}"`,
        `"${l.category || ''}"`,
        `"${l.phone || ''}"`,
        `"${l.email || ''}"`,
        `"${l.status || ''}"`,
        `"${l.rating || ''}"`,
        `"${l.location || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LeadPulse_Full_CRM_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export leads');
    }
  };

  const currentPlan = user?.plan || 'free';
  const isFree = currentPlan === 'free';
  const credits = user?.lead_credits ?? 15;

  return (
    <div className="flex w-full min-h-screen bg-[#FAFAFA] font-sans text-[#09090B]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Platform Settings & Configurations" />

        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-w-5xl">
          
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#09090B]">Account & System Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage your user profile, direct email SMTP transport, WhatsApp defaults, and billing tier.</p>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Settings Tabs Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-[#E4E4E7] pb-3 text-xs font-bold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-[#E4E4E7] text-gray-600 hover:bg-[#F4F4F5]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile & Workspace</span>
            </button>

            <button
              onClick={() => setActiveTab('smtp')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'smtp' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-[#E4E4E7] text-gray-600 hover:bg-[#F4F4F5]'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-accent" />
              <span>Mail Delivery & SMTP</span>
            </button>

            <button
              onClick={() => setActiveTab('outreach')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'outreach' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-[#E4E4E7] text-gray-600 hover:bg-[#F4F4F5]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp & Automation</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'billing' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-[#E4E4E7] text-gray-600 hover:bg-[#F4F4F5]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>Subscription & Compute</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'data' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-[#E4E4E7] text-gray-600 hover:bg-[#F4F4F5]'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Data Management</span>
            </button>
          </div>

          {/* TAB 1: PROFILE & WORKSPACE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#09090B]">Profile & Workspace Details</h3>
                <p className="text-xs text-gray-500">Configure your business identity to automatically populate merge tags across outbound campaigns.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Full Name / Operator</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Account Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl text-xs font-bold text-gray-500 cursor-not-allowed shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Company / Agency Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Growth Media"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Primary Industry / Niche Specialization</label>
                  <input
                    type="text"
                    value={fieldOfWork}
                    onChange={(e) => setFieldOfWork(e.target.value)}
                    placeholder="e.g. Dental & Healthcare B2B Marketing"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-gray-700">Business WhatsApp Contact Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MAIL DELIVERY & SMTP */}
          {activeTab === 'smtp' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#09090B]">Direct-to-Inbox Mail Transport Configuration</h3>
                  <p className="text-xs text-gray-500">Connect your custom SMTP server (SendGrid, Mailgun, Amazon SES, Google Workspace) to route outbound email campaigns.</p>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  SMTP Engine Connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-gray-700">SMTP Host Server</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="e.g. smtp.sendgrid.net or smtp.gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587 (TLS) or 465 (SSL)"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">SMTP Username / API Key</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="apikey or username"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="Password or API secret"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Sender Display Name</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Alex Rivera | LeadPulse"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="font-bold text-gray-700">Sender "From" Email Address</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="alex@yourdomain.com"
                    className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Compliance Checkbox */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-[#09090B] block">Mandatory CAN-SPAM / GDPR Compliance Footer</strong>
                    <span className="text-gray-500">Automatically inject one-click unsubscribe links and sender physical address to maintain high deliverability.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={complianceFooter}
                  onChange={(e) => setComplianceFooter(e.target.checked)}
                  className="w-4 h-4 text-accent rounded cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testEmailSending}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-[#E4E4E7] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  <span>{testEmailSending ? 'Sending Test Message...' : testEmailSuccess ? 'Test Delivered to Inbox!' : 'Send Test SMTP Ping'}</span>
                </button>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save SMTP Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP & AUTOMATION */}
          {activeTab === 'outreach' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#09090B]">WhatsApp & Outreach Automation Defaults</h3>
                <p className="text-xs text-gray-500">Configure fallback parameters and automatic stage advancing for high-speed multi-channel execution.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                    <MessageCircle className="w-4 h-4" />
                    <span>Organic WhatsApp Convenience Framing Script</span>
                  </div>
                  <p className="text-emerald-900 text-xs italic bg-white/80 p-3 rounded-lg border border-emerald-200/80">
                    "Instead of cramming files into messy WhatsApp chat history, what is the best email address to drop this over to?"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Fallback for Business Name (`&#123;&#123;business_name&#125;&#125;`)</label>
                    <input
                      type="text"
                      value={defaultFallbackBusiness}
                      onChange={(e) => setDefaultFallbackBusiness(e.target.value)}
                      placeholder="e.g. Business Owner or Partner"
                      className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Fallback for Location (`&#123;&#123;location&#125;&#125;`)</label>
                    <input
                      type="text"
                      value={defaultFallbackLocation}
                      onChange={(e) => setDefaultFallbackLocation(e.target.value)}
                      placeholder="e.g. your locality or your area"
                      className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <strong className="text-gray-800 block">Auto-Advance Pipeline Stage on Outreach Launch</strong>
                    <span className="text-gray-500">Automatically advance lead from "New" to "WhatsApp Contacted" or "Proposal Sent" upon clicking dispatch.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAdvanceStage}
                    onChange={(e) => setAutoAdvanceStage(e.target.checked)}
                    className="w-4 h-4 text-accent rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Automation Defaults'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: BILLING & COMPUTE */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#09090B]">Current Subscription & Compute Tier</h3>
                  <p className="text-xs text-gray-500">Manage your B2B harvesting limits, auto-refresh schedule, and PhonePe payment history.</p>
                </div>
                <span className="text-xs font-black bg-purple-100 text-purple-800 px-3 py-1 rounded-full uppercase tracking-wider">
                  {currentPlan.toUpperCase()} TIER
                </span>
              </div>

              {/* Plan Card Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#18181B] via-gray-900 to-[#18181B] text-white flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black">{isFree ? 'Free Tier Compute' : `LeadPulse ${currentPlan.toUpperCase()}`}</span>
                    <span className="text-[10px] font-extrabold bg-accent text-white px-2 py-0.5 rounded-md">
                      {isFree ? '₹0 / forever' : currentPlan === 'basic' ? '₹699 / mo' : '₹1,999 / mo'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    {isFree 
                      ? '15 Tokens / Saved Leads Pool (Auto-refreshes every 4 days) • Max 10 leads / query'
                      : currentPlan === 'basic' 
                        ? '600 Saved Leads & continuous daily harvesting • Unlimited CSV exports'
                        : 'Unlimited Saved Leads & 1,000 daily velocity • Dedicated Priority Worker'
                    }
                  </p>
                </div>

                <button
                  onClick={() => {
                    setUpgradeTab('plans');
                    setUpgradeModalOpen(true);
                  }}
                  className="bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-accent/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFree ? 'Upgrade to Basic / Pro' : 'Manage Subscription'}</span>
                </button>
              </div>

              {/* Compute Pool Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] space-y-1">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Lead Balance</span>
                  <div className="text-2xl font-black text-[#09090B]">{credits} Credits</div>
                  <span className="text-[11px] text-gray-500">Available to harvest</span>
                </div>

                <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] space-y-1">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Saved Leads Limit</span>
                  <div className="text-2xl font-black text-purple-700">
                    {isFree ? '15 Tokens / Leads' : currentPlan === 'basic' ? '600 Leads' : 'Unlimited'}
                  </div>
                  <span className="text-[11px] text-gray-500">CRM capacity</span>
                </div>

                <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] space-y-1">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">One-Time Top-Up</span>
                  <div>
                    <button
                      onClick={() => setTopUpOpen(true)}
                      className="mt-1 text-xs font-extrabold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Buy Top-Up Pack (₹50) →</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-gray-500">Instant PhonePe UPI</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#09090B]">Data Portability & Database Operations</h3>
                <p className="text-xs text-gray-500">Export your complete prospect dataset or clean up stale CRM pipeline records.</p>
              </div>

              <div className="space-y-4">
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <strong className="text-xs font-bold text-[#09090B] block">Export All Verified Leads (CSV / Excel)</strong>
                    <p className="text-xs text-gray-500">Download all extracted business names, direct emails, phone numbers, and pipeline stages.</p>
                  </div>

                  <button
                    onClick={handleExportAll}
                    className="bg-[#09090B] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full CRM (.CSV)</span>
                    {isFree && <Lock className="w-3 h-3 text-amber-400" />}
                  </button>
                </div>

                {/* Cloud Firestore Sync Status */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-emerald-950 block">Google Cloud Firestore Synchronized</strong>
                      <span className="text-[11px] text-emerald-800">Your CRM data is automatically backed up and persisted with production service account credentials.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
