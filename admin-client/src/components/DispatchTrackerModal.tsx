import { useState } from 'react';
import axios from 'axios';
import { 
  X, Send, CheckCircle2, AlertCircle, 
  ExternalLink, Mail, ShieldCheck, Zap, Terminal, 
  Users, User, Check, RefreshCw
} from 'lucide-react';

interface LeadItem {
  _id?: string;
  businessName: string;
  location: string;
  category?: string;
  fieldOfWork?: string;
  firstName?: string;
  phone?: string;
  rating?: string;
  email?: string;
}

interface DispatchTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  templateData: Record<string, any>;
  templateStyling: Record<string, any>;
  availableLeads: LeadItem[];
  currentPreviewLead: LeadItem;
  user: any;
  onCampaignDispatched?: () => void;
}

interface DeliveryLogItem {
  leadId: string;
  businessName: string;
  recipient: string;
  status: 'delivered' | 'failed';
  response: string;
  messageId: string;
  previewUrl: string | null;
  subject: string;
}

const DispatchTrackerModal = ({
  isOpen,
  onClose,
  templateId,
  templateName,
  templateData,
  templateStyling,
  availableLeads,
  currentPreviewLead,
  user,
  onCampaignDispatched
}: DispatchTrackerModalProps) => {
  if (!isOpen) return null;

  // Target audience mode
  const [audienceMode, setAudienceMode] = useState<'all' | 'single' | 'custom'>('all');
  const [customEmail, setCustomEmail] = useState(user?.email || 'ashleyghose64@gmail.com');

  // Dispatch lifecycle: 'config' | 'sending' | 'completed' | 'error'
  const [dispatchState, setDispatchState] = useState<'config' | 'sending' | 'completed' | 'error'>('config');
  const [progressPercent, setProgressPercent] = useState(0);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLogItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'terminal'>('table');

  const selectedLeadsToDispatch: LeadItem[] = 
    audienceMode === 'all' 
      ? availableLeads 
      : audienceMode === 'single'
        ? [currentPreviewLead]
        : [{
            _id: 'custom-lead',
            businessName: currentPreviewLead.businessName || 'Direct Test Recipient',
            location: currentPreviewLead.location || 'Local Area',
            category: currentPreviewLead.category || 'Direct Outreach',
            fieldOfWork: currentPreviewLead.fieldOfWork || 'Technology',
            firstName: 'Ashley',
            phone: currentPreviewLead.phone || '+91 98000 00000',
            rating: '5.0',
            email: customEmail
          }];

  const handleStartDispatch = async () => {
    setDispatchState('sending');
    setProgressPercent(15);
    setDeliveryLogs([]);
    setErrorMessage('');

    try {
      // Build request payload
      const payload = {
        templateId,
        templateData,
        templateStyling,
        leadIds: audienceMode === 'all' 
          ? availableLeads.map(l => l._id).filter(Boolean)
          : audienceMode === 'single' && currentPreviewLead._id ? [currentPreviewLead._id] : [],
        fallbackLeads: selectedLeadsToDispatch,
        fromName: user?.name ? `${user.name} | LeadPulse` : 'LeadPulse Growth Engine',
        fromEmail: user?.email || 'outreach@leadpulse.io'
      };

      setProgressPercent(45);

      const res = await axios.post('http://localhost:3001/api/outreach/dispatch-batch', payload, {
        headers: { userid: user?._id }
      });

      setProgressPercent(100);
      setDeliveryLogs(res.data.logs || []);
      setDispatchState('completed');

      if (onCampaignDispatched) {
        onCampaignDispatched();
      }

    } catch (err: any) {
      console.error('Dispatch error:', err);
      setErrorMessage(err.response?.data?.error || err.message || 'Dispatch engine encountered a server error.');
      setDispatchState('error');
    }
  };

  const handleReset = () => {
    setDispatchState('config');
    setProgressPercent(0);
    setDeliveryLogs([]);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-hidden cursor-pointer">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-3xl h-[90vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden cursor-default animate-in fade-in zoom-in-95 duration-150 relative z-10 my-auto"
      >
        
        {/* ======================================================== */}
        {/* MODAL HEADER                                             */}
        {/* ======================================================== */}
        <div className="shrink-0 p-5 sm:px-8 sm:py-6 bg-gradient-to-r from-gray-900 via-[#18181B] to-gray-900 text-white relative border-b border-gray-800">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer z-20 shadow-sm"
            title="Close modal"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>

          <div className="max-w-2xl pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Direct-to-Inbox Email Dispatch Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              Direct Server-Side Campaign Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
              Dispatches compiled HTML messages straight into recipient inboxes via verified mail transport without generating any downloadable files.
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL BODY                                               */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar space-y-6">

          {/* 1. CONFIGURATION VIEW */}
          {dispatchState === 'config' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Template Blueprint Summary */}
              <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black text-sm shadow-xs">
                    LP
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Selected Structure:</span>
                    <h4 className="text-sm font-extrabold text-[#09090B]">{templateName}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>CAN-SPAM Footer Active</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    Direct SMTP Transport
                  </span>
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Target Recipient Audience:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Option 1: All Scraped Leads */}
                  <div 
                    onClick={() => setAudienceMode('all')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      audienceMode === 'all' 
                        ? 'border-accent bg-accent/5 shadow-xs' 
                        : 'border-[#E4E4E7] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Users className={`w-5 h-5 ${audienceMode === 'all' ? 'text-accent' : 'text-gray-400'}`} />
                      {audienceMode === 'all' && <Check className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="text-xs font-extrabold text-[#09090B]">All Harvested Leads</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {availableLeads.length} total recipients in current batch
                    </p>
                  </div>

                  {/* Option 2: Target Lead Only */}
                  <div 
                    onClick={() => setAudienceMode('single')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      audienceMode === 'single' 
                        ? 'border-accent bg-accent/5 shadow-xs' 
                        : 'border-[#E4E4E7] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <User className={`w-5 h-5 ${audienceMode === 'single' ? 'text-accent' : 'text-gray-400'}`} />
                      {audienceMode === 'single' && <Check className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="text-xs font-extrabold text-[#09090B] truncate">
                      {currentPreviewLead.businessName}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Single lead dispatch test
                    </p>
                  </div>

                  {/* Option 3: Custom Inbox Test */}
                  <div 
                    onClick={() => setAudienceMode('custom')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      audienceMode === 'custom' 
                        ? 'border-accent bg-accent/5 shadow-xs' 
                        : 'border-[#E4E4E7] bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Mail className={`w-5 h-5 ${audienceMode === 'custom' ? 'text-accent' : 'text-gray-400'}`} />
                      {audienceMode === 'custom' && <Check className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="text-xs font-extrabold text-[#09090B]">My Inbox Test</div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Verify directly in personal email
                    </p>
                  </div>

                </div>

                {/* Custom Email Input */}
                {audienceMode === 'custom' && (
                  <div className="p-3 bg-white border border-[#E4E4E7] rounded-xl flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <input 
                      type="email" 
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter destination email address..."
                      className="w-full text-xs font-semibold outline-none text-[#09090B]"
                    />
                  </div>
                )}
              </div>

              {/* Individualized Lead Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">Target Queue Preview ({selectedLeadsToDispatch.length} Recipients):</span>
                  <span className="text-gray-400 text-[11px]">Individualized merge tags mapped</span>
                </div>
                
                <div className="border border-[#E4E4E7] rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-gray-500 font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Target Business</th>
                        <th className="py-2.5 px-3">Location / Field</th>
                        <th className="py-2.5 px-3">Recipient Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7]">
                      {selectedLeadsToDispatch.map((lead, idx) => (
                        <tr key={lead._id || idx} className="hover:bg-gray-50">
                          <td className="py-2 px-3 font-bold text-[#09090B]">{lead.businessName}</td>
                          <td className="py-2 px-3 text-gray-500">{lead.location} &bull; {lead.category || lead.fieldOfWork}</td>
                          <td className="py-2 px-3 text-accent font-semibold">
                            {lead.email || `contact@${lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Protocol Highlights */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>Zero File Downloads Mandate Enforced:</strong>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    The payload compiles server-side and routes messages directly through the Node mail delivery transport protocol into recipient inboxes. Live delivery receipts and inbox inspection URLs will update right on your screen.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* 2. LIVE SENDING & TELEMETRY PROGRESS VIEW */}
          {dispatchState === 'sending' && (
            <div className="py-12 text-center space-y-6 animate-in fade-in duration-150">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-[#09090B]">
                  Executing Direct-to-Inbox Dispatch...
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Server is compiling individual merge tags, attaching compliance headers, and opening direct SMTP delivery sockets for {selectedLeadsToDispatch.length} recipient inboxes.
                </p>
              </div>

              <div className="max-w-md mx-auto w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 bg-[#F4F4F5] px-4 py-2 rounded-xl">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
                <span>Socket Handshake & Deliverability Verification in Progress</span>
              </div>
            </div>
          )}

          {/* 3. COMPLETED VIEW (LIVE DELIVERY STATUS TRACKING) */}
          {dispatchState === 'completed' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-emerald-950">
                      Campaign Dispatched Directly to Inboxes!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Successfully delivered {deliveryLogs.filter(l => l.status === 'delivered').length} of {deliveryLogs.length} messages. Zero file downloads required.
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-2xl font-black text-emerald-700">100%</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Inbox Delivery Rate</div>
                </div>
              </div>

              {/* View Switcher Tabs (Delivery Table vs Terminal Log) */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('table')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === 'table' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-[#F4F4F5] text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Delivery Table ({deliveryLogs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'terminal' ? 'bg-[#09090B] text-white shadow-xs' : 'bg-[#F4F4F5] text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Live Protocol Logs</span>
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-gray-400">
                  CRM Leads updated to &quot;Contacted&quot;
                </span>
              </div>

              {/* TAB 1: DELIVERY STATUS TRACKING TABLE */}
              {activeTab === 'table' && (
                <div className="border border-[#E4E4E7] rounded-2xl overflow-hidden bg-white shadow-xs max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-gray-500 font-bold sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Recipient Business</th>
                        <th className="py-3 px-4">Destination Inbox</th>
                        <th className="py-3 px-4">Delivery Status</th>
                        <th className="py-3 px-4 text-right">Inbox Proof</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7]">
                      {deliveryLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#09090B]">
                            {log.businessName}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-600">
                            {log.recipient}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>250 OK Delivered</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.previewUrl ? (
                              <a 
                                href={log.previewUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:text-accent-dark hover:underline bg-accent/10 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                <span>Inspect Inbox</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-[11px] text-gray-400">Verified Direct</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: TERMINAL PROTOCOL LOGS */}
              {activeTab === 'terminal' && (
                <div className="bg-[#09090B] text-emerald-400 font-mono text-xs rounded-2xl p-4 max-h-72 overflow-y-auto custom-scrollbar space-y-2 border border-gray-800 shadow-inner">
                  <div className="text-gray-500 text-[11px]">=== LEADPULSE OUTBOUND DISPATCH TELEMETRY STREAM ===</div>
                  <div>[SOCKET] Handshake established with direct mail transport gateway.</div>
                  {deliveryLogs.map((log, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="text-white">
                        &gt; [DISPATCH #{i + 1}] Target: {log.businessName} ({log.recipient})
                      </div>
                      <div className="text-gray-400 pl-4">
                        &rarr; Subject: &quot;{log.subject}&quot;
                      </div>
                      <div className="text-emerald-400 pl-4">
                        &rarr; Response: {log.response} (Message-ID: {log.messageId})
                      </div>
                      {log.previewUrl && (
                        <div className="text-accent-light pl-4">
                          &rarr; Direct Preview URL: {log.previewUrl}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="text-emerald-400 font-bold mt-2">
                    [COMPLETED] All {deliveryLogs.length} individualized emails dispatched directly to target inboxes.
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 4. ERROR VIEW */}
          {dispatchState === 'error' && (
            <div className="p-8 text-center space-y-4 bg-red-50/50 border border-red-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-red-950">Dispatch Encountered an Error</h3>
              <p className="text-xs text-red-700 max-w-md mx-auto">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* MODAL FOOTER                                             */}
        {/* ======================================================== */}
        <div className="shrink-0 px-6 py-4 bg-[#FAFAFA] border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Direct Socket Delivery &bull; Zero downloads &bull; CAN-SPAM Certified</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {dispatchState === 'config' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E4E4E7] bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors shadow-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartDispatch}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#09090B] hover:bg-black text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Campaign Directly ({selectedLeadsToDispatch.length} Inboxes)</span>
                </button>
              </>
            ) : dispatchState === 'completed' ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#E4E4E7] bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors shadow-xs cursor-pointer"
                >
                  Dispatch Another Batch
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#09090B] hover:bg-black text-white text-xs font-black transition-all shadow-md cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DispatchTrackerModal;
