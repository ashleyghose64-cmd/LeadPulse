import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { 
  X, Check, Lock, Zap, Sparkles, 
  ArrowRight, CreditCard, ChevronRight, CheckCircle2 
} from 'lucide-react';

const TopUpModal = () => {
  const { 
    user, 
    isUpgradeModalOpen, 
    isTopUpOpen,
    setUpgradeModalOpen, 
    setTopUpOpen,
    upgradeTab, 
    setUpgradeTab, 
    setUser 
  } = useStore();

  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [phonePeStep, setPhonePeStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [successItemName, setSuccessItemName] = useState('');

  const isOpen = Boolean(isUpgradeModalOpen || isTopUpOpen);

  const handleClose = () => {
    setPhonePeStep('idle');
    setUpgradeModalOpen(false);
    setTopUpOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlan = user?.plan || 'free';

  // Process PhonePe Payment
  const handlePhonePeCheckout = async (itemKey: 'micro' | 'mega' | 'basic' | 'pro', itemName: string) => {
    if (!user?._id) return;
    setLoadingItem(itemKey);
    setPhonePeStep('processing');
    
    try {
      // 1. Initiate checkout session
      const checkoutRes = await axios.post('http://localhost:3001/api/billing/checkout', {
        userId: user._id,
        itemKey
      });

      const { transactionId } = checkoutRes.data;

      // 2. Simulate PhonePe Gateway redirection & Instant Webhook callback
      setTimeout(async () => {
        const webhookRes = await axios.post('http://localhost:3001/api/billing/webhook', {
          transactionId,
          userId: user._id,
          itemKey,
          status: 'SUCCESS'
        });

        // 3. Update local state
        setUser({
          ...user,
          lead_credits: webhookRes.data.credits,
          plan: webhookRes.data.plan || user.plan
        });

        setSuccessItemName(itemName);
        setPhonePeStep('success');
        setLoadingItem(null);
      }, 1800);

    } catch (err) {
      console.error('Payment failure', err);
      alert('PhonePe Gateway verification error. Please try again.');
      setLoadingItem(null);
      setPhonePeStep('idle');
    }
  };

  return (
    <div 
      onClick={handleClose} 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-hidden cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-4xl h-[90vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden cursor-default animate-in fade-in zoom-in-95 duration-150 relative z-10 my-auto"
      >
        
        {/* ======================================================== */}
        {/* PINNED MODAL HEADER (Never moves or gets clipped)        */}
        {/* ======================================================== */}
        <div className="shrink-0 p-5 sm:px-8 sm:py-6 bg-gradient-to-r from-gray-900 via-[#18181B] to-gray-900 text-white relative border-b border-gray-800">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }} 
            className="absolute top-5 right-5 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer z-20 shadow-sm"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>

          <div className="max-w-2xl pr-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Compute Scaling & Tier Matrix</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
              Unlock Unlimited B2B Lead Acquisition
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1.5 leading-relaxed">
              Scale past the Free 50-lead pool. Upgrade to continuous daily harvesting limits, automated multi-channel sequences, and PhonePe instant micro-top-ups.
            </p>
          </div>

          {/* Nav Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
            <button
              onClick={() => { setUpgradeTab('plans'); setPhonePeStep('idle'); }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${upgradeTab === 'plans' ? 'bg-white text-[#09090B] shadow-md' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
            >
              Subscription Tiers (Monthly)
            </button>
            <button
              onClick={() => { setUpgradeTab('topup'); setPhonePeStep('idle'); }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${upgradeTab === 'topup' ? 'bg-white text-[#09090B] shadow-md' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
            >
              <CreditCard className="w-3.5 h-3.5 text-accent" />
              <span>Lead Top-Up Bundles (PhonePe)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SCROLLABLE MODAL BODY                                    */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">

        {/* ======================================================== */}
        {/* PHONEPE PROCESSING STATE                                 */}
        {/* ======================================================== */}
        {phonePeStep === 'processing' && (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-[#09090B]">Contacting PhonePe Gateway...</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Simulating secure UPI & Card payment webhook verification. Your credits and tier will update immediately.
            </p>
          </div>
        )}

        {phonePeStep === 'success' && (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-[#09090B]">Payment Verified by PhonePe!</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Successfully activated <span className="font-bold text-charcoal">{successItemName}</span>. Your account compute pool has been updated!
            </p>
            <button 
              onClick={handleClose}
              className="bg-[#09090B] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-colors"
            >
              Back to Command Center
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: SUBSCRIPTION PLANS & EXCLUSION MATRIX             */}
        {/* ======================================================== */}
        {phonePeStep === 'idle' && upgradeTab === 'plans' && (
          <div className="space-y-8">
            
            {/* 3 Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* 1. FREE TIER */}
              <div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${currentPlan === 'free' ? 'border-gray-400 bg-[#FAFAFA]' : 'border-[#E4E4E7] bg-white'}`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Free Tier</span>
                    {currentPlan === 'free' && (
                      <span className="text-[10px] font-extrabold bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full">
                        Active Plan
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-[#09090B] mb-1">₹0</div>
                  <p className="text-xs text-gray-400 mb-6">Forever Free</p>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>50 Saved Leads Pool</strong> (Refreshes every 4d)</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>10 Leads Max</strong> per query</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quick Scan compute</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="line-through">Continuous Daily Limits</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="line-through">Unlimited CSV/Excel Export</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="line-through">Automated Outreach Templates</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button 
                    disabled 
                    className="w-full py-2.5 rounded-xl border border-[#E4E4E7] text-xs font-bold text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                </div>
              </div>

              {/* 2. BASIC TIER */}
              <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${currentPlan === 'basic' ? 'border-accent bg-accent/5' : 'border-[#E4E4E7] bg-white hover:border-gray-400'}`}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-accent">LeadPulse Basic</span>
                    {currentPlan === 'basic' && (
                      <span className="text-[10px] font-extrabold bg-accent text-white px-2.5 py-0.5 rounded-full">
                        Active Plan
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-[#09090B] mb-1">
                    ₹699 <span className="text-xs font-normal text-gray-500">/ month</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">For solo operators & agencies</p>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>600 Saved Leads</strong> & daily continuous limit</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>Unlimited CSV & Excel</strong> exports</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>Automated Templates</strong> & merge tags</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Deep Multi-Page Harvest scope</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="line-through">Dedicated Worker Priority</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="line-through">API Hooks & Webhooks</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => handlePhonePeCheckout('basic', 'LeadPulse Basic (₹699/mo)')}
                    disabled={currentPlan === 'basic' || loadingItem === 'basic'}
                    className="w-full py-2.5 rounded-xl bg-[#09090B] hover:bg-black text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{currentPlan === 'basic' ? 'Active' : 'Upgrade via PhonePe'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3. PRO TIER */}
              <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between relative shadow-lg ${currentPlan === 'pro' ? 'border-purple-600 bg-purple-50/20' : 'border-[#09090B] bg-white'}`}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#09090B] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" /> High Performance
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 pt-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600">LeadPulse Pro</span>
                    {currentPlan === 'pro' && (
                      <span className="text-[10px] font-extrabold bg-purple-600 text-white px-2.5 py-0.5 rounded-full">
                        Active Plan
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-black text-[#09090B] mb-1">
                    ₹1,999 <span className="text-xs font-normal text-gray-500">/ month</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">For growth teams & sales teams</p>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center gap-2 text-gray-800 font-bold">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Unlimited Saved Leads</strong> & 1,000 daily limit</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Dedicated Worker Priority</strong> (Instant queue)</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Advanced Sequences</strong> & dynamic tags</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>WhatsApp & SMS</strong> template pathways</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>API Hooks</strong> & CRM webhooks</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-800 font-medium">
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                      <span><strong>Domain Deliverability</strong> guidance</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => handlePhonePeCheckout('pro', 'LeadPulse Pro (₹1,999/mo)')}
                    disabled={currentPlan === 'pro' || loadingItem === 'pro'}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{currentPlan === 'pro' ? 'Active' : 'Get Pro via PhonePe'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* ======================================================== */}
            {/* FEATURE EXCLUSION COMPARISON MATRIX                      */}
            {/* ======================================================== */}
            <div className="border border-[#E4E4E7] rounded-2xl overflow-hidden">
              <div className="p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-charcoal">
                  Feature Exclusion & Conversion Comparison Matrix
                </h4>
                <span className="text-[11px] text-gray-400">All prices in INR. Instant activation via PhonePe.</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] bg-white text-gray-500 font-bold">
                      <th className="p-3.5 pl-5">Capability / Feature</th>
                      <th className="p-3.5 text-center">Free Tier (₹0)</th>
                      <th className="p-3.5 text-center text-accent">Basic (₹699/mo)</th>
                      <th className="p-3.5 text-center text-purple-700">Pro (₹1,999/mo)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7]">
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Saved Leads Capacity & Pool</td>
                      <td className="p-3.5 text-center text-gray-600">50 Saved Leads (4-day pool)</td>
                      <td className="p-3.5 text-center font-bold text-accent">600 Saved Leads</td>
                      <td className="p-3.5 text-center font-bold text-purple-700">Unlimited Saved Leads</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Daily Harvesting Velocity</td>
                      <td className="p-3.5 text-center text-gray-600">10 Leads / Query</td>
                      <td className="p-3.5 text-center font-bold text-accent">600 Leads / Day</td>
                      <td className="p-3.5 text-center font-bold text-purple-700">1,000+ Leads / Day</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Per-Query Generation Limit</td>
                      <td className="p-3.5 text-center text-amber-600 font-bold">10 Leads Max</td>
                      <td className="p-3.5 text-center text-gray-800 font-medium">Batch Limits (20+)</td>
                      <td className="p-3.5 text-center font-bold text-purple-700">Unlimited Batches</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Pool Auto-Refresh Schedule</td>
                      <td className="p-3.5 text-center text-gray-600">Every 4 Days</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">Daily Continuous</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">Daily Continuous</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Scope Proficiency Modes</td>
                      <td className="p-3.5 text-center text-gray-600">Quick Scan only</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">Deep Multi-Page Harvest</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">Deep Multi-Page Harvest</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">CSV & Excel Lead Export</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">✔ Unlimited</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">✔ Unlimited + JSON</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Outreach Email Templates & Merge Tags</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">✔ Unlimited Tags</td>
                      <td className="p-3.5 text-center text-emerald-600 font-bold">✔ Advanced Sequences</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">WhatsApp & SMS Integration</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-gray-400">Standard Pathways</td>
                      <td className="p-3.5 text-center text-purple-700 font-bold">✔ Official WhatsApp API</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">Dedicated Worker Priority (No Queuing)</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-purple-700 font-bold">✔ Dedicated Worker</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-5 font-semibold text-gray-800">API Hooks & Webhooks</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-red-500 font-bold">❌ Locked</td>
                      <td className="p-3.5 text-center text-purple-700 font-bold">✔ Full API Access</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LEAD TOP-UP BUNDLES (PHONEPE INTEGRATED)          */}
        {/* ======================================================== */}
        {phonePeStep === 'idle' && upgradeTab === 'topup' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>Need leads without a monthly commitment?</strong> Purchase one-time micro-transaction bundles processed instantly via PhonePe. Credits never expire and stack on top of your current pool!
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* MICRO PACK */}
              <div className="p-6 rounded-2xl border-2 border-[#E4E4E7] hover:border-accent bg-white transition-all shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-accent">Micro Pack</span>
                    <span className="text-[11px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-md">Instant UPI</span>
                  </div>
                  <div className="text-3xl font-black text-[#09090B] mb-1">₹50</div>
                  <p className="text-xs text-gray-500 mb-6">Micro-transaction top-up</p>

                  <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E4E4E7] mb-6">
                    <div className="text-xl font-extrabold text-[#09090B] mb-0.5">+20 Extra Leads</div>
                    <p className="text-[11px] text-gray-500">Perfect for a quick local niche query (₹2.5 / lead)</p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-600 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Never expires</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Usable on Quick or Deep harvest</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Instant PhonePe activation</li>
                  </ul>
                </div>

                <button 
                  onClick={() => handlePhonePeCheckout('micro', 'Micro Pack (20 Leads)')}
                  disabled={loadingItem === 'micro'}
                  className="w-full py-3 rounded-xl bg-[#09090B] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Pay ₹50 via PhonePe</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* MEGA PACK */}
              <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-white transition-all shadow-md flex flex-col justify-between relative">
                <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Best Value (₹1 / Lead)
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">Mega Pack</span>
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">Power Bundle</span>
                  </div>
                  <div className="text-3xl font-black text-[#09090B] mb-1">₹1,000</div>
                  <p className="text-xs text-gray-500 mb-6">Volume lead acquisition bundle</p>

                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 mb-6">
                    <div className="text-xl font-extrabold text-emerald-900 mb-0.5">+1,000 Extra Leads</div>
                    <p className="text-[11px] text-emerald-700">Highest discount rate available across LeadPulse</p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-600 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 1,000 Verified Lead Credits</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Continuous extraction without cap</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Priority headless browser queue</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Instant PhonePe webhook settlement</li>
                  </ul>
                </div>

                <button 
                  onClick={() => handlePhonePeCheckout('mega', 'Mega Pack (1,000 Leads)')}
                  disabled={loadingItem === 'mega'}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Pay ₹1,000 via PhonePe</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            <div className="p-4 bg-[#F4F4F5] rounded-xl text-center text-[11px] text-gray-500">
              Secured by 256-bit PhonePe Gateway encryption • UPI, Cards, NetBanking, and Wallets accepted
            </div>
          </div>
        )}

        </div>

        {/* ======================================================== */}
        {/* PINNED STICKY FOOTER (Always accessible at bottom)       */}
        {/* ======================================================== */}
        <div className="shrink-0 px-6 py-3.5 bg-[#FAFAFA] border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Secured by 256-bit PhonePe Gateway encryption • UPI, Cards & NetBanking</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl border border-[#E4E4E7] bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors shadow-xs cursor-pointer"
          >
            Dismiss / Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default TopUpModal;
