import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Mail, MessageCircle, MessageSquare, Send, CheckCircle2, 
  ChevronDown, Phone, Layout, Monitor, 
  Smartphone, Sparkles, Sliders, Edit3, ArrowRight,
  ShieldCheck, Tag, Search, Check, Loader2, ExternalLink, Key,
  Plus, Trash2, Upload, Wand2
} from 'lucide-react';
import TemplateGalleryModal from '../components/TemplateGalleryModal';
import DispatchTrackerModal from '../components/DispatchTrackerModal';
import EmailProviderModal from '../components/EmailProviderModal';
import { EMAIL_TEMPLATES } from '../data/emailTemplates';
import type { TemplateId } from '../data/emailTemplates';
import { WHATSAPP_TEMPLATES, EMAIL_CAPTURE_BRIDGE_SCRIPT } from '../data/whatsappTemplates';
import type { WhatsAppTemplate } from '../data/whatsappTemplates';
import { useStore } from '../store/useStore';
import axios from 'axios';

const OutreachCenter = () => {
  const { user } = useStore();
  const [activeChannel, setActiveChannel] = useState<'email' | 'whatsapp' | 'sms'>('email');
  
  // Template Studio State
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('one_column');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [dispatchNotification, setDispatchNotification] = useState<{ message: string; previewUrl?: string } | null>(null);
  const [editorLayer, setEditorLayer] = useState<'content' | 'template'>('content');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Active Template Data State
  const [templateData, setTemplateData] = useState(EMAIL_TEMPLATES.one_column.defaultData);

  // WhatsApp Studio State
  const [selectedWhatsAppId, setSelectedWhatsAppId] = useState<string>('local_compliment');
  const [whatsAppMessage, setWhatsAppMessage] = useState<string>(WHATSAPP_TEMPLATES[0].defaultMessage);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Template Styling Layer Settings
  const [templateStyling, setTemplateStyling] = useState({
    containerWidth: '600px',
    spacingPadding: '24px',
    accentColor: '#4F46E5', // Indigo
    borderRadius: '16px',
    showComplianceFooter: true
  });

  // Default fallback leads if user hasn't harvested any leads yet
  const defaultLeads = [
    {
      _id: 'default-1',
      businessName: 'Summit Real Estate Co.',
      location: 'Kalyan West',
      category: 'Commercial Properties',
      fieldOfWork: 'Commercial Properties',
      firstName: 'Sarah',
      phone: '+91 98201 44520',
      rating: '4.9',
      email: 'sarah@summitproperties.com'
    },
    {
      _id: 'default-2',
      businessName: 'Apex Dental Care & Implant Clinic',
      location: 'Kalyan West',
      category: 'Dentists',
      fieldOfWork: 'Dental Healthcare',
      firstName: 'Dr. Rahul',
      phone: '+91 98332 10984',
      rating: '4.8',
      email: 'drrahul@apexdental.com'
    },
    {
      _id: 'default-3',
      businessName: 'The Daily Roast Artisanal Cafe',
      location: 'Bandra West, Mumbai',
      category: 'Cafes & Bakeries',
      fieldOfWork: 'Specialty Coffee & Dining',
      firstName: 'Karan',
      phone: '+91 99204 88712',
      rating: '4.7',
      email: 'karan@dailyroastcafe.com'
    },
    {
      _id: 'default-4',
      businessName: 'BlueSky Digital Agency',
      location: 'Andheri East',
      category: 'Digital Marketing',
      fieldOfWork: 'B2B Marketing & SEO',
      firstName: 'Ananya',
      phone: '+91 97654 32109',
      rating: '4.9',
      email: 'ananya@blueskydigital.in'
    }
  ];

  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [previewLead, setPreviewLead] = useState(defaultLeads[0]);
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const leadDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch real leads from DB
  useEffect(() => {
    const fetchUserLeads = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get('http://localhost:3001/api/leads', {
          headers: { userid: user._id }
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((l: any) => ({
            _id: l._id,
            businessName: l.businessName || 'Unnamed Business',
            location: l.location || 'Kalyan West',
            category: l.category || 'Local Business',
            fieldOfWork: l.category || 'Professional Services',
            firstName: l.businessName ? l.businessName.split(' ')[0] : 'Partner',
            phone: l.phone || '+91 98000 00000',
            rating: l.rating || '4.8',
            email: l.email || `contact@${(l.businessName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
          }));
          setLeadsList(mapped);
          setPreviewLead(mapped[0]); // Default to user's first scraped lead
        }
      } catch (err) {
        console.error('Failed to load leads for preview', err);
      }
    };
    fetchUserLeads();
  }, [user?._id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (leadDropdownRef.current && !leadDropdownRef.current.contains(e.target as Node)) {
        setIsLeadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableLeads = leadsList.length > 0 ? leadsList : defaultLeads;
  const filteredAvailableLeads = availableLeads.filter(l => 
    l.businessName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
    (l.category && l.category.toLowerCase().includes(leadSearchQuery.toLowerCase()))
  );

  const activeTemplateConfig = EMAIL_TEMPLATES[selectedTemplateId];

  // Select a new template from gallery
  const handleSelectTemplate = (id: TemplateId) => {
    setSelectedTemplateId(id);
    setTemplateData(EMAIL_TEMPLATES[id].defaultData);
  };

  const mergeTags = [
    '{{business_name}}', 
    '{{location}}', 
    '{{field_of_work}}', 
    '{{first_name}}',
    '{{phone}}',
    '{{tag}}',
    '{{rating}}'
  ];

  // AI Copilot State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState<'persuasive' | 'direct' | 'executive' | 'urgent'>('persuasive');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // File Upload Helper for Dynamic Catalog Products
  const handleProductImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image file smaller than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const next = [...(templateData.products || [])];
      if (next[idx]) {
        next[idx].imageUrl = base64;
        setTemplateData({ ...templateData, products: next });
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Auto-Compose Handler for Any Template
  const handleAiGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse.trim()) return;
    setIsAiGenerating(true);
    setAiSuccessMessage(null);

    try {
      const res = await axios.post('http://localhost:3001/api/outreach/ai-generate', {
        templateId: selectedTemplateId,
        prompt: promptToUse,
        tone: aiTone,
        niche: previewLead?.fieldOfWork || previewLead?.category,
        userBusinessName: user?.name || 'LeadPulse'
      }, {
        headers: { userid: user?._id }
      });

      if (res.data?.generatedData) {
        setTemplateData(prev => ({
          ...prev,
          ...res.data.generatedData
        }));
        setAiSuccessMessage('✨ All template segments auto-composed with merge tags!');
        setTimeout(() => setAiSuccessMessage(null), 6000);
      }
    } catch (err) {
      console.warn('Backend AI endpoint failed, falling back to instant client AI synthesis:', err);
      // Robust client-side fallback synthesizer
      const p = promptToUse.trim();
      const generated: any = {
        subject: `Strategic Growth Initiative for {{business_name}}`,
        preheader: `Custom Strategic Proposal`,
        headline: `Hi {{first_name}}, Scale {{business_name}} in {{location}}`,
        subheadline: `A tailored strategy designed for ${previewLead?.fieldOfWork || '{{field_of_work}}'}`,
        body: `Hi {{first_name}},\n\n${p}\n\nWe analyzed the local footprint of {{business_name}} across {{location}} and prepared an autonomous growth framework specifically designed to help your team achieve consistent high-ticket conversions.\n\nKey highlights for {{business_name}}:\n• Verified decision-maker connections across {{location}}\n• Zero manual outreach friction with high-deliverability transport\n• Measurable response improvements for {{field_of_work}} operators\n\nWould you have 5 minutes this week for a brief conversation?`,
        ctaText: 'Book 5-Min Intro Call',
        ctaUrl: 'https://calendly.com/leadpulse/demo'
      };

      if (selectedTemplateId === 'two_column' || selectedTemplateId === 'hybrid') {
        generated.col1Title = 'Option A: Managed System';
        generated.col1Body = `Let our team execute campaigns for {{business_name}} across {{location}}.`;
        generated.col1Cta = 'View Managed Setup';
        generated.col1CtaUrl = 'https://leadpulse.io/managed';
        generated.col2Title = 'Option B: Self-Serve Suite';
        generated.col2Body = `Use our autonomous lead harvester with email and WhatsApp triggers.`;
        generated.col2Cta = 'Explore Software';
        generated.col2CtaUrl = 'https://leadpulse.io/software';
      } else if (selectedTemplateId === 'zig_zag') {
        generated.zig1Title = '1. Geographic Discovery';
        generated.zig1Text = `Extract verified contacts in {{location}} with zero scraping blocks.`;
        generated.zig1Cta = 'Learn More →';
        generated.zig1CtaUrl = 'https://leadpulse.io/harvester';
        generated.zig2Title = '2. Autonomous Outreach';
        generated.zig2Text = `Send personalized merge tag emails directly to recipient inboxes.`;
        generated.zig2Cta = 'View Live Demo →';
        generated.zig2CtaUrl = 'https://leadpulse.io/demo';
      } else if (selectedTemplateId === 'f_pattern') {
        generated.fBullet1 = `Local Geo-Targeting: Reach verified businesses in {{location}} instantly.`;
        generated.fBullet2 = `Inbox Deliverability: 99.4% deliverability with compliance footers.`;
        generated.fBullet3 = `Predictable Conversion: High response templates tailored to {{field_of_work}}.`;
        generated.fBottomNote = `Strategic Summary: ${p}`;
      } else if (selectedTemplateId === 'dynamic_product_feed') {
        generated.products = [
          {
            name: 'Local Market Starter',
            category: 'Lead Discovery',
            price: '₹699 / mo',
            badge: 'Starter',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
            description: `Get started with verified local prospects in {{location}}.`,
            ctaText: 'Select Starter',
            ctaUrl: 'https://leadpulse.io/checkout?plan=starter'
          },
          {
            name: 'Pro Multi-Channel Suite',
            category: 'Email + WhatsApp',
            price: '₹1,999 / mo',
            badge: 'Most Popular',
            imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
            description: `Full autonomous dispatch with dedicated worker node.`,
            ctaText: 'Select Pro',
            ctaUrl: 'https://leadpulse.io/checkout?plan=pro'
          }
        ];
      }

      setTemplateData(prev => ({ ...prev, ...generated }));
      setAiSuccessMessage('✨ All template segments auto-composed with merge tags!');
      setTimeout(() => setAiSuccessMessage(null), 6000);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const insertTag = (tag: string) => {
    if (activeChannel === 'whatsapp') {
      setWhatsAppMessage(prev => prev + ' ' + tag);
    } else {
      setTemplateData(prev => ({
        ...prev,
        body: prev.body + ' ' + tag
      }));
    }
  };

  // Highlighting Renderer for text preview with merge tag styling
  const renderPreviewHtml = (text?: string) => {
    if (!text) return '';
    let rendered = text;
    rendered = rendered.replace(/{{business_name}}/g, `<span class="bg-amber-100 text-amber-900 font-bold px-1 rounded">${previewLead.businessName}</span>`);
    rendered = rendered.replace(/{{location}}/g, `<span class="bg-blue-100 text-blue-900 font-bold px-1 rounded">${previewLead.location}</span>`);
    rendered = rendered.replace(/{{field_of_work}}/g, `<span class="bg-purple-100 text-purple-900 font-bold px-1 rounded">${previewLead.fieldOfWork}</span>`);
    rendered = rendered.replace(/{{tag}}/g, `<span class="bg-purple-100 text-purple-900 font-bold px-1 rounded">${previewLead.category || previewLead.fieldOfWork}</span>`);
    rendered = rendered.replace(/{{first_name}}/g, `<span class="bg-emerald-100 text-emerald-900 font-bold px-1 rounded">${previewLead.firstName}</span>`);
    rendered = rendered.replace(/{{phone}}/g, `<span class="bg-gray-200 text-gray-900 font-bold px-1 rounded">${previewLead.phone}</span>`);
    rendered = rendered.replace(/{{rating}}/g, `<span class="bg-amber-100 text-amber-900 font-bold px-1 rounded">${previewLead.rating}</span>`);
    return rendered;
  };

  // WhatsApp Hook Selection Handler
  const handleSelectWhatsAppTemplate = (tpl: WhatsAppTemplate) => {
    setSelectedWhatsAppId(tpl.id);
    setWhatsAppMessage(tpl.defaultMessage);
  };

  // Insert Email Capture Bridge Script
  const handleInsertBridgeScript = () => {
    setWhatsAppMessage(prev => prev + '\n\n' + EMAIL_CAPTURE_BRIDGE_SCRIPT);
  };

  // Format Text for External Copy / Dispatch
  const getCompiledWhatsAppMessage = (lead: any) => {
    let msg = whatsAppMessage;
    msg = msg.replace(/{{business_name}}/g, lead.businessName);
    msg = msg.replace(/{{location}}/g, lead.location);
    msg = msg.replace(/{{field_of_work}}/g, lead.fieldOfWork || lead.category);
    msg = msg.replace(/{{tag}}/g, lead.category || lead.fieldOfWork);
    msg = msg.replace(/{{first_name}}/g, lead.firstName || lead.businessName);
    msg = msg.replace(/{{phone}}/g, lead.phone);
    msg = msg.replace(/{{rating}}/g, lead.rating || '4.8');
    return msg;
  };

  // Open Direct in WhatsApp Web
  const handleOpenWhatsAppWeb = (lead: any) => {
    const rawText = getCompiledWhatsAppMessage(lead);
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawText)}`;
    window.open(url, '_blank');
  };

  // Copy WhatsApp Script
  const handleCopyWhatsApp = () => {
    const rawText = getCompiledWhatsAppMessage(previewLead);
    navigator.clipboard.writeText(rawText);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  // Direct Single Email Test Dispatcher
  const handleSendSingleTest = async () => {
    setIsSendingSingle(true);
    setDispatchNotification(null);
    try {
      const res = await axios.post('http://localhost:3001/api/outreach/dispatch-single', {
        templateId: selectedTemplateId,
        templateData,
        templateStyling,
        targetLead: previewLead,
        customRecipientEmail: previewLead.email,
        fromName: user?.name || 'Alex Roberts',
        fromEmail: user?.email || 'alex@leadpulse.io'
      }, {
        headers: { userid: user?._id || 'demo-user' }
      });

      if (res.data.success) {
        setDispatchNotification({
          message: `Direct test email dispatched to ${previewLead.businessName}!`,
          previewUrl: res.data.result?.previewUrl
        });
      }
    } catch (err: any) {
      console.error('Failed to send single test:', err);
      setDispatchNotification({
        message: `Failed to dispatch test: ${err?.response?.data?.error || err.message}`
      });
    } finally {
      setIsSendingSingle(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-[#FAFAFA] font-sans text-[#09090B]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Multi-Channel Outreach & Email Template Studio" />

        <div className="p-6 sm:p-8 flex flex-col gap-6 min-h-0">
          
          {/* Dispatch Live Notification Banner */}
          {dispatchNotification && (
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-emerald-900">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-emerald-950">Direct Dispatch Status</div>
                  <div className="text-xs text-emerald-800">{dispatchNotification.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {dispatchNotification.previewUrl && (
                  <a 
                    href={dispatchNotification.previewUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Inspect Delivered Inbox</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button 
                  onClick={() => setDispatchNotification(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-6 min-h-0">
          
          {/* ======================================================== */}
          {/* LEFT: TWO-LAYER TEMPLATE EDITOR SECTION                  */}
          {/* ======================================================== */}
          <div className="w-full xl:w-[50%] flex flex-col bg-white border border-[#E4E4E7] rounded-2xl shadow-xs overflow-hidden min-h-[750px]">
            
            {/* Channel Tabs */}
            <div className="flex border-b border-[#E4E4E7] bg-[#F4F4F5]/60 px-4 pt-3 gap-2">
              <button 
                onClick={() => setActiveChannel('email')}
                className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeChannel === 'email' 
                    ? 'border-accent text-accent bg-white rounded-t-xl shadow-xs' 
                    : 'border-transparent text-gray-500 hover:text-charcoal'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Template Studio (8 Layouts)
              </button>
              <button 
                onClick={() => setActiveChannel('whatsapp')}
                className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeChannel === 'whatsapp' 
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs' 
                    : 'border-transparent text-gray-500 hover:text-charcoal'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Business API
              </button>
              <button 
                onClick={() => setActiveChannel('sms')}
                className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeChannel === 'sms' 
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs' 
                    : 'border-transparent text-gray-500 hover:text-charcoal'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> SMS Pathways
              </button>
            </div>

            {/* Email Template Selector Bar */}
            {activeChannel === 'email' && (
              <div className="px-6 py-3.5 border-b border-[#E4E4E7] bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Layout:</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E4E4E7] rounded-xl text-xs font-bold text-[#09090B]">
                    <Layout className="w-3.5 h-3.5 text-accent" />
                    <span>{activeTemplateConfig.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsProviderModalOpen(true)}
                    className="bg-white border border-[#E4E4E7] hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Configure Gmail, Resend, or Custom SMTP for direct inbox delivery"
                  >
                    <Key className="w-3.5 h-3.5 text-accent" />
                    <span>Mail Gateway</span>
                  </button>

                  <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="bg-accent text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold hover:bg-accent-dark transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Browse 8 Layouts</span>
                  </button>

                  {/* Two-Layer Architecture Switcher */}
                  <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7] text-xs font-bold">
                    <button
                      onClick={() => setEditorLayer('content')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        editorLayer === 'content' ? 'bg-white text-[#09090B] shadow-xs' : 'text-gray-500'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Content Layer</span>
                    </button>
                    <button
                      onClick={() => setEditorLayer('template')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        editorLayer === 'template' ? 'bg-white text-[#09090B] shadow-xs' : 'text-gray-500'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Template Layer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Template Selector Bar */}
            {activeChannel === 'whatsapp' && (
              <div className="px-6 py-3.5 border-b border-[#E4E4E7] bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Hook:</span>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{WHATSAPP_TEMPLATES.find(t => t.id === selectedWhatsAppId)?.name || '1. The Local Compliment Hook'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyWhatsApp}
                    className="bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{copiedWhatsApp ? 'Copied Script!' : 'Copy Script'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenWhatsAppWeb(previewLead)}
                    className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp Web</span>
                  </button>
                </div>
              </div>
            )}

            {/* Editor Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-5">
              
              {/* WHATSAPP TAB VIEW */}
              {activeChannel === 'whatsapp' && (
                <div className="space-y-4">
                  {/* 10 Structured WhatsApp Hook Selector Pills */}
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                      Select Hook Script (10 Conversational Frameworks)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {WHATSAPP_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleSelectWhatsAppTemplate(tpl)}
                          className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                            selectedWhatsAppId === tpl.id 
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs' 
                              : 'bg-white border-[#E4E4E7] hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-bold text-[#09090B] truncate">{tpl.name}</span>
                            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                              {tpl.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 line-clamp-1">{tpl.hookType}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Hook Context Card */}
                  {(() => {
                    const activeTpl = WHATSAPP_TEMPLATES.find(t => t.id === selectedWhatsAppId) || WHATSAPP_TEMPLATES[0];
                    return (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hook Strategy: {activeTpl.hookType}</span>
                          </div>
                          <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                            {activeTpl.badge}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-900 leading-relaxed">
                          {activeTpl.description}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Merge Tags Insertion Toolbar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-charcoal">WhatsApp Message Body</label>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {mergeTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => insertTag(tag)}
                            className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      rows={6}
                      value={whatsAppMessage}
                      onChange={(e) => setWhatsAppMessage(e.target.value)}
                      className="w-full border border-[#E4E4E7] rounded-xl p-3.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                    />
                  </div>

                  {/* Organic Email-Capture Bridge Feature */}
                  <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Organic Email-Capture Bridge</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleInsertBridgeScript}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        + Insert Email Bridge Hook
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-900 italic bg-white/70 p-2 rounded-lg border border-amber-200/50">
                      "{EMAIL_CAPTURE_BRIDGE_SCRIPT}"
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Framed with convenience to effortlessly upgrade phone-only leads into verified email contacts.
                    </p>
                  </div>
                </div>
              )}

              {/* SMS TAB VIEW */}
              {activeChannel === 'sms' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>DLT registered SMS gateway enabled (160 characters per segment).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">SMS Content</label>
                    <textarea 
                      rows={6}
                      value={templateData.body}
                      onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                      className="w-full border border-[#E4E4E7] rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL CHANNEL VIEW */}
              {activeChannel === 'email' && (
                <>
                  {/* ======================================================== */}
                  {/* LAYER 1: CONTENT LAYER (Rich-Text & Merge Tags)          */}
                  {/* ======================================================== */}
                  {editorLayer === 'content' && (
                    <div className="space-y-4">
                      
                      {/* AI Smart Assistant Copilot Card */}
                      <div className="bg-gradient-to-br from-purple-950 via-[#1E1B4B] to-[#0F172A] text-white p-4 rounded-2xl shadow-md border border-purple-500/30 space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs text-white flex items-center gap-1.5">
                                <span>AI Email Copilot & Segment Auto-Composer</span>
                                <span className="text-[9px] bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded-full border border-purple-400/30 font-bold uppercase tracking-wider">
                                  Smart
                                </span>
                              </h4>
                              <p className="text-[10px] text-purple-200/70">Enter your goal/pitch once — AI writes and auto-fills every segment across this template.</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <select
                              value={aiTone}
                              onChange={(e: any) => setAiTone(e.target.value)}
                              className="bg-purple-950/80 border border-purple-400/40 text-purple-200 text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer"
                            >
                              <option value="persuasive">Tone: High-Converting</option>
                              <option value="direct">Tone: Direct & Concise</option>
                              <option value="executive">Tone: Executive B2B</option>
                              <option value="urgent">Tone: Limited Time / Urgent</option>
                            </select>
                          </div>
                        </div>

                        {/* Quick Prompts Chips */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-purple-300/80 mr-1">Quick Goals:</span>
                          {[
                            { label: '🔥 Cold B2B Intro', prompt: 'Introduce our agency services to local business owners with a free consultation.' },
                            { label: '📅 15-Min Meeting', prompt: 'Book a 15-minute introductory growth call with decision makers.' },
                            { label: '🎁 20% Special Discount', prompt: 'Offer an exclusive 20% discount on packages reserved this week.' },
                            { label: '🔍 Free Audit Pitch', prompt: 'Offer a complimentary local visibility audit and competitor gap analysis.' },
                            { label: '💼 Catalog Menu Pitch', prompt: 'Showcase our dynamic tiered service packages and pricing options.' }
                          ].map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => {
                                setAiPrompt(chip.prompt);
                                handleAiGenerate(chip.prompt);
                              }}
                              className="bg-white/10 hover:bg-white/20 text-purple-100 border border-white/10 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>

                        {/* Input Box & Generate Button */}
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAiGenerate();
                                }
                              }}
                              placeholder="e.g. Pitch dental implants to clinics in Kalyan with a 20% seasonal voucher..."
                              className="w-full bg-black/40 border border-purple-400/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-purple-300/50 outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAiGenerate()}
                            disabled={isAiGenerating || !aiPrompt.trim()}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            {isAiGenerating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating...</span>
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Auto-Fill Template</span>
                              </>
                            )}
                          </button>
                        </div>

                        {aiSuccessMessage && (
                          <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>{aiSuccessMessage}</span>
                          </div>
                        )}
                      </div>

                      {/* Subject Line */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Line</label>
                        <input 
                          type="text" 
                          value={templateData.subject}
                          onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                          className="w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-accent outline-none shadow-xs"
                          placeholder="e.g. Special Partnership Proposal for {{business_name}}"
                        />
                      </div>

                      {/* Catchphrase / Preheader Badge (Editable for all templates) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-gray-700">Catchphrase / Teaser Badge (Preheader)</label>
                          <span className="text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded">Editable Header Hook</span>
                        </div>
                        <input 
                          type="text" 
                          value={templateData.preheader || ''}
                          onChange={(e) => setTemplateData({ ...templateData, preheader: e.target.value })}
                          className="w-full border border-[#E4E4E7] rounded-xl px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-accent outline-none shadow-xs"
                          placeholder="e.g. Exclusive 500-Lead Reserve, Monthly Partner Brief, Accelerate your pipeline..."
                        />
                      </div>

                      {/* Headline (for non-text-only) */}
                      {selectedTemplateId !== 'text_only' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Primary Headline</label>
                          <input 
                            type="text" 
                            value={templateData.headline}
                            onChange={(e) => setTemplateData({ ...templateData, headline: e.target.value })}
                            className="w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-accent outline-none shadow-xs"
                          />
                        </div>
                      )}

                      {/* Subheadline (for one column, hybrid, inverted pyramid, f pattern, dynamic feed) */}
                      {templateData.subheadline !== undefined && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Subheadline / Context Hook</label>
                          <input 
                            type="text" 
                            value={templateData.subheadline}
                            onChange={(e) => setTemplateData({ ...templateData, subheadline: e.target.value })}
                            className="w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-accent outline-none shadow-xs"
                          />
                        </div>
                      )}

                      {/* Merge Tags Quick Insert Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-gray-700">Message Body Content</label>
                          <span className="text-[11px] text-gray-400">Click merge tags below to inject</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl mb-2">
                          <span className="text-[11px] font-bold text-gray-400 self-center mr-1">Tags:</span>
                          {mergeTags.map(tag => (
                            <button 
                              key={tag}
                              type="button"
                              onClick={() => insertTag(tag)}
                              className="bg-white border border-[#E4E4E7] hover:border-accent hover:text-accent text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Tag className="w-3 h-3 text-accent" />
                              <span>{tag}</span>
                            </button>
                          ))}
                        </div>

                        <textarea 
                          rows={5}
                          value={templateData.body}
                          onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                          className="w-full border border-[#E4E4E7] rounded-xl p-4 text-xs font-medium focus:ring-2 focus:ring-accent outline-none shadow-xs leading-relaxed"
                          placeholder="Compose your structured message copy..."
                        />
                      </div>

                      {/* Primary Call To Action Button & Destination URL */}
                      {templateData.ctaText !== undefined && (
                        <div className="p-4 bg-gradient-to-r from-accent/5 to-purple-500/5 border border-accent/20 rounded-xl space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Primary Action Button & Target URL</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Button Label / Text</label>
                              <input 
                                type="text" 
                                value={templateData.ctaText}
                                onChange={(e) => setTemplateData({ ...templateData, ctaText: e.target.value })}
                                placeholder="e.g. Book a 5-Min Intro Call"
                                className="w-full bg-white border border-[#E4E4E7] rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-accent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">Button Destination Link URL</label>
                              <input 
                                type="text" 
                                value={templateData.ctaUrl || ''}
                                onChange={(e) => setTemplateData({ ...templateData, ctaUrl: e.target.value })}
                                placeholder="https://calendly.com/... or https://yoursite.com"
                                className="w-full bg-white border border-[#E4E4E7] rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-accent font-mono text-gray-800"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Two Column Section Editors (Side-by-Side Dual Blocks) */}
                      {(selectedTemplateId === 'two_column' || selectedTemplateId === 'hybrid') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 bg-blue-50/40 border border-blue-200 rounded-xl">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-blue-950">Column 1 Content & Action</h5>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Option A</span>
                            </div>
                            <input 
                              type="text"
                              placeholder="Column 1 Title"
                              value={templateData.col1Title || ''}
                              onChange={(e) => setTemplateData({ ...templateData, col1Title: e.target.value })}
                              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                            <textarea 
                              rows={2}
                              placeholder="Column 1 Copy"
                              value={templateData.col1Body || ''}
                              onChange={(e) => setTemplateData({ ...templateData, col1Body: e.target.value })}
                              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs outline-none"
                            />
                            <div className="space-y-1.5 pt-1">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-600">Button 1 Label</label>
                                <input 
                                  type="text"
                                  placeholder="Col 1 Button Label"
                                  value={templateData.col1Cta || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, col1Cta: e.target.value })}
                                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-semibold outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-600">Button 1 Destination URL</label>
                                <input 
                                  type="text"
                                  placeholder="https://yoursite.com/inbound"
                                  value={templateData.col1CtaUrl || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, col1CtaUrl: e.target.value })}
                                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-mono outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-blue-950">Column 2 Content & Action</h5>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Option B</span>
                            </div>
                            <input 
                              type="text"
                              placeholder="Column 2 Title"
                              value={templateData.col2Title || ''}
                              onChange={(e) => setTemplateData({ ...templateData, col2Title: e.target.value })}
                              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-bold outline-none"
                            />
                            <textarea 
                              rows={2}
                              placeholder="Column 2 Copy"
                              value={templateData.col2Body || ''}
                              onChange={(e) => setTemplateData({ ...templateData, col2Body: e.target.value })}
                              className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs outline-none"
                            />
                            <div className="space-y-1.5 pt-1">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-600">Button 2 Label</label>
                                <input 
                                  type="text"
                                  placeholder="Col 2 Button Label"
                                  value={templateData.col2Cta || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, col2Cta: e.target.value })}
                                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-semibold outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-600">Button 2 Destination URL</label>
                                <input 
                                  type="text"
                                  placeholder="https://yoursite.com/outbound"
                                  value={templateData.col2CtaUrl || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, col2CtaUrl: e.target.value })}
                                  className="w-full bg-white border border-blue-200 rounded-lg p-2 text-xs font-mono outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Zig-Zag Section Editors */}
                      {selectedTemplateId === 'zig_zag' && (
                        <div className="space-y-3 p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl">
                          <h5 className="font-bold text-xs text-emerald-950">Alternating Story Blocks (Z-Pattern) with Action Links</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-2">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">Step 01 Story Block</span>
                              <input 
                                type="text"
                                placeholder="Step 1 Title"
                                value={templateData.zig1Title || ''}
                                onChange={(e) => setTemplateData({ ...templateData, zig1Title: e.target.value })}
                                className="w-full border border-gray-200 rounded p-1.5 text-xs font-bold outline-none"
                              />
                              <textarea 
                                rows={2}
                                placeholder="Step 1 Narrative"
                                value={templateData.zig1Text || ''}
                                onChange={(e) => setTemplateData({ ...templateData, zig1Text: e.target.value })}
                                className="w-full border border-gray-200 rounded p-1.5 text-xs outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <input 
                                  type="text"
                                  placeholder="Button Label"
                                  value={templateData.zig1Cta || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, zig1Cta: e.target.value })}
                                  className="w-full border border-gray-200 rounded p-1.5 text-xs font-semibold outline-none"
                                />
                                <input 
                                  type="text"
                                  placeholder="https://yoursite.com/step1"
                                  value={templateData.zig1CtaUrl || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, zig1CtaUrl: e.target.value })}
                                  className="w-full border border-gray-200 rounded p-1.5 text-xs font-mono outline-none"
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-2">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">Step 02 Story Block</span>
                              <input 
                                type="text"
                                placeholder="Step 2 Title"
                                value={templateData.zig2Title || ''}
                                onChange={(e) => setTemplateData({ ...templateData, zig2Title: e.target.value })}
                                className="w-full border border-gray-200 rounded p-1.5 text-xs font-bold outline-none"
                              />
                              <textarea 
                                rows={2}
                                placeholder="Step 2 Narrative"
                                value={templateData.zig2Text || ''}
                                onChange={(e) => setTemplateData({ ...templateData, zig2Text: e.target.value })}
                                className="w-full border border-gray-200 rounded p-1.5 text-xs outline-none"
                              />
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <input 
                                  type="text"
                                  placeholder="Button Label"
                                  value={templateData.zig2Cta || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, zig2Cta: e.target.value })}
                                  className="w-full border border-gray-200 rounded p-1.5 text-xs font-semibold outline-none"
                                />
                                <input 
                                  type="text"
                                  placeholder="https://yoursite.com/step2"
                                  value={templateData.zig2CtaUrl || ''}
                                  onChange={(e) => setTemplateData({ ...templateData, zig2CtaUrl: e.target.value })}
                                  className="w-full border border-gray-200 rounded p-1.5 text-xs font-mono outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* F-Pattern Editorial Points */}
                      {selectedTemplateId === 'f_pattern' && (
                        <div className="space-y-3 p-4 bg-red-50/40 border border-red-200 rounded-xl">
                          <h5 className="font-bold text-xs text-red-950">F-Pattern Editorial Scan Bullet Points</h5>
                          <input 
                            type="text" 
                            value={templateData.fBullet1 || ''}
                            onChange={(e) => setTemplateData({ ...templateData, fBullet1: e.target.value })}
                            className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs outline-none"
                            placeholder="Bullet 1"
                          />
                          <input 
                            type="text" 
                            value={templateData.fBullet2 || ''}
                            onChange={(e) => setTemplateData({ ...templateData, fBullet2: e.target.value })}
                            className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs outline-none"
                            placeholder="Bullet 2"
                          />
                          <input 
                            type="text" 
                            value={templateData.fBullet3 || ''}
                            onChange={(e) => setTemplateData({ ...templateData, fBullet3: e.target.value })}
                            className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs outline-none"
                            placeholder="Bullet 3"
                          />
                          <input 
                            type="text" 
                            value={templateData.fBottomNote || ''}
                            onChange={(e) => setTemplateData({ ...templateData, fBottomNote: e.target.value })}
                            className="w-full bg-white border border-red-200 rounded-lg p-2 text-xs outline-none"
                            placeholder="Bottom Summary Callout Note"
                          />
                        </div>
                      )}

                      {/* Dynamic Product Feed Grid Editor */}
                      {selectedTemplateId === 'dynamic_product_feed' && templateData.products && (
                        <div className="space-y-4 p-4 bg-purple-50/40 border border-purple-200 rounded-xl">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/70 pb-3">
                            <div>
                              <h5 className="font-bold text-xs text-purple-950 flex items-center gap-2">
                                <span>Dynamic Product & Catalog Grid</span>
                                <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                                  {templateData.products.length} {templateData.products.length === 1 ? 'Item' : 'Catalog Items'}
                                </span>
                              </h5>
                              <p className="text-[11px] text-purple-800/80 mt-0.5">Attach custom pictures, badges, descriptions, and unlimited catalog offerings.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const nextIndex = (templateData.products?.length || 0) + 1;
                                const sampleImages = [
                                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
                                  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
                                  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
                                  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
                                  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&auto=format&fit=crop&q=80',
                                  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80'
                                ];
                                const randomImg = sampleImages[(nextIndex - 1) % sampleImages.length];
                                const newProduct = {
                                  name: `Catalog Item ${nextIndex}`,
                                  category: 'Service Package',
                                  price: '₹1,299 / mo',
                                  badge: 'New',
                                  imageUrl: randomImg,
                                  description: 'Targeted client acquisition with automated outreach.',
                                  ctaText: 'Select Plan',
                                  ctaUrl: 'https://leadpulse.io/order'
                                };
                                setTemplateData({
                                  ...templateData,
                                  products: [...templateData.products!, newProduct]
                                });
                              }}
                              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Catalog Item</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {templateData.products.map((p, idx) => (
                              <div key={idx} className="p-3 bg-white border border-purple-200 rounded-xl space-y-2.5 text-xs shadow-xs relative">
                                <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                                  <span className="font-extrabold text-[11px] text-purple-900">
                                    Catalog Item #{idx + 1}
                                  </span>
                                  {templateData.products!.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = templateData.products!.filter((_, i) => i !== idx);
                                        setTemplateData({ ...templateData, products: next });
                                      }}
                                      className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                                      title="Remove this catalog item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {/* Upload Picture (File Only, No URL input) */}
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                      <Upload className="w-3 h-3 text-purple-600" />
                                      <span>Upload Picture</span>
                                    </span>
                                    {p.imageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...templateData.products!];
                                          next[idx].imageUrl = '';
                                          setTemplateData({ ...templateData, products: next });
                                        }}
                                        className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                                      >
                                        Remove Picture
                                      </button>
                                    )}
                                  </label>
                                  
                                  {p.imageUrl ? (
                                    <div className="flex items-center gap-2.5 p-2 bg-purple-50/60 border border-purple-200 rounded-lg">
                                      <div className="w-12 h-12 rounded-lg border border-purple-200 overflow-hidden shrink-0 bg-white shadow-xs">
                                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-purple-950 truncate">Picture Uploaded</p>
                                        <label className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer">
                                          <Upload className="w-3 h-3" />
                                          <span>Change Picture</span>
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => handleProductImageUpload(idx, e)} 
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  ) : (
                                    <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center group">
                                      <div className="w-8 h-8 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-700 transition-colors">
                                        <Upload className="w-4 h-4" />
                                      </div>
                                      <span className="text-[11px] font-bold text-purple-950">Click to Upload Picture</span>
                                      <span className="text-[9px] text-gray-500 font-medium">PNG, JPG, WebP from device (Max 5MB)</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => handleProductImageUpload(idx, e)} 
                                      />
                                    </label>
                                  )}
                                </div>

                                {/* Product Name */}
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500">Product / Service Name</label>
                                  <input 
                                    type="text" 
                                    value={p.name}
                                    onChange={(e) => {
                                      const next = [...templateData.products!];
                                      next[idx].name = e.target.value;
                                      setTemplateData({ ...templateData, products: next });
                                    }}
                                    className="w-full font-bold border border-gray-200 rounded p-1 text-xs outline-none focus:border-purple-500"
                                    placeholder="e.g. Starter Package"
                                  />
                                </div>

                                {/* Category & Badge */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500">Category Tag</label>
                                    <input 
                                      type="text" 
                                      value={p.category || ''}
                                      onChange={(e) => {
                                        const next = [...templateData.products!];
                                        next[idx].category = e.target.value;
                                        setTemplateData({ ...templateData, products: next });
                                      }}
                                      placeholder="e.g. Lead Harvest"
                                      className="w-full border border-gray-200 rounded p-1 text-[11px] outline-none focus:border-purple-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500">Badge</label>
                                    <input 
                                      type="text" 
                                      value={p.badge || ''}
                                      onChange={(e) => {
                                        const next = [...templateData.products!];
                                        next[idx].badge = e.target.value;
                                        setTemplateData({ ...templateData, products: next });
                                      }}
                                      placeholder="e.g. Popular"
                                      className="w-full text-purple-700 font-bold border border-gray-200 rounded p-1 text-[11px] outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>

                                {/* Price & Button Text */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500">Price</label>
                                    <input 
                                      type="text" 
                                      value={p.price}
                                      onChange={(e) => {
                                        const next = [...templateData.products!];
                                        next[idx].price = e.target.value;
                                        setTemplateData({ ...templateData, products: next });
                                      }}
                                      className="w-full font-extrabold text-accent border border-gray-200 rounded p-1 text-[11px] outline-none focus:border-purple-500"
                                      placeholder="e.g. ₹699 / mo"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-500">Button Text</label>
                                    <input 
                                      type="text" 
                                      value={p.ctaText || 'Select Plan'}
                                      onChange={(e) => {
                                        const next = [...templateData.products!];
                                        next[idx].ctaText = e.target.value;
                                        setTemplateData({ ...templateData, products: next });
                                      }}
                                      className="w-full border border-gray-200 rounded p-1 text-[11px] font-semibold outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500">Brief Description</label>
                                  <input 
                                    type="text" 
                                    value={p.description || ''}
                                    onChange={(e) => {
                                      const next = [...templateData.products!];
                                      next[idx].description = e.target.value;
                                      setTemplateData({ ...templateData, products: next });
                                    }}
                                    placeholder="Short highlight for this offering..."
                                    className="w-full border border-gray-200 rounded p-1 text-[11px] outline-none focus:border-purple-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500">Action Link URL</label>
                                  <input 
                                    type="text" 
                                    value={p.ctaUrl || 'https://'}
                                    onChange={(e) => {
                                      const next = [...templateData.products!];
                                      next[idx].ctaUrl = e.target.value;
                                      setTemplateData({ ...templateData, products: next });
                                    }}
                                    className="w-full border border-gray-200 rounded p-1 text-[11px] font-mono outline-none focus:border-purple-500"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* ======================================================== */}
                  {/* LAYER 2: TEMPLATE LAYER (Spacing, Width, Colors, Footer) */}
                  {/* ======================================================== */}
                  {editorLayer === 'template' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <div>
                        <h4 className="text-xs font-extrabold text-[#09090B] mb-1">Layout & Responsive Geometry</h4>
                        <p className="text-[11px] text-gray-500">Configure global container parameters for all screen viewports.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Container Width</label>
                          <select 
                            value={templateStyling.containerWidth}
                            onChange={(e) => setTemplateStyling({ ...templateStyling, containerWidth: e.target.value })}
                            className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-2.5 text-xs font-bold outline-none"
                          >
                            <option value="540px">Compact (540px)</option>
                            <option value="600px">Standard Industry (600px)</option>
                            <option value="660px">Wide Editorial (660px)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Inner Spacing / Padding</label>
                          <select 
                            value={templateStyling.spacingPadding}
                            onChange={(e) => setTemplateStyling({ ...templateStyling, spacingPadding: e.target.value })}
                            className="w-full bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-2.5 text-xs font-bold outline-none"
                          >
                            <option value="16px">Compact Padding (16px)</option>
                            <option value="24px">Balanced Padding (24px)</option>
                            <option value="32px">Spacious Padding (32px)</option>
                          </select>
                        </div>
                      </div>

                      {/* Brand Accent Color */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Brand Accent Tone</label>
                        <div className="flex gap-2">
                          {[
                            { name: 'Indigo', val: '#4F46E5' },
                            { name: 'Emerald', val: '#059669' },
                            { name: 'Dark Charcoal', val: '#09090B' },
                            { name: 'Royal Blue', val: '#2563EB' },
                            { name: 'Ruby', val: '#DC2626' }
                          ].map((col) => (
                            <button
                              key={col.val}
                              type="button"
                              onClick={() => setTemplateStyling({ ...templateStyling, accentColor: col.val })}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                templateStyling.accentColor === col.val 
                                  ? 'border-gray-900 bg-gray-100 shadow-xs ring-1 ring-gray-900' 
                                  : 'border-[#E4E4E7] bg-white'
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col.val }} />
                              <span>{col.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CAN-SPAM Deliverability Footer Guard */}
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-0.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Mandatory Unsubscribe Compliance Footer</span>
                          </div>
                          <p className="text-[11px] text-emerald-700">
                            Enforces CAN-SPAM and GDPR legal opt-out links on every outbound email automatically.
                          </p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={templateStyling.showComplianceFooter}
                          onChange={(e) => setTemplateStyling({ ...templateStyling, showComplianceFooter: e.target.checked })}
                          className="w-5 h-5 accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#E4E4E7] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeChannel === 'whatsapp' ? 'bg-emerald-500' : 'bg-accent'} animate-pulse`}></span>
                <span className="text-xs text-gray-500 font-medium">
                  {activeChannel === 'whatsapp' ? 'Direct WhatsApp Web / wa.me API Ready' : 'Direct-to-Inbox Transport Ready'}
                </span>
              </div>
              
              {activeChannel === 'whatsapp' ? (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={handleCopyWhatsApp}
                    className="bg-white border border-[#E4E4E7] hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ExternalLink className="w-3.5 h-3.5 text-gray-500" />}
                    <span>{copiedWhatsApp ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                  </button>
                  <button 
                    onClick={() => handleOpenWhatsAppWeb(previewLead)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp Web</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={handleSendSingleTest}
                    disabled={isSendingSingle}
                    className="bg-white border border-[#E4E4E7] hover:bg-gray-100 disabled:opacity-50 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title={`Dispatches an individualized test email directly to ${previewLead.businessName}`}
                  >
                    {isSendingSingle ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-gray-500" />
                        <span>Send Single Test</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Launch Outreach Batch</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT: LIVE VIEWPORT PREVIEW (DESKTOP / MOBILE)          */}
          {/* ======================================================== */}
          <div className="w-full xl:flex-1 flex flex-col bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl overflow-hidden shadow-xs min-h-[750px] xl:sticky xl:top-6 self-start">
            
            {/* Viewport & Lead Controls */}
            <div className="px-6 py-3.5 border-b border-[#E4E4E7] bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs text-[#09090B] flex items-center gap-1.5">
                  <span>Live Render Preview</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </h3>

                {/* Viewport Switcher */}
                <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7] text-xs">
                  <button 
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                      previewViewport === 'desktop' ? 'bg-white text-[#09090B] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button 
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                      previewViewport === 'mobile' ? 'bg-white text-[#09090B] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Lead Hydration Switcher */}
              <div className="relative" ref={leadDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLeadDropdownOpen(!isLeadDropdownOpen)}
                  className="flex items-center gap-2 bg-[#F4F4F5] hover:bg-[#E4E4E7] px-3.5 py-1.5 rounded-xl border border-[#E4E4E7] text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs"
                  title="Click to select target lead for live hydration"
                >
                  <span className="text-gray-400 font-normal">Target Lead:</span>
                  <span className="font-extrabold text-[#09090B] max-w-[150px] truncate">{previewLead.businessName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isLeadDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isLeadDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E4E4E7] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-[#E4E4E7] bg-[#FAFAFA]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Select Target Lead</span>
                        <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          {availableLeads.length} Available
                        </span>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={leadSearchQuery}
                          onChange={(e) => setLeadSearchQuery(e.target.value)}
                          placeholder="Search business or location..."
                          className="w-full bg-white border border-[#E4E4E7] rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 divide-y divide-gray-50">
                      {filteredAvailableLeads.map((lead) => {
                        const isSelected = previewLead.businessName === lead.businessName;
                        return (
                          <button
                            key={lead._id || lead.businessName}
                            type="button"
                            onClick={() => {
                              setPreviewLead(lead);
                              setIsLeadDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between group cursor-pointer ${
                              isSelected ? 'bg-accent/10 text-accent font-bold' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-bold text-[#09090B] truncate group-hover:text-accent">
                                {lead.businessName}
                              </div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                <span>{lead.category || lead.fieldOfWork}</span>
                                <span>•</span>
                                <span>{lead.location}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-accent shrink-0" />
                            )}
                          </button>
                        );
                      })}

                      {filteredAvailableLeads.length === 0 && (
                        <div className="p-4 text-center text-xs text-gray-400">
                          No matching leads found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Viewport Canvas */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex items-start justify-center">
              
              {/* ======================================================== */}
              {/* EMAIL CLIENT CONTAINER                                   */}
              {/* ======================================================== */}
              {activeChannel === 'email' && (
                <div 
                  className={`bg-white rounded-2xl shadow-lg border border-[#E4E4E7] overflow-hidden transition-all duration-200 ${
                    previewViewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-[620px]'
                  }`}
                  style={{ borderRadius: templateStyling.borderRadius }}
                >
                  
                  {/* Email Chrome Header */}
                  <div className="border-b border-[#E4E4E7] p-4 bg-[#FAFAFA] text-xs">
                    <div className="text-[11px] text-gray-400 font-medium mb-1">
                      From: Alex Roberts &lt;alex@leadpulse.io&gt;
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium mb-2">
                      To: hello@{previewLead.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'biz'}.com
                    </div>
                    <div 
                      className="font-extrabold text-sm text-[#09090B]"
                      dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.subject) }}
                    />
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 1: TEXT ONLY                      */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'text_only' && (
                    <div className="p-6 sm:p-8 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-xs">
                          LP
                        </div>
                        {templateData.preheader && (
                          <span 
                            className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded"
                            dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader) }}
                          />
                        )}
                      </div>
                      <h2 
                        className="text-base font-extrabold text-[#09090B] leading-snug"
                        dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                      />
                      <div 
                        className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                      />
                      {templateData.ctaText && (
                        <div className="pt-2">
                          <a 
                            href={templateData.ctaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ backgroundColor: templateStyling.accentColor }}
                          >
                            {templateData.ctaText}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 2: ONE COLUMN                     */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'one_column' && (
                    <div className="p-6 sm:p-8 space-y-5 text-center">
                      <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-black text-sm mx-auto shadow-xs">
                        LP
                      </div>
                      <div className="space-y-1.5">
                        <h2 
                          className="text-lg font-black text-[#09090B] leading-tight"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                        {templateData.subheadline && (
                          <p 
                            className="text-xs text-gray-500 font-medium"
                            dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.subheadline) }}
                          />
                        )}
                      </div>

                      {/* Hero Image Banner */}
                      <div className="w-full h-44 bg-gradient-to-tr from-indigo-600 via-accent to-purple-600 rounded-xl flex items-center justify-center text-white p-6 shadow-xs relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 text-center space-y-1">
                          <span 
                            className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs inline-block"
                            dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader || `${previewLead.location} Growth Focus`) }}
                          />
                          <h3 className="font-extrabold text-base">{previewLead.fieldOfWork} Suite</h3>
                        </div>
                      </div>

                      <div 
                        className="text-xs text-gray-700 leading-relaxed text-left whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                      />

                      {templateData.ctaText && (
                        <div className="pt-2">
                          <a 
                            href={templateData.ctaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-3 rounded-xl text-xs font-extrabold text-white shadow-md hover:opacity-95 transition-all cursor-pointer"
                            style={{ backgroundColor: templateStyling.accentColor }}
                          >
                            {templateData.ctaText}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 3: TWO COLUMN                     */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'two_column' && (
                    <div className="p-6 sm:p-8 space-y-5">
                      <div className="text-center space-y-2">
                        <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-black text-xs mx-auto">
                          LP
                        </div>
                        {templateData.preheader && (
                          <span 
                            className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2.5 py-0.5 rounded-full inline-block"
                            dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader) }}
                          />
                        )}
                        <h2 
                          className="text-base font-extrabold text-[#09090B]"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                        <p 
                          className="text-xs text-gray-600 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                        />
                      </div>

                      {/* Side-by-Side Dual Blocks */}
                      <div className={`grid gap-4 ${previewViewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl flex flex-col justify-between space-y-3">
                          <div className="w-full h-24 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xs">
                            Option A
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#09090B] mb-1">{templateData.col1Title}</h4>
                            <p className="text-[11px] text-gray-500 leading-snug">{templateData.col1Body}</p>
                          </div>
                          <a 
                            href={templateData.col1CtaUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold text-center block transition-colors shadow-xs cursor-pointer"
                          >
                            {templateData.col1Cta || 'Learn More'}
                          </a>
                        </div>

                        <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl flex flex-col justify-between space-y-3">
                          <div className="w-full h-24 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-bold text-xs">
                            Option B
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#09090B] mb-1">{templateData.col2Title}</h4>
                            <p className="text-[11px] text-gray-500 leading-snug">{templateData.col2Body}</p>
                          </div>
                          <a 
                            href={templateData.col2CtaUrl || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold text-center block transition-colors shadow-xs cursor-pointer"
                          >
                            {templateData.col2Cta || 'Learn More'}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 4: HYBRID                         */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'hybrid' && (
                    <div className="p-6 sm:p-8 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                          LP
                        </div>
                        <span 
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader || 'Monthly Partner Brief') }}
                        />
                      </div>

                      {/* Wide Hero Banner */}
                      <div className="p-6 bg-gradient-to-r from-gray-900 to-[#18181B] text-white rounded-xl space-y-3">
                        <h2 
                          className="text-base font-extrabold leading-snug"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                        <p 
                          className="text-xs text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.subheadline) }}
                        />
                        {templateData.ctaText && (
                          <a 
                            href={templateData.ctaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ backgroundColor: templateStyling.accentColor }}
                          >
                            {templateData.ctaText}
                          </a>
                        )}
                      </div>

                      {/* Secondary Multi-Column Block */}
                      <div className={`grid gap-3 pt-2 ${previewViewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <div className="p-3 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl flex flex-col justify-between space-y-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 font-bold text-xs">
                              01
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#09090B]">{templateData.col1Title}</h4>
                              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{templateData.col1Body}</p>
                            </div>
                          </div>
                          {templateData.col1Cta && (
                            <a 
                              href={templateData.col1CtaUrl || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-accent hover:underline inline-block pt-1"
                            >
                              {templateData.col1Cta} →
                            </a>
                          )}
                        </div>

                        <div className="p-3 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl flex flex-col justify-between space-y-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 font-bold text-xs">
                              02
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#09090B]">{templateData.col2Title}</h4>
                              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{templateData.col2Body}</p>
                            </div>
                          </div>
                          {templateData.col2Cta && (
                            <a 
                              href={templateData.col2CtaUrl || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-accent hover:underline inline-block pt-1"
                            >
                              {templateData.col2Cta} →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 5: INVERTED PYRAMID               */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'inverted_pyramid' && (
                    <div className="p-6 sm:p-8 space-y-6 text-center">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs mx-auto">
                        LP
                      </div>

                      {/* Wide Top Visual (Pyramid Base) */}
                      <div className="w-full h-36 bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-1 shadow-inner">
                        <span 
                          className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-3 py-0.5 rounded-full"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader || 'Exclusive 500-Lead Reserve') }}
                        />
                        <h3 className="font-black text-base text-amber-950">
                          High-Impact Compute Funnel
                        </h3>
                      </div>

                      {/* Tapering Copy (Pyramid Middle) */}
                      <div className="max-w-md mx-auto space-y-2">
                        <h2 
                          className="text-base font-extrabold text-[#09090B] leading-snug"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                        <p 
                          className="text-xs text-gray-600 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                        />
                      </div>

                      {/* Focused Call-to-Action Vertex (Pyramid Point) */}
                      <div className="pt-2 flex flex-col items-center">
                        <div className="text-gray-300 mb-1 text-xs font-bold">▼</div>
                        <a 
                          href={templateData.ctaUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-8 py-3 rounded-xl text-xs font-black text-white shadow-lg shadow-amber-600/20 hover:scale-[1.02] transition-transform inline-flex items-center gap-2 cursor-pointer"
                          style={{ backgroundColor: '#D97706' }}
                        >
                          <span>{templateData.ctaText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 6: ZIG ZAG                        */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'zig_zag' && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="text-center space-y-1">
                        {templateData.preheader && (
                          <span 
                            className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1"
                            dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader) }}
                          />
                        )}
                        <h2 
                          className="text-base font-extrabold text-[#09090B]"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                        <p 
                          className="text-xs text-gray-500"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                        />
                      </div>

                      {/* Zig-Zag Row 1: Left Image, Right Text */}
                      <div className={`p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl flex items-center gap-4 ${previewViewport === 'mobile' ? 'flex-col' : ''}`}>
                        <div className="w-24 h-24 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                          Step 01
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-[#09090B]">{templateData.zig1Title}</h4>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{templateData.zig1Text}</p>
                          <a 
                            href={templateData.zig1CtaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold text-[11px] hover:underline pt-1 inline-block cursor-pointer"
                          >
                            {templateData.zig1Cta || 'Learn More →'}
                          </a>
                        </div>
                      </div>

                      {/* Zig-Zag Row 2: Left Text, Right Image */}
                      <div className={`p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl flex items-center gap-4 ${previewViewport === 'mobile' ? 'flex-col-reverse' : ''}`}>
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-xs text-[#09090B]">{templateData.zig2Title}</h4>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{templateData.zig2Text}</p>
                          <a 
                            href={templateData.zig2CtaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold text-[11px] hover:underline pt-1 inline-block cursor-pointer"
                          >
                            {templateData.zig2Cta || 'Learn More →'}
                          </a>
                        </div>
                        <div className="w-24 h-24 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                          Step 02
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 7: F PATTERN                      */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'f_pattern' && (
                    <div className="p-6 sm:p-8 space-y-5">
                      {/* Top Bar of F */}
                      <div className="border-b-2 border-gray-900 pb-3">
                        <span 
                          className="text-[10px] font-black uppercase tracking-wider text-gray-400"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader || 'Executive Briefing') }}
                        />
                        <h2 
                          className="text-base font-black text-[#09090B] leading-tight mt-1"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                      </div>

                      {/* Left-Side Scan Spine of F */}
                      <div className="space-y-3 pl-3 border-l-2 border-accent">
                        <p 
                          className="text-xs text-gray-700 font-medium"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                        />

                        <ul className="space-y-2 text-xs text-gray-800">
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-accent shrink-0">•</span>
                            <span>{templateData.fBullet1}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-accent shrink-0">•</span>
                            <span>{templateData.fBullet2}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold text-accent shrink-0">•</span>
                            <span>{templateData.fBullet3}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Bottom Anchor Visual */}
                      <div className="w-full h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-xs font-semibold border border-gray-200">
                        {templateData.fBottomNote || 'Executive Summary Data Stream'}
                      </div>

                      {templateData.ctaText && (
                        <div>
                          <a 
                            href={templateData.ctaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ backgroundColor: templateStyling.accentColor }}
                          >
                            {templateData.ctaText}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TEMPLATE STRUCTURE 8: DYNAMIC PRODUCT FEED           */}
                  {/* ---------------------------------------------------- */}
                  {selectedTemplateId === 'dynamic_product_feed' && (
                    <div className="p-6 sm:p-8 space-y-5 text-center">
                      <div>
                        <span 
                          className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full inline-block"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.preheader || 'Dynamic Service Feed') }}
                        />
                        <h2 
                          className="text-base font-black text-[#09090B] mt-2 mb-1"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.headline) }}
                        />
                        <p 
                          className="text-xs text-gray-500"
                          dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                        />
                      </div>

                      {/* Dynamic Product Feed Grid */}
                      <div className={`grid gap-3.5 my-4 ${
                        previewViewport === 'mobile' 
                          ? 'grid-cols-1' 
                          : (templateData.products || []).length <= 2 
                            ? 'grid-cols-2' 
                            : (templateData.products || []).length === 4
                              ? 'grid-cols-2'
                              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {(templateData.products || []).map((prod, idx) => (
                          <div key={idx} className="p-3.5 bg-white border border-[#E4E4E7] rounded-xl flex flex-col justify-between shadow-xs text-left hover:shadow-md transition-shadow">
                            <div>
                              {prod.imageUrl ? (
                                <div className="w-full h-28 bg-gray-100 rounded-lg overflow-hidden mb-2.5 relative border border-gray-100">
                                  <img 
                                    src={prod.imageUrl} 
                                    alt={prod.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-16 bg-purple-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-purple-800 mb-2">
                                  {prod.category || 'Catalog Item'}
                                </div>
                              )}

                              <div className="space-y-1 mb-2">
                                {prod.badge && (
                                  <span className="text-[9px] font-bold uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-sm inline-block">
                                    {prod.badge}
                                  </span>
                                )}
                                <h4 className="font-extrabold text-xs text-[#09090B] leading-snug pt-0.5">{prod.name}</h4>
                                {prod.category && (
                                  <p className="text-[10px] font-bold uppercase text-gray-400">{prod.category}</p>
                                )}
                                {prod.description && (
                                  <p className="text-[11px] text-gray-500 leading-tight pt-0.5">{prod.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 mt-2">
                              <p className="font-black text-xs text-accent mb-2">{prod.price}</p>
                              <a 
                                href={prod.ctaUrl || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-1.5 bg-[#09090B] hover:bg-black text-white rounded-lg text-[10px] font-bold text-center block transition-colors cursor-pointer shadow-xs"
                              >
                                {prod.ctaText || 'Select Plan'}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      {templateData.ctaText && (
                        <div>
                          <a 
                            href={templateData.ctaUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-7 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                            style={{ backgroundColor: templateStyling.accentColor }}
                          >
                            {templateData.ctaText}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* COMPLIANCE & DELIVERABILITY FOOTER (MANDATORY)       */}
                  {/* ==================================================== */}
                  {templateStyling.showComplianceFooter && (
                    <div className="bg-[#FAFAFA] p-5 border-t border-[#E4E4E7] text-center text-xs text-gray-500 space-y-1">
                      <div className="font-bold text-gray-700 text-[11px]">
                        LeadPulse Platform • BKC Financial Hub, Mumbai, India
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        You received this communication because <strong>{previewLead.businessName}</strong> is listed in public directories for {previewLead.fieldOfWork} in {previewLead.location}.
                      </p>
                      <div className="text-[10px] text-gray-400 pt-1">
                        <a href="#unsubscribe" className="text-accent underline font-semibold">Unsubscribe instantly</a> • <a href="#privacy" className="text-gray-500 underline">Compliance & Privacy Policy</a>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* WHATSAPP PHONE MOCKUP PREVIEW */}
              {activeChannel === 'whatsapp' && (
                <div className="w-[340px] bg-white rounded-[36px] shadow-xl border-[6px] border-[#E4E4E7] overflow-hidden flex flex-col">
                  <div className="bg-[#075E54] text-white p-3.5 flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      LP
                    </div>
                    <div>
                      <div className="font-bold text-xs">{previewLead.businessName}</div>
                      <div className="text-[10px] text-emerald-200">Official Business Account</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#E5DDD5] p-3 overflow-y-auto flex flex-col">
                    <div 
                      className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none self-end max-w-[88%] text-xs text-gray-800 shadow-xs whitespace-pre-wrap mb-1"
                      dangerouslySetInnerHTML={{ __html: renderPreviewHtml(whatsAppMessage) }}
                    />
                    <div className="text-[9px] text-gray-500 self-end mr-1 flex items-center gap-1">
                      10:42 AM <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* SMS PHONE MOCKUP PREVIEW */}
              {activeChannel === 'sms' && (
                <div className="w-[320px] bg-white rounded-[36px] shadow-xl border-[6px] border-[#E4E4E7] overflow-hidden flex flex-col">
                  <div className="bg-gray-100 p-3 flex flex-col items-center justify-center border-b border-gray-200 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold mb-1">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-gray-800">{previewLead.phone}</div>
                  </div>
                  <div className="flex-1 bg-white p-3.5 overflow-y-auto flex flex-col">
                    <div 
                      className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none self-end max-w-[88%] text-xs shadow-xs whitespace-pre-wrap mb-1"
                      dangerouslySetInnerHTML={{ __html: renderPreviewHtml(templateData.body) }}
                    />
                    <div className="text-[9px] text-gray-400 self-end mr-2">Delivered</div>
                  </div>
                </div>
              )}

            </div>
          </div>

          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TEMPLATE GALLERY MODAL (8 INDUSTRY LAYOUTS)                  */}
      {/* ============================================================ */}
      <TemplateGalleryModal 
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* ============================================================ */}
      {/* DIRECT-TO-INBOX EMAIL DISPATCH CONSOLE MODAL                 */}
      {/* ============================================================ */}
      <DispatchTrackerModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        templateId={selectedTemplateId}
        templateName={activeTemplateConfig.name}
        templateData={templateData}
        templateStyling={templateStyling}
        availableLeads={availableLeads}
        currentPreviewLead={previewLead}
        user={user}
        onCampaignDispatched={() => {
          setDispatchNotification({
            message: `Outreach campaign successfully dispatched to active lead recipients! Status updated to 'Contacted'.`
          });
        }}
      />

      {/* ============================================================ */}
      {/* EMAIL PROVIDER CONFIGURATION MODAL (GMAIL / RESEND / SMTP)  */}
      {/* ============================================================ */}
      <EmailProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        user={user}
        onSaved={() => {
          setDispatchNotification({
            message: 'Email dispatch gateway credentials successfully updated and active!'
          });
        }}
      />
    </div>
  );
};

export default OutreachCenter;
