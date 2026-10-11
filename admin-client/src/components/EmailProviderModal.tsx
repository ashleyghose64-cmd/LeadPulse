import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, Mail, ShieldCheck, Check, 
  Loader2, Sparkles, Send, CheckCircle2, AlertCircle
} from 'lucide-react';

interface EmailProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSaved?: () => void;
}

const EmailProviderModal = ({ isOpen, onClose, user, onSaved }: EmailProviderModalProps) => {
  if (!isOpen) return null;

  const [provider, setProvider] = useState<'gmail' | 'resend' | 'custom' | 'test'>('gmail');
  
  // Gmail fields
  const [gmailUser, setGmailUser] = useState(user?.email || '');
  const [gmailAppPass, setGmailAppPass] = useState('');
  
  // Resend fields
  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFromEmail, setResendFromEmail] = useState(user?.email || 'onboarding@resend.dev');

  // Custom SMTP fields
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // General fields
  const [fromName, setFromName] = useState(user?.name || 'Alex Roberts | LeadPulse');
  const [fromEmail, setFromEmail] = useState(user?.email || 'alex@leadpulse.io');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Load existing configuration
  useEffect(() => {
    const fetchConfig = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get('http://localhost:3001/api/outreach/smtp-config', {
          headers: { userid: user._id }
        });
        if (res.data) {
          if (res.data.provider) setProvider(res.data.provider);
          if (res.data.user) {
            setGmailUser(res.data.user);
            setSmtpUser(res.data.user);
          }
          if (res.data.pass) {
            setGmailAppPass(res.data.pass);
            setSmtpPass(res.data.pass);
          }
          if (res.data.resendApiKey) setResendApiKey(res.data.resendApiKey);
          if (res.data.host) setSmtpHost(res.data.host);
          if (res.data.port) setSmtpPort(String(res.data.port));
          if (res.data.fromName) setFromName(res.data.fromName);
          if (res.data.fromEmail) setFromEmail(res.data.fromEmail);
        }
      } catch (err) {
        console.error('Failed to load SMTP settings:', err);
      }
    };
    fetchConfig();
  }, [user?._id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const payload: any = {
        provider,
        fromName,
        fromEmail
      };

      if (provider === 'gmail') {
        payload.user = gmailUser;
        payload.pass = gmailAppPass;
      } else if (provider === 'resend') {
        payload.resendApiKey = resendApiKey;
        payload.fromEmail = resendFromEmail;
      } else if (provider === 'custom') {
        payload.host = smtpHost;
        payload.port = parseInt(smtpPort) || 587;
        payload.user = smtpUser;
        payload.pass = smtpPass;
      }

      await axios.post('http://localhost:3001/api/outreach/smtp-config', payload, {
        headers: { userid: user?._id }
      });

      setSaveSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save email settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestToInbox = async () => {
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const customSmtp: any = { provider, fromName, fromEmail };
      if (provider === 'gmail') {
        customSmtp.user = gmailUser;
        customSmtp.pass = gmailAppPass;
      } else if (provider === 'resend') {
        customSmtp.resendApiKey = resendApiKey;
        customSmtp.fromEmail = resendFromEmail;
      } else if (provider === 'custom') {
        customSmtp.host = smtpHost;
        customSmtp.port = parseInt(smtpPort) || 587;
        customSmtp.user = smtpUser;
        customSmtp.pass = smtpPass;
      }

      const res = await axios.post('http://localhost:3001/api/outreach/dispatch-single', {
        templateId: 'one_column',
        templateData: {
          subject: '⚡ LeadPulse Live Inbox Delivery Test',
          headline: 'Real-Time Inbox Verification Succeeded!',
          body: `This test message was dispatched via your configured ${provider.toUpperCase()} mail transport directly into your inbox at ${user?.email || 'your email'}.`
        },
        customRecipientEmail: user?.email || 'ashleyghose64@gmail.com',
        fromName,
        fromEmail: provider === 'resend' ? resendFromEmail : fromEmail,
        customSmtp
      }, {
        headers: { userid: user?._id }
      });

      if (res.data.success) {
        setTestStatus(`Delivered to ${res.data.recipient}! Check your real inbox.`);
      } else {
        setTestStatus(`Failed: ${res.data.result?.response || 'Delivery error'}`);
      }
    } catch (err: any) {
      setTestStatus(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E4E4E7] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-[#09090B]">Email Dispatch Provider Settings</h2>
              <p className="text-xs text-gray-500">Configure your real SMTP or API gateway for direct inbox placement.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          
          {/* Provider Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Select Mail Provider</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('gmail')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  provider === 'gmail' 
                    ? 'border-accent bg-accent/5 text-[#09090B] font-bold shadow-xs' 
                    : 'border-[#E4E4E7] text-gray-500 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-extrabold">Google Gmail</div>
                <div className="text-[10px] text-gray-400">App Password</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('resend')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  provider === 'resend' 
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs' 
                    : 'border-[#E4E4E7] text-gray-500 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-extrabold">Resend API</div>
                <div className="text-[10px] text-gray-400">High Deliverability</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('custom')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  provider === 'custom' 
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs' 
                    : 'border-[#E4E4E7] text-gray-500 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-extrabold">Custom SMTP</div>
                <div className="text-[10px] text-gray-400">SendGrid / Brevo</div>
              </button>
            </div>
          </div>

          {/* 1. GMAIL CONFIG */}
          {provider === 'gmail' && (
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  To send from Gmail, generate a 16-character <strong>App Password</strong> at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-accent underline font-bold">myaccount.google.com/apppasswords</a>.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Gmail Address</label>
                <input 
                  type="email"
                  value={gmailUser}
                  onChange={(e) => setGmailUser(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold text-[#09090B] focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Gmail 16-Character App Password</label>
                <input 
                  type="password"
                  value={gmailAppPass}
                  onChange={(e) => setGmailAppPass(e.target.value)}
                  placeholder="abcd efgh ijkl mnop"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-mono font-bold text-[#09090B] focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* 2. RESEND CONFIG */}
          {provider === 'resend' && (
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-3">
              <div className="flex items-start gap-2 text-xs text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p>
                  Get your free API key from <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-purple-700 underline font-bold">resend.com</a> for zero-config direct inbox delivery.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Resend API Key</label>
                <input 
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_123456789..."
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-[#09090B] focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Verified Sender Email</label>
                <input 
                  type="email"
                  value={resendFromEmail}
                  onChange={(e) => setResendFromEmail(e.target.value)}
                  placeholder="onboarding@resend.dev or yourdomain.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-[#09090B] focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          {/* 3. CUSTOM SMTP */}
          {provider === 'custom' && (
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">SMTP Host</label>
                  <input 
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.sendgrid.net"
                    className="w-full px-3.5 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Port</label>
                  <input 
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="w-full px-3.5 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">SMTP Username</label>
                  <input 
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="apikey / user"
                    className="w-full px-3.5 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">SMTP Password</label>
                  <input 
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sender Identity */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4E4E7]">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Sender Display Name</label>
              <input 
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Alex Roberts"
                className="w-full px-3.5 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">From Email Address</label>
              <input 
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="alex@yourcompany.com"
                className="w-full px-3.5 py-2 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              testStatus.startsWith('Delivered') 
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              {testStatus.startsWith('Delivered') ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>{testStatus}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <button
            type="button"
            onClick={handleSendTestToInbox}
            disabled={isSendingTest}
            className="bg-white hover:bg-gray-100 border border-[#E4E4E7] text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-accent" />}
            <span>Send Live Test to My Inbox</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#09090B] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-accent/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Provider Settings</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmailProviderModal;
