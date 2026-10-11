import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { 
  Search, List, Kanban, 
  Plus, Phone, Globe, MapPin,
  MessageCircle, Send,
  Check, Edit3, ShieldCheck, GripVertical,
  X, ExternalLink, Trash2, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { EMAIL_CAPTURE_BRIDGE_SCRIPT } from '../data/whatsappTemplates';

const KANBAN_STAGES = [
  'New',
  'WhatsApp Contacted',
  'Replied / Awaiting Email',
  'Email Verified & Captured',
  'Proposal Sent',
  'Closed Won'
];

const CrmPipeline = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Drag and Drop State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Click-to-View Lead Details Modal State
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<any | null>(null);

  // Inline Email Capture Upgrade State
  const [capturingLeadId, setCapturingLeadId] = useState<string | null>(null);
  const [capturedEmailInput, setCapturedEmailInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/leads', {
        headers: { userid: user?._id }
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
      setLeads([]);
    }
  };

  useEffect(() => {
    if (user) fetchLeads();
  }, [user]);

  const toggleLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(l => l !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const toggleAll = () => {
    if (selectedLeads.length === leads.length && leads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l._id));
    }
  };

  // Update lead status in Firestore
  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: newStatus } : l));
      await axios.patch(`http://localhost:3001/api/leads/${leadId}`, { status: newStatus }, {
        headers: { userid: user?._id }
      });
    } catch (err) {
      console.error('Failed to update lead status:', err);
      fetchLeads();
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverStage === stage) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDragOverStage(null);
    setDraggedLeadId(null);

    if (leadId) {
      const targetLead = leads.find(l => l._id === leadId);
      if (targetLead && (targetLead.status || 'New') !== targetStage) {
        await handleUpdateStatus(leadId, targetStage);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  // 1-Click Upgrade Record from "Phone-Only" to "Verified Email Lead"
  const handleSaveCapturedEmail = async (leadId: string) => {
    if (!capturedEmailInput || !capturedEmailInput.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsUpdating(true);
    try {
      setLeads(prev => prev.map(l => l._id === leadId ? { 
        ...l, 
        email: capturedEmailInput, 
        emailStatus: 'Verified Email',
        status: 'Email Verified & Captured'
      } : l));

      await axios.patch(`http://localhost:3001/api/leads/${leadId}`, {
        email: capturedEmailInput,
        emailStatus: 'Verified Email',
        status: 'Email Verified & Captured'
      }, {
        headers: { userid: user?._id }
      });

      setCapturingLeadId(null);
      setCapturedEmailInput('');
    } catch (err) {
      console.error('Failed to upgrade email:', err);
      alert('Failed to save email');
      fetchLeads();
    } finally {
      setIsUpdating(false);
    }
  };

  // 1-Click Launch WhatsApp with Convenience-Framing Script
  const handleLaunchWhatsApp = (lead: any) => {
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const message = `Hey ${lead.firstName || lead.businessName}! Came across ${lead.businessName} in ${lead.location}. ${EMAIL_CAPTURE_BRIDGE_SCRIPT}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Auto-advance stage to WhatsApp Contacted
    handleUpdateStatus(lead._id, 'WhatsApp Contacted');
    window.open(url, '_blank');
  };

  const filteredLeads = leads.filter(l => {
    const bName = l.businessName || '';
    const cat = l.category || '';
    const loc = l.location || '';
    return bName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
           loc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'WhatsApp Contacted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Replied / Awaiting Email': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Email Verified & Captured': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Proposal Sent': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Closed Won': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#FAFAFA] font-sans text-[#09090B]">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title="Unified B2B Pipeline & Smart WhatsApp Bridge" />

        <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-hidden space-y-6">
          
          {/* Top Stage Progression Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 shrink-0">
            {KANBAN_STAGES.map((stage) => {
              const count = leads.filter(l => (l.status || 'New') === stage).length;
              return (
                <div key={stage} className="bg-white border border-[#E4E4E7] rounded-xl p-3 shadow-xs">
                  <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider truncate">{stage}</div>
                  <div className="text-base font-black text-[#09090B] mt-0.5">{count}</div>
                </div>
              );
            })}
          </div>

          {/* Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-72 sm:w-84">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search business, location, category..."
                  className="w-full bg-white border border-[#E4E4E7] rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:ring-2 focus:ring-accent outline-none shadow-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <span className="text-xs text-gray-500 font-bold hidden sm:inline-block">
                Showing {filteredLeads.length} Leads
              </span>
            </div>

            {/* View Switcher & Action Controls */}
            <div className="flex items-center gap-3">
              {selectedLeads.length > 0 && (
                <button 
                  onClick={async () => {
                    for (const id of selectedLeads) {
                      await axios.delete(`http://localhost:3001/api/leads/${id}`, { headers: { userid: user?._id } }).catch(() => {});
                    }
                    setSelectedLeads([]);
                    fetchLeads();
                  }}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border border-red-200 cursor-pointer"
                >
                  Delete ({selectedLeads.length})
                </button>
              )}

              <button
                onClick={() => navigate('/finder')}
                className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Find New Leads</span>
              </button>

              <div className="flex items-center bg-white border border-[#E4E4E7] rounded-xl p-1 shadow-xs">
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-[#09090B] text-white shadow-xs' : 'text-gray-500 hover:text-[#09090B]'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" /> 
                  <span>Kanban</span>
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-[#09090B] text-white shadow-xs' : 'text-gray-500 hover:text-[#09090B]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> 
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* KANBAN VIEW (Compact, No Left-to-Right Horizontal Scroll) */}
          {viewMode === 'kanban' && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 min-h-0 h-full overflow-hidden">
              {KANBAN_STAGES.map(stage => {
                const stageLeads = filteredLeads.filter(l => (l.status || 'New') === stage);
                const isOver = dragOverStage === stage;
                
                return (
                  <div 
                    key={stage} 
                    onDragOver={(e) => handleDragOver(e, stage)}
                    onDragLeave={(e) => handleDragLeave(e, stage)}
                    onDrop={(e) => handleDrop(e, stage)}
                    className={`flex flex-col h-full rounded-2xl border transition-all duration-150 overflow-hidden min-w-0 ${
                      isOver 
                        ? 'bg-accent/10 border-accent border-2 ring-2 ring-accent/20 shadow-md' 
                        : 'bg-[#F4F4F5] border-[#E4E4E7]'
                    }`}
                  >
                    
                    {/* Column Header */}
                    <div className={`px-3 py-2.5 border-b flex items-center justify-between shrink-0 transition-colors ${
                      isOver ? 'bg-accent/15 border-accent/30' : 'bg-white border-[#E4E4E7]'
                    }`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isOver ? 'bg-accent scale-125 animate-ping' : 'bg-accent'}`}></span>
                        <h3 className="font-extrabold text-xs text-[#09090B] truncate" title={stage}>{stage}</h3>
                      </div>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0 ${
                        isOver 
                          ? 'bg-accent text-white border-accent' 
                          : 'bg-[#F4F4F5] text-gray-700 border-[#E4E4E7]'
                      }`}>
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Column Cards Container (Vertical Scroll only) */}
                    <div className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-2">
                      {stageLeads.length === 0 ? (
                        <div className={`p-4 text-center text-[11px] rounded-xl border-2 border-dashed transition-all ${
                          isOver 
                            ? 'border-accent text-accent font-extrabold bg-accent/5' 
                            : 'border-gray-200 text-gray-400'
                        }`}>
                          {isOver ? 'Drop lead here' : 'No leads'}
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const isPhoneOnly = !lead.email || lead.email.includes('no_email') || lead.emailStatus === 'Phone Only / No Email Found';
                          const isBeingDragged = draggedLeadId === lead._id;
                          
                          return (
                            <div 
                              key={lead._id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, lead._id)}
                              onDragEnd={handleDragEnd}
                              onClick={() => setSelectedLeadDetails(lead)}
                              className={`bg-white border rounded-xl p-2.5 shadow-2xs hover:shadow-md transition-all space-y-2 group cursor-pointer select-none hover:border-accent ${
                                isBeingDragged 
                                  ? 'opacity-40 border-dashed border-accent scale-95' 
                                  : 'border-[#E4E4E7]'
                              }`}
                            >
                              {/* Top Row: Drag Handle + Name */}
                              <div className="flex items-start gap-1.5 min-w-0">
                                <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5 cursor-grab active:cursor-grabbing" />
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-extrabold text-xs text-[#09090B] group-hover:text-accent transition-colors truncate" title={lead.businessName}>
                                    {lead.businessName}
                                  </h4>
                                  <div className="text-[10px] text-gray-400 font-medium truncate flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-2.5 h-2.5 shrink-0 text-gray-400" />
                                    <span className="truncate">{lead.location}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Middle Row: Category + Rating */}
                              <div className="flex items-center justify-between gap-1 text-[10px]">
                                <span className="font-bold px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 truncate max-w-[100px]">
                                  {lead.category || 'Local'}
                                </span>
                                <span className="text-amber-500 font-bold shrink-0 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>{lead.rating || '4.8'}</span>
                                </span>
                              </div>

                              {/* Bottom Row: Contact Status Badge + Click hint */}
                              <div className="pt-1.5 border-t border-[#E4E4E7] flex items-center justify-between text-[10px]">
                                {isPhoneOnly ? (
                                  <span className="font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1 truncate max-w-[110px]">
                                    <Phone className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">WhatsApp</span>
                                  </span>
                                ) : (
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1 truncate max-w-[110px]">
                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">Verified</span>
                                  </span>
                                )}

                                <span className="text-[9px] font-bold text-gray-400 group-hover:text-accent flex items-center gap-0.5 shrink-0">
                                  View →
                                </span>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="flex-1 bg-white border border-[#E4E4E7] rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#F4F4F5] border-b border-[#E4E4E7] z-10">
                    <tr className="text-gray-500 font-bold uppercase text-[11px]">
                      <th className="py-3.5 px-4 w-10 cursor-pointer" onClick={toggleAll}>
                        <input 
                          type="checkbox" 
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} 
                          readOnly 
                          className="w-4 h-4 rounded text-accent" 
                        />
                      </th>
                      <th className="py-3.5 px-3">Business Profile</th>
                      <th className="py-3.5 px-3">Contact & Email Status</th>
                      <th className="py-3.5 px-3">Location</th>
                      <th className="py-3.5 px-3">Pipeline Stage</th>
                      <th className="py-3.5 px-4 text-right">Instant Outreach</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, i) => {
                      const isPhoneOnly = !lead.email || lead.email.includes('no_email') || lead.emailStatus === 'Phone Only / No Email Found';
                      return (
                        <tr key={lead._id || i} className={`border-b border-[#E4E4E7] last:border-0 hover:bg-[#FAFAFA] transition-colors ${selectedLeads.includes(lead._id) ? 'bg-accent/5' : ''}`}>
                          <td className="py-3 px-4 cursor-pointer" onClick={() => toggleLead(lead._id)}>
                            <input 
                              type="checkbox" 
                              checked={selectedLeads.includes(lead._id)} 
                              readOnly 
                              className="w-4 h-4 rounded text-accent" 
                            />
                          </td>
                          <td className="py-3 px-3 cursor-pointer" onClick={() => setSelectedLeadDetails(lead)}>
                            <div className="font-extrabold text-[#09090B] text-xs hover:text-accent transition-colors">{lead.businessName}</div>
                            <div className="text-gray-400 text-[10px] flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3" /> 
                              <span className="truncate max-w-[180px]">{lead.website}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-gray-800 text-xs flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="mt-0.5">
                              {isPhoneOnly ? (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Phone Only Lead
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {lead.email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-600 text-xs">
                            {lead.location}
                          </td>
                          <td className="py-3 px-3">
                            <select 
                              value={lead.status || 'New'}
                              onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border outline-none cursor-pointer ${getStatusColor(lead.status)}`}
                            >
                              {KANBAN_STAGES.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleLaunchWhatsApp(lead)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Send WhatsApp Hook"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => navigate('/outreach')}
                                className="bg-accent hover:bg-accent-dark text-white p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Send Email Template"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* CLICK-TO-VIEW COMPREHENSIVE LEAD DETAILS MODAL           */}
      {/* ======================================================== */}
      {selectedLeadDetails && (
        <div 
          onClick={() => setSelectedLeadDetails(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col cursor-default animate-in zoom-in-95 duration-150 max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E4E4E7] bg-gradient-to-r from-gray-900 via-[#18181B] to-gray-900 text-white flex items-start justify-between relative">
              <div className="space-y-1.5 max-w-[85%]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-wider">
                    {selectedLeadDetails.category || 'Local Business'}
                  </span>
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{selectedLeadDetails.rating || '4.8'} Rating</span>
                  </span>
                </div>
                <h2 className="text-xl font-black text-white leading-tight">
                  {selectedLeadDetails.businessName}
                </h2>
                <div className="text-xs text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>{selectedLeadDetails.location}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedLeadDetails(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* 1. Stage Switcher Strip */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Current Pipeline Stage:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {KANBAN_STAGES.map((st) => {
                    const isActive = (selectedLeadDetails.status || 'New') === st;
                    return (
                      <button
                        key={st}
                        onClick={async () => {
                          await handleUpdateStatus(selectedLeadDetails._id, st);
                          setSelectedLeadDetails({ ...selectedLeadDetails, status: st });
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer border ${
                          isActive 
                            ? 'bg-accent text-white border-accent shadow-xs' 
                            : 'bg-[#F4F4F5] text-gray-700 hover:bg-[#E4E4E7] border-transparent'
                        }`}
                      >
                        <span className="truncate">{st}</span>
                        {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Contact Intelligence Matrix */}
              <div className="space-y-3 p-4 bg-[#FAFAFA] rounded-2xl border border-[#E4E4E7]">
                <h4 className="text-xs font-extrabold text-[#09090B] uppercase tracking-wider">
                  Contact Intelligence & Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Phone Block */}
                  <div className="bg-white p-3 rounded-xl border border-[#E4E4E7] shadow-xs space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Contact Phone</span>
                    <div className="font-extrabold text-[#09090B] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedLeadDetails.phone}</span>
                    </div>
                  </div>

                  {/* Rating / Scope Block */}
                  <div className="bg-white p-3 rounded-xl border border-[#E4E4E7] shadow-xs space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Harvest Scope</span>
                    <div className="font-extrabold text-purple-800">
                      {selectedLeadDetails.scope === 'deep' ? 'Deep Multi-Tier Crawl' : 'Quick Scan'}
                    </div>
                  </div>
                </div>

                {/* Email Verification / Upgrade Box */}
                <div className="bg-white p-3.5 rounded-xl border border-[#E4E4E7] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Verified Email Address</span>
                    {selectedLeadDetails.emailStatus === 'Verified Email' ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        Phone Only
                      </span>
                    )}
                  </div>

                  {capturingLeadId === selectedLeadDetails._id ? (
                    <div className="space-y-2 pt-1">
                      <input 
                        type="email"
                        value={capturedEmailInput}
                        onChange={(e) => setCapturedEmailInput(e.target.value)}
                        placeholder="e.g. contact@business.com"
                        className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs font-bold outline-none focus:border-accent"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setCapturingLeadId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            await handleSaveCapturedEmail(selectedLeadDetails._id);
                            setSelectedLeadDetails({
                              ...selectedLeadDetails,
                              email: capturedEmailInput,
                              emailStatus: 'Verified Email',
                              status: 'Email Verified & Captured'
                            });
                          }}
                          disabled={isUpdating}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent-dark shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save & Upgrade</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-xs text-charcoal">
                        {selectedLeadDetails.email || 'No email on file'}
                      </span>
                      <button
                        onClick={() => {
                          setCapturingLeadId(selectedLeadDetails._id);
                          setCapturedEmailInput(selectedLeadDetails.email || '');
                        }}
                        className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{selectedLeadDetails.email ? 'Edit Email' : '+ Add Email'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Website Link */}
                {selectedLeadDetails.website && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-500 font-medium">Business Web Presence:</span>
                    <a 
                      href={selectedLeadDetails.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-accent font-bold hover:underline flex items-center gap-1 truncate max-w-[260px]"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedLeadDetails.website}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* 3. Primary Outreach Action Bar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Outreach Dispatch Actions:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleLaunchWhatsApp(selectedLeadDetails);
                      setSelectedLeadDetails({ ...selectedLeadDetails, status: 'WhatsApp Contacted' });
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Launch WhatsApp Hook</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeadDetails(null);
                      navigate('/outreach');
                    }}
                    className="py-3 px-4 rounded-xl bg-accent hover:bg-accent-dark text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open Email Studio</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAFAFA] border-t border-[#E4E4E7] flex justify-between items-center">
              <button
                onClick={async () => {
                  if (confirm(`Delete lead "${selectedLeadDetails.businessName}"?`)) {
                    await axios.delete(`http://localhost:3001/api/leads/${selectedLeadDetails._id}`, {
                      headers: { userid: user?._id }
                    }).catch(() => {});
                    setSelectedLeadDetails(null);
                    fetchLeads();
                  }
                }}
                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="bg-[#09090B] hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CrmPipeline;

