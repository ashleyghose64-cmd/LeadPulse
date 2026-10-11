import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { 
  MapPin, Star, Download, Play, CheckSquare, Square,
  Mail, Phone, Sparkles, Navigation, Lock,
  Bookmark, BookmarkCheck, Trash2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LeadFinderWizard from '../components/LeadFinderWizard';

const Dashboard = () => {
  const { user, setUpgradeModalOpen, setUpgradeTab } = useStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/leads', {
        headers: { userid: user?._id }
      });
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (user) {
      fetchLeads();
      interval = setInterval(fetchLeads, 3000);
    }
    return () => clearInterval(interval);
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

  // Delete Single Lead
  const handleDeleteSingleLead = async (leadId: string) => {
    if (!user?._id) return;
    try {
      setLeads(prev => prev.filter(l => l._id !== leadId));
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
      await axios.delete(`http://localhost:3001/api/leads/${leadId}`, {
        headers: { userid: user._id }
      });
    } catch (err) {
      console.error('Failed to delete lead:', err);
      fetchLeads();
    }
  };

  // Batch Delete Selected Leads
  const handleBatchDelete = async () => {
    if (!user?._id || selectedLeads.length === 0) return;
    if (!confirm(`Delete ${selectedLeads.length} selected leads?`)) return;
    
    try {
      const toDelete = [...selectedLeads];
      setLeads(prev => prev.filter(l => !toDelete.includes(l._id)));
      setSelectedLeads([]);
      
      await axios.post('http://localhost:3001/api/leads/batch-delete', { ids: toDelete }, {
        headers: { userid: user._id }
      });
    } catch (err) {
      console.error('Failed to batch delete leads:', err);
      fetchLeads();
    }
  };

  // Delete All Leads
  const handleDeleteAll = async () => {
    if (!user?._id || leads.length === 0) return;
    if (!confirm(`Are you sure you want to delete ALL ${leads.length} leads in the stream? This action cannot be undone.`)) return;

    try {
      setLeads([]);
      setSelectedLeads([]);
      await axios.delete('http://localhost:3001/api/leads/all', {
        headers: { userid: user._id }
      });
    } catch (err) {
      console.error('Failed to delete all leads:', err);
      fetchLeads();
    }
  };

  // Toggle Save / Bookmark Lead
  const handleToggleSaveLead = async (lead: any) => {
    if (!user?._id) return;
    const newSaved = !lead.saved;
    try {
      setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, saved: newSaved } : l));
      await axios.patch(`http://localhost:3001/api/leads/${lead._id}`, { saved: newSaved }, {
        headers: { userid: user._id }
      });
    } catch (err) {
      console.error('Failed to toggle save lead:', err);
      fetchLeads();
    }
  };

  // Batch Save Selected Leads
  const handleBatchSave = async () => {
    if (!user?._id || selectedLeads.length === 0) return;
    try {
      const idsToSave = [...selectedLeads];
      setLeads(prev => prev.map(l => idsToSave.includes(l._id) ? { ...l, saved: true } : l));
      setSelectedLeads([]);
      await axios.post('http://localhost:3001/api/leads/batch-save', { ids: idsToSave, saved: true }, {
        headers: { userid: user._id }
      });
    } catch (err) {
      console.error('Failed to batch save leads:', err);
      fetchLeads();
    }
  };

  // Save All Leads
  const handleSaveAll = async () => {
    if (!user?._id || leads.length === 0) return;
    try {
      setLeads(prev => prev.map(l => ({ ...l, saved: true })));
      await axios.post('http://localhost:3001/api/leads/batch-save', { all: true, saved: true }, {
        headers: { userid: user._id }
      });
    } catch (err) {
      console.error('Failed to save all leads:', err);
      fetchLeads();
    }
  };

  const handleExportCSV = () => {
    if ((user?.plan || 'free') === 'free') {
      setUpgradeTab('plans');
      setUpgradeModalOpen(true);
      return;
    }

    if (leads.length === 0) return;
    const headers = ['Business Name', 'Category', 'Phone', 'Website', 'Rating', 'Location'];
    const rows = leads.map((l) => [
      `"${l.businessName || ''}"`,
      `"${l.category || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.website || ''}"`,
      `"${l.rating || ''}"`,
      `"${l.location || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LeadPulse_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState('All');

  const categories = Array.from(new Set(leads.map(l => l.category).filter(Boolean)));

  const displayLeads = leads.filter(lead => {
    if (selectedCategory !== 'All' && lead.category !== selectedCategory) {
      return false;
    }
    if (selectedRating !== 'All') {
      const minRating = parseFloat(selectedRating);
      if ((lead.rating || 0) < minRating) return false;
    }
    return true;
  });

  const currentPlan = user?.plan || 'free';
  const isFree = currentPlan === 'free';

  return (
    <div className="flex w-full min-h-screen bg-[#FAFAFA] font-sans text-[#09090B]">
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Local Lead Generation Command Center" />

        {/* CONTENT ROW */}
        <div className="p-6 sm:p-8 flex flex-col xl:flex-row gap-6">
          
          {/* LEFT COLUMN: Lead Finder Wizard + Table */}
          <div className="flex-1 flex flex-col min-w-0 space-y-4">
            
            {/* 1. GUIDED LEAD FINDER WIZARD (COMPUTE SETUP UI) */}
            <LeadFinderWizard onHarvestStarted={fetchLeads} />

            {/* Filters Row */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Stream Filters:</span>
                
                {/* 1. Categories Filter */}
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white border border-[#E4E4E7] rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs outline-none text-gray-700 hover:border-accent cursor-pointer transition-colors"
                >
                  <option value="All">Category: All ({leads.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({leads.filter(l => l.category === cat).length})
                    </option>
                  ))}
                </select>

                {/* 2. Radius Filter */}
                <select 
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(e.target.value)}
                  className="bg-white border border-[#E4E4E7] rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs outline-none text-gray-700 hover:border-accent cursor-pointer transition-colors"
                >
                  <option value="All">Radius: Any Distance</option>
                  <option value="15km">Radius: 15km</option>
                  <option value="25km">Radius: 25km</option>
                </select>

                {/* 3. Rating Filter */}
                <select 
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="bg-white border border-[#E4E4E7] rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs outline-none text-gray-700 hover:border-accent cursor-pointer transition-colors"
                >
                  <option value="All">Rating: Any Rating</option>
                  <option value="4.0">Rating: 4.0+ Stars</option>
                  <option value="4.5">Rating: 4.5+ Stars</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Batch Actions when items are selected */}
                {selectedLeads.length > 0 ? (
                  <>
                    <button 
                      onClick={handleBatchSave}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Save selected leads to CRM Pipeline"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Selected ({selectedLeads.length})</span>
                    </button>
                    <button 
                      onClick={handleBatchDelete}
                      className="bg-rose-50 text-rose-700 border border-rose-200 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Delete selected leads"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedLeads.length})</span>
                    </button>
                  </>
                ) : leads.length > 0 ? (
                  <>
                    <button 
                      onClick={handleSaveAll}
                      className="bg-white border border-[#E4E4E7] text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Save all leads to CRM Pipeline"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Save All</span>
                    </button>
                    <button 
                      onClick={handleDeleteAll}
                      className="bg-white border border-[#E4E4E7] text-rose-700 hover:bg-rose-50 hover:border-rose-200 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Delete all leads from stream"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete All</span>
                    </button>
                  </>
                ) : null}

                {/* Export CSV with Feature Exclusion Guard */}
                <button 
                  onClick={handleExportCSV}
                  className="bg-white border border-[#E4E4E7] rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-[#F4F4F5] transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={isFree ? 'Requires Basic Plan' : 'Export leads to CSV'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                  {isFree && <Lock className="w-3 h-3 text-amber-500 ml-0.5" />}
                </button>

                <button 
                  onClick={toggleAll}
                  className="bg-white border border-[#E4E4E7] rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-[#F4F4F5] transition-colors cursor-pointer"
                >
                  {selectedLeads.length > 0 ? `Selected (${selectedLeads.length})` : `Select All (${displayLeads.length})`}
                </button>

                <button 
                  onClick={() => navigate('/outreach')}
                  className="bg-accent text-white rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-xs shadow-accent/20 hover:bg-accent-dark transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" fill="currentColor" /> 
                  <span>Launch Outreach Batch</span>
                </button>
              </div>
            </div>

            {/* Table (Responsive Auto-Expanding Length with Max-Height Lock & Scroll) */}
            <div className="w-full bg-white border border-[#E4E4E7] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[300px] max-h-[580px] transition-all duration-200">
              <div className="shrink-0 px-5 py-3.5 border-b border-[#E4E4E7] flex justify-between items-center bg-[#F4F4F5]/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[#09090B]">Generated Lead Stream</h3>
                  <span className="text-[11px] font-bold bg-white border border-[#E4E4E7] px-2 py-0.5 rounded-full text-gray-600">
                    {displayLeads.length} {displayLeads.length === 1 ? 'Lead' : 'Total Leads'}
                  </span>
                  {displayLeads.length > 8 && (
                    <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                      Scroll to view all
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  <span>Real-time sync enabled</span>
                </div>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-white border-b border-[#E4E4E7] z-10">
                    <tr className="text-gray-500 font-bold">
                      <th className="py-3 px-5 w-12 cursor-pointer" onClick={toggleAll}>
                        {selectedLeads.length === displayLeads.length && displayLeads.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-accent" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                        )}
                      </th>
                      <th className="py-3 px-2">Business Name</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Contact Phone</th>
                      <th className="py-3 px-2">Scope / Verification</th>
                      <th className="py-3 px-2">Rating</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLeads.map((lead, i) => (
                      <tr key={lead._id || i} className={`border-b border-[#E4E4E7] last:border-0 hover:bg-[#FAFAFA] group ${selectedLeads.includes(lead._id) ? 'bg-accent/5' : ''}`}>
                        <td className="py-3 px-5 cursor-pointer" onClick={() => toggleLead(lead._id)}>
                          {selectedLeads.includes(lead._id) ? (
                            <CheckSquare className="w-4 h-4 text-accent" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
                          )}
                        </td>
                        <td className="py-3 px-2 font-bold text-[#09090B] flex items-center gap-1.5">
                          {lead.businessName} <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                        </td>
                        <td className="py-3 px-2 text-gray-600 font-medium">{lead.category}</td>
                        <td className="py-3 px-2 font-medium flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {lead.phone} 
                          <span className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded flex items-center justify-center text-[9px] font-black">✔</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${lead.scope === 'deep' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}>
                            {lead.scope === 'deep' ? 'Deep Harvest' : 'Quick Scan'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-amber-500 font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{lead.rating || '4.8'}</span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Save / Bookmark Lead */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSaveLead(lead);
                              }}
                              title={lead.saved ? "Saved to CRM (Click to remove)" : "Save Lead to CRM"}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                lead.saved 
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-xs' 
                                  : 'bg-white border-[#E4E4E7] text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                              }`}
                            >
                              {lead.saved ? (
                                <BookmarkCheck className="w-3.5 h-3.5 fill-emerald-500/20" />
                              ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete Lead */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSingleLead(lead._id);
                              }}
                              title="Delete lead"
                              className="p-1.5 rounded-lg border border-[#E4E4E7] bg-white text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Pipeline Navigation */}
                            <button 
                              onClick={() => navigate('/crm')}
                              className="bg-accent text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-xs hover:bg-accent-dark transition-colors flex items-center gap-1 cursor-pointer"
                              title="View CRM Pipeline"
                            >
                              <span>Pipeline</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {displayLeads.length === 0 && (
                  <div className="py-16 px-6 text-center text-xs text-gray-400 space-y-2 flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="font-bold text-gray-600 text-sm">No leads extracted yet</p>
                    <p className="max-w-xs text-gray-400">Use the Lead Finder Wizard above to launch your first targeted harvest.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Map & Telemetry Feed */}
          <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6 self-start xl:sticky xl:top-6">
            
            <div className="bg-white border border-[#E4E4E7] rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#E4E4E7] bg-[#F4F4F5]/50 flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-[#09090B]">Geographic Intelligence Feed</h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Live OSM</span>
              </div>
              <div className="p-4 bg-[#F4F4F5] relative">
                {/* Real Map Embed */}
                <div className="w-full h-44 bg-gray-200 rounded-xl overflow-hidden relative border border-[#E4E4E7] shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=73.05,19.20,73.18,19.28&layer=mapnik&marker=19.24,73.13`} 
                    style={{ border: 0 }}
                    title="OpenStreetMap Embed"
                  />
                  <div className="absolute bottom-2.5 right-2.5 bg-white p-1.5 rounded-lg shadow-md border border-[#E4E4E7]">
                    <Navigation className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 text-xs space-y-2.5">
                <div className="flex gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <div className="text-gray-600 leading-tight text-[11px]">
                    <span className="font-bold text-accent">[Headless Worker]</span> Google Maps cluster listening on local ports.
                  </div>
                </div>
                <div className="flex gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-gray-600 leading-tight text-[11px]">
                    <span className="font-bold text-blue-600">[Compliance]</span> Anti-spam suppression filters active.
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Tier Shortcut Card */}
            <div className="bg-gradient-to-br from-gray-900 to-[#18181B] text-white rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-accent bg-accent/20 px-2.5 py-0.5 rounded-full">
                  Subscription Tier
                </span>
                <span className="text-xs font-bold text-gray-300">
                  {currentPlan.toUpperCase()}
                </span>
              </div>

              <div>
                <div className="text-2xl font-black">
                  {currentPlan === 'free' ? '₹0 / Forever' : currentPlan === 'basic' ? '₹699 / mo' : '₹1,999 / mo'}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {isFree ? '15 token / lead pool • Refreshes every 4 days' : 'Continuous daily limits & unlimited exports'}
                </p>
              </div>

              <button 
                onClick={() => {
                  setUpgradeTab('plans');
                  setUpgradeModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-extrabold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFree ? 'Upgrade to Basic / Pro' : 'Manage Subscription'}</span>
              </button>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
