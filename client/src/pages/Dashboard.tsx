import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  MoreHorizontal, CheckCircle2, Layout,
  Target, Mail, Star, Phone, ArrowRight, Send,
  TrendingUp, Users, Compass, Layers, Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/leads', {
        headers: { userid: user?._id }
      });
      setLeads(res.data);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    }
  };

  const totalLeads = leads.length;
  const categories = Array.from(new Set(leads.map(l => l.category).filter(Boolean))).slice(0, 4);
  const newLeads = leads.filter(l => l.status === 'New').length;
  const contactedLeads = leads.filter(l => l.status === 'WhatsApp Contacted' || l.status === 'Email Verified & Captured').length;
  const proposalLeads = leads.filter(l => l.status === 'Proposal Sent').length;
  const wonLeads = leads.filter(l => l.status === 'Closed Won').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-[1360px] mx-auto space-y-6 pb-12">
            
            {/* Unified 4-Column Divided KPI Ledger (Zero Pastel Rainbow Boxes) */}
            <div className="bg-white border border-[#E5E0D5] rounded-lg grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D5] overflow-hidden">
              {/* Metric 1: Total Verified Leads */}
              <div className="p-4.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-delight uppercase tracking-wider font-semibold text-[#6E675F]">Verified Leads</span>
                  <Users className="w-3.5 h-3.5 text-[#9C9488]" />
                </div>
                <div className="text-2xl font-bold font-delight tracking-tight text-[#191716] tabular-nums mt-2">{totalLeads}</div>
                <div className="text-[11px] mt-1.5 flex items-center gap-1.5 font-delight font-medium text-[#6E675F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                  <span className="text-[#191716] font-semibold">+100%</span>
                  <span>active pool</span>
                </div>
              </div>

              {/* Metric 2: Pipeline Active */}
              <div className="p-4.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-delight uppercase tracking-wider font-semibold text-[#6E675F]">Active Sequence</span>
                  <Activity className="w-3.5 h-3.5 text-[#9C9488]" />
                </div>
                <div className="text-2xl font-bold font-delight tracking-tight text-[#191716] tabular-nums mt-2">{contactedLeads}</div>
                <div className="text-[11px] mt-1.5 flex items-center gap-1.5 font-delight font-medium text-[#6E675F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                  <span className="text-[#191716] font-semibold">Multi-Channel</span>
                  <span>cadence</span>
                </div>
              </div>

              {/* Metric 3: Proposals & Won */}
              <div className="p-4.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-delight uppercase tracking-wider font-semibold text-[#6E675F]">Proposals &amp; Won</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#9C9488]" />
                </div>
                <div className="text-2xl font-bold font-delight tracking-tight text-[#191716] tabular-nums mt-2">{proposalLeads + wonLeads}</div>
                <div className="text-[11px] mt-1.5 flex items-center gap-1.5 font-delight font-medium text-[#6E675F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="text-[#191716] font-semibold">{wonLeads} Closed Won</span>
                  <span>converted</span>
                </div>
              </div>

              {/* Metric 4: Available Credits */}
              <div className="p-4.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-delight uppercase tracking-wider font-semibold text-[#6E675F]">Credit Quota</span>
                  <Compass className="w-3.5 h-3.5 text-[#9C9488]" />
                </div>
                <div className="text-2xl font-bold font-delight tracking-tight text-[#191716] tabular-nums mt-2">{user?.lead_credits ?? 50}</div>
                <div className="text-[11px] mt-1.5 flex items-center gap-1.5 font-delight font-medium text-[#6E675F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                  <span className="text-[#191716] font-semibold uppercase">Tier: {user?.plan || 'Free'}</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              
              {/* Left / Center 8 Cols */}
              <div className="xl:col-span-8 space-y-5">
                
                {/* Section: Recently Harvested Niches */}
                <div className="bg-white border border-[#E5E0D5] rounded-lg overflow-hidden">
                  <div className="px-4.5 py-3 bg-[#F5F2EB] border-b border-[#E5E0D5] flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider font-delight text-[#191716]">Harvested Prospect Cohorts</h2>
                      <p className="text-[11px] text-[#6E675F] font-delight font-normal">Recently queried industry segments</p>
                    </div>
                    <Link to="/crm" className="text-xs font-delight font-semibold text-[#C85A32] hover:text-[#B04B25] flex items-center gap-1">
                      <span>View in CRM</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {categories.length > 0 ? categories.map((cat, i) => (
                      <div 
                        key={i} 
                        onClick={() => navigate('/crm')} 
                        className="rounded-md border border-[#E5E0D5] bg-[#FAF8F5] hover:bg-white hover:border-[#C85A32] p-3.5 transition-all cursor-pointer group"
                      >
                         <div className="flex items-center justify-between mb-1.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                           <span className="text-[10px] font-delight font-normal text-[#6E675F]">Cohort #{i + 1}</span>
                         </div>
                         <div className="text-xs font-bold font-delight text-[#191716] group-hover:text-[#C85A32] transition-colors truncate">
                           {cat}
                         </div>
                         <div className="text-[11px] text-[#6E675F] font-delight font-normal mt-1">
                           {leads.filter(l => l.category === cat).length} leads mapped
                         </div>
                      </div>
                    )) : (
                      <div 
                        onClick={() => navigate('/finder')} 
                        className="col-span-3 rounded-md border border-dashed border-[#D6CFC2] bg-[#FAF8F5] p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#C85A32] transition-colors text-center"
                      >
                        <p className="text-xs font-semibold font-delight text-[#191716]">No lead lists created yet</p>
                        <p className="text-[11px] text-[#6E675F] mt-0.5">Launch the Lead Finder to scrape targeted business contacts.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Funnel Execution Engine */}
                <div className="bg-white border border-[#E5E0D5] rounded-lg overflow-hidden">
                  <div className="px-4.5 py-3 bg-[#F5F2EB] border-b border-[#E5E0D5] flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider font-delight text-[#191716]">Pipeline Progression</h2>
                      <p className="text-[11px] text-[#6E675F] font-delight font-normal">Conversion flow telemetry</p>
                    </div>
                    <span className="text-[10px] font-delight font-semibold bg-white text-[#191716] px-2 py-0.5 rounded border border-[#E5E0D5] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                      Live Telemetry
                    </span>
                  </div>

                  <div className="p-4.5 space-y-4">
                    {/* Funnel Strip 1 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-delight font-medium text-[#57514B]">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#191716]"></span>
                          <span>Uncontacted Ingest ({newLeads})</span>
                        </span>
                        <span className="font-semibold text-[#191716] tabular-nums">{totalLeads > 0 ? Math.round((newLeads / totalLeads) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-[#F5F2EB] h-1.5 rounded-xs overflow-hidden border border-[#E5E0D5]">
                        <div className="bg-[#191716] h-full rounded-xs transition-all duration-500" style={{ width: `${totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    {/* Funnel Strip 2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-delight font-medium text-[#57514B]">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
                          <span>Contacted &amp; Outreach Dispatched ({contactedLeads})</span>
                        </span>
                        <span className="font-semibold text-[#191716] tabular-nums">{totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-[#F5F2EB] h-1.5 rounded-xs overflow-hidden border border-[#E5E0D5]">
                        <div className="bg-[#C85A32] h-full rounded-xs transition-all duration-500" style={{ width: `${totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    {/* Funnel Strip 3 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-delight font-medium text-[#57514B]">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>Closed Deals &amp; Converted ({wonLeads})</span>
                        </span>
                        <span className="font-semibold text-[#191716] tabular-nums">{totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-[#F5F2EB] h-1.5 rounded-xs overflow-hidden border border-[#E5E0D5]">
                        <div className="bg-emerald-600 h-full rounded-xs transition-all duration-500" style={{ width: `${totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4.5 py-3 bg-[#FAF8F5] border-t border-[#E5E0D5] flex items-center justify-between">
                    <span className="text-[11px] text-[#6E675F] font-delight font-medium">Continuous synchronization with CRM stages</span>
                    <button 
                      onClick={() => navigate('/crm')}
                      className="px-3 py-1.5 bg-white hover:bg-[#F5F2EB] border border-[#E5E0D5] text-[#191716] rounded-md text-xs font-delight font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Open Kanban Board</span>
                      <ArrowRight className="w-3 h-3 text-[#6E675F]" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column 4 Cols */}
              <div className="xl:col-span-4 space-y-5">
                
                {/* Operator Profile Card */}
                <div className="bg-white border border-[#E5E0D5] rounded-lg overflow-hidden">
                  <div className="px-4.5 py-3 bg-[#F5F2EB] border-b border-[#E5E0D5] flex items-center justify-between">
                    <span className="text-[10px] font-delight uppercase tracking-wider font-bold text-[#191716]">Authenticated Operator</span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-delight bg-white text-[#191716] px-2 py-0.5 rounded border border-[#E5E0D5] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-4.5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-[#191716] text-white flex items-center justify-center font-bold text-xs shrink-0 font-delight">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#191716] font-delight truncate tracking-tight">{user?.name || 'Ashley G.'}</div>
                        <div className="text-[11px] text-[#6E675F] font-delight font-normal truncate">{user?.email || 'operator@leadpulse.io'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-[#E5E0D5] border border-[#E5E0D5] rounded-md bg-[#FAF8F5] text-center font-delight">
                      <div className="p-2">
                        <div className="text-[10px] text-[#6E675F] uppercase font-semibold">Role</div>
                        <div className="text-xs font-bold text-[#191716] mt-0.5">{user?.role || 'Super Admin'}</div>
                      </div>
                      <div className="p-2">
                        <div className="text-[10px] text-[#6E675F] uppercase font-semibold">Plan</div>
                        <div className="text-xs font-bold text-[#C85A32] uppercase mt-0.5">{user?.plan || 'Free'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Execution Dispatchers (Divided Architectural List) */}
                <div className="bg-white border border-[#E5E0D5] rounded-lg overflow-hidden">
                  <div className="px-4.5 py-3 bg-[#F5F2EB] border-b border-[#E5E0D5] flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-delight text-[#191716]">Direct Actions</h3>
                    <span className="text-[10px] font-delight font-normal text-[#6E675F]">Quick dispatch</span>
                  </div>

                  <div className="divide-y divide-[#E5E0D5]">
                    <button 
                      onClick={() => navigate('/finder')}
                      className="w-full p-3.5 bg-white hover:bg-[#FAF8F5] text-left transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#F5F2EB] border border-[#E5E0D5] text-[#191716] group-hover:bg-[#C85A32] group-hover:text-white group-hover:border-[#C85A32] flex items-center justify-center transition-colors">
                          <Target className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-delight text-[#191716] group-hover:text-[#C85A32] transition-colors">Launch Lead Harvester</div>
                          <div className="text-[11px] text-[#6E675F]">Scrape geo-targeted B2B listings</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9C9488] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button 
                      onClick={() => navigate('/outreach')}
                      className="w-full p-3.5 bg-white hover:bg-[#FAF8F5] text-left transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#F5F2EB] border border-[#E5E0D5] text-[#191716] group-hover:bg-[#C85A32] group-hover:text-white group-hover:border-[#C85A32] flex items-center justify-center transition-colors">
                          <Send className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-delight text-[#191716] group-hover:text-[#C85A32] transition-colors">Outreach Studio</div>
                          <div className="text-[11px] text-[#6E675F]">Launch email or WhatsApp campaign</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9C9488] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button 
                      onClick={() => navigate('/audience')}
                      className="w-full p-3.5 bg-white hover:bg-[#FAF8F5] text-left transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#F5F2EB] border border-[#E5E0D5] text-[#191716] group-hover:bg-[#C85A32] group-hover:text-white group-hover:border-[#C85A32] flex items-center justify-center transition-colors">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-delight text-[#191716] group-hover:text-[#C85A32] transition-colors">Audience &amp; Contacts</div>
                          <div className="text-[11px] text-[#6E675F]">Manage direct contact coordinates</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9C9488] group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
