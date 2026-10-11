import { 
  BarChart3, Database, MessageSquare, Play, Send, 
  Sparkles, Users, Zap, ShieldCheck, Waypoints, 
  Search, Target, Layers, FileText, X, Check, Shield, Mail
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import MeshBackground from '../components/MeshBackground';
import { useStore } from '../store/useStore';

const companies = [
  { name: 'Acme Corp', icon: Database },
  { name: 'Globex', icon: BarChart3 },
  { name: 'Soylent', icon: Users },
  { name: 'Initech', icon: Zap },
  { name: 'Umbrella', icon: ShieldCheck },
  { name: 'Massive Dynamic', icon: Sparkles },
];

const Landing = ({ onLogin }: { onLogin: () => void }) => {
  const { token } = useStore();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  // Modal states for footer
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 75, damping: 16 } }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-sans text-[#191716] bg-[#FAF8F5] flex flex-col selection:bg-[#C85A32] selection:text-white relative">
      
      {/* Warm Linen & Editorial Paper Architectural Canvas */}
      <MeshBackground variant="landing" />

      {/* ================= 1. NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-[#E5E0D5] bg-[#FAF8F5]/90 backdrop-blur-md">
        <motion.nav 
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto w-full"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[5px] bg-[#C85A32] text-white flex items-center justify-center font-delight font-extrabold text-xs shadow-xs">
              LP
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#191716]">LeadPulse</span>
            <span className="text-[10px] font-delight font-bold uppercase bg-[#F5F2EB] text-[#C85A32] border border-[#E5E0D5] px-1.5 py-0.5 rounded-[4px] ml-0.5 tracking-wider">
              v3.0
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-delight font-bold tracking-widest uppercase text-[#57524B]">
            <a href="#product" className="hover:text-[#C85A32] transition-colors">Platform</a>
            <a href="#features" className="hover:text-[#C85A32] transition-colors">Capabilities</a>
            <a href="#benchmarks" className="hover:text-[#C85A32] transition-colors">Telemetry</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="text-xs font-delight font-semibold text-[#57524B] hover:text-[#191716] transition-colors px-2.5 py-1.5 cursor-pointer"
            >
              {token ? 'Dashboard' : 'Sign In'}
            </button>
            <button
              onClick={onLogin}
              className="h-8.5 px-4 bg-[#191716] text-[#FAF8F5] rounded-[5px] font-delight font-semibold text-xs hover:bg-[#C85A32] transition-colors border border-[#191716] hover:border-[#C85A32] shadow-xs cursor-pointer"
            >
              {token ? 'Go to Console' : 'Launch Console'} &rarr;
            </button>
          </div>
        </motion.nav>
      </header>

      {/* ================= 2. HERO SECTION (2-COLUMN LEFT ALIGNED) ================= */}
      <section className="relative pt-14 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          
          {/* Left Column: Editorial Typography */}
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left z-10"
          >
            <motion.div
              variants={itemVars}
              className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-[5px] border border-[#E5E0D5] bg-[#F5F2EB] text-[11px] font-delight font-bold text-[#57524B] tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>LEADPULSE 3.0 // ARCHITECTURE RELEASE</span>
              <span className="w-1 h-1 rounded-full bg-[#D6CFC2] mx-0.5"></span>
              <a href="#product" className="text-[#C85A32] hover:underline flex items-center gap-1">
                Specs &rarr;
              </a>
            </motion.div>

            <motion.h1 
              variants={itemVars}
              className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#191716] leading-[1.07] mb-5"
            >
              The intelligent <br /> revenue operating engine for{' '}
              <span className="text-[#C85A32] font-serif italic font-normal">
                commercial sales teams.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVars}
              className="text-sm md:text-[15.5px] text-[#57524B] font-normal max-w-lg mb-8 leading-relaxed"
            >
              Consolidate disconnected prospecting point solutions. LeadPulse unifies precision entity discovery, generative AI message synthesis, and multi-channel pipeline dispatch in one developer-grade console.
            </motion.p>

            <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onLogin}
                className="w-full sm:w-auto h-11 px-6 bg-[#C85A32] text-white rounded-[6px] font-delight font-bold text-[13px] hover:bg-[#B04B25] transition-all flex items-center justify-center gap-2 border border-[#B04B25] shadow-xs cursor-pointer"
              >
                {token ? 'Go to Dashboard' : 'Launch Workspace'} &rarr;
              </button>
              <a
                href="#product"
                className="w-full sm:w-auto h-11 px-5 bg-[#F5F2EB] border border-[#D6CFC2] text-[#191716] rounded-[6px] font-delight font-semibold text-[13px] hover:bg-[#EFECE4] transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-[#191716]" /> Inspect Platform
              </a>
            </motion.div>

            <motion.div variants={itemVars} className="mt-4 flex items-center gap-2 text-[11px] font-delight font-semibold text-[#78716A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span>
              <span>Instant access • Application Default Credentials • Zero bloat</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Technical Composition */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, type: "spring" }}
            className="relative w-full h-[460px] lg:h-[500px]"
          >
            {/* Main Architectural Frame */}
            <motion.div 
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-lg overflow-hidden shadow-lg border border-[#D6CFC2] ml-6 lg:ml-9 mt-8 bg-[#191716]"
            >
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop" 
                alt="Sales team collaborating" 
                className="w-full h-full object-cover opacity-75 mix-blend-luminosity"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(25, 23, 22, 0.82) 0%, rgba(25, 23, 22, 0.25) 55%, rgba(200, 90, 50, 0.32) 100%)'
                }}
              />
              <div className="absolute top-4 right-4 bg-[#191716]/80 backdrop-blur-xs border border-white/15 text-[#F5F2EB] px-2.5 py-1 rounded-[4px] text-[10px] font-delight font-semibold tracking-wider uppercase">
                WORKSPACE // LIVE STREAM
              </div>
            </motion.div>

            {/* Floating Vector UI 1: Telemetry Card */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute top-2 left-0 w-72 bg-white rounded-lg shadow-xl border border-[#D6CFC2] overflow-hidden z-20 text-[#191716]"
            >
              <div className="h-8.5 bg-[#F5F2EB] border-b border-[#E5E0D5] flex items-center px-3 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C85A32]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#D6CFC2]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#D6CFC2]"></div>
                </div>
                <div className="ml-auto text-[10px] font-delight font-bold text-[#78716A] uppercase tracking-wider">
                  TELEMETRY_FEED
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs font-delight font-bold text-[#191716]">MQL Conversion Rate</div>
                    <div className="text-[10.5px] font-delight text-[#78716A]">+24.8% vs prior cohort</div>
                  </div>
                  <div className="w-7 h-7 rounded-[5px] bg-[#FDF3EF] text-[#C85A32] border border-[#F2D0C2] flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-20 mt-2">
                  {[42, 68, 50, 92, 74].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.9, delay: 0.8 + (i * 0.1) }}
                      className={`flex-1 rounded-t-[3px] transition-colors ${
                        i === 3 ? 'bg-[#C85A32]' : 'bg-[#191716] hover:bg-[#C85A32]'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#E5E0D5] flex items-center justify-between text-[11px] font-delight">
                  <span className="text-[#78716A]">Verified Domain Match</span>
                  <span className="font-bold text-[#191716] tabular-nums">94.2%</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Vector UI 2: Dispatch Notification */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute bottom-5 left-5 bg-[#191716] p-3.5 rounded-[7px] shadow-xl flex items-center gap-3 z-30 text-[#FAF8F5] border border-[#332E2B]"
            >
              <div className="w-8.5 h-8.5 rounded-[5px] bg-[#C85A32]/20 border border-[#E07A5F]/40 flex items-center justify-center text-[#E07A5F]">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-delight font-bold text-white">Campaign Dispatched</div>
                <div className="text-[10.5px] font-delight text-[#A8A096] tabular-nums">
                  Variant B • 68.4% open rate • SMTP 200 OK
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ================= 3. MARQUEE SECTION ================= */}
      <section className="py-10 border-y border-[#E5E0D5] bg-[#F5F2EB] overflow-hidden w-full relative z-10">
        <p className="text-center text-[11px] font-delight font-bold text-[#78716A] mb-7 uppercase tracking-[0.14em]">
          Powering revenue teams at modern commercial organizations
        </p>
        <div className="w-full inline-flex flex-nowrap overflow-hidden pointer-events-none select-none [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          <div className="flex items-center shrink-0 w-max gap-16 pr-16 animate-marquee">
            {[...companies, ...companies].map((company, i) => {
              const Icon = company.icon;
              return (
                <div key={i} className="flex items-center gap-3 opacity-85">
                  <div className="w-7 h-7 rounded-[5px] bg-white border border-[#D6CFC2] flex items-center justify-center text-[#C85A32]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-[#191716]">{company.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center shrink-0 w-max gap-16 pr-16 animate-marquee" aria-hidden="true">
            {[...companies, ...companies].map((company, i) => {
              const Icon = company.icon;
              return (
                <div key={i + 'dup'} className="flex items-center gap-3 opacity-85">
                  <div className="w-7 h-7 rounded-[5px] bg-white border border-[#D6CFC2] flex items-center justify-center text-[#C85A32]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight text-[#191716]">{company.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. PLATFORM ARCHITECTURE SHOWCASE (id="product") ================= */}
      <section id="product" className="py-22 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10 scroll-mt-20">
        <div className="text-left mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] border border-[#E5E0D5] bg-[#F5F2EB] text-[11px] font-delight font-bold text-[#57524B] mb-3.5">
            <Layers className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>UNIFIED ARCHITECTURE // THREE ENGINES</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#191716] mb-3.5">
            Three core pillars. One integrated workspace.
          </h2>
          <p className="text-sm md:text-[15px] text-[#57524B] font-normal leading-relaxed">
            Eliminate fragmented tools. LeadPulse connects precision prospect harvesting, generative AI email &amp; WhatsApp delivery, and visual CRM pipeline automation into an interconnected ledger.
          </p>
        </div>

        {/* Unified 3-Column 1px Divided Architectural Ledger */}
        <div className="bg-white border border-[#E5E0D5] rounded-lg grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E0D5] overflow-hidden shadow-2xs">
          
          {/* Pillar 1 */}
          <div className="p-8 hover:bg-[#FAF8F5]/70 transition-colors flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-9.5 h-9.5 rounded-[6px] bg-[#F5F2EB] text-[#C85A32] border border-[#D6CFC2] flex items-center justify-center mb-4">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] font-delight font-bold uppercase tracking-wider text-[#C85A32] block">
                Pillar 01 // Discovery
              </span>
              <h3 className="text-lg font-extrabold tracking-tight text-[#191716]">
                Lead Finder &amp; Geo-Database
              </h3>
              <p className="text-[13px] text-[#57524B] leading-relaxed">
                Extract verified local and commercial business records in seconds. Access real-time public registries, validated websites, and physical locations with zero synthetic or spoofed emails.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between text-xs font-delight font-semibold text-[#78716A]">
              <span>Spatial Extraction</span>
              <button
                onClick={onLogin}
                className="text-[#191716] hover:text-[#C85A32] flex items-center gap-1 font-delight font-bold text-xs cursor-pointer transition-colors"
              >
                Explore Finder &rarr;
              </button>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 hover:bg-[#FAF8F5]/70 transition-colors flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-9.5 h-9.5 rounded-[6px] bg-[#FDF3EF] text-[#C85A32] border border-[#F2D0C2] flex items-center justify-center mb-4">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] font-delight font-bold uppercase tracking-wider text-[#C85A32] block">
                Pillar 02 // Dispatch
              </span>
              <h3 className="text-lg font-extrabold tracking-tight text-[#191716]">
                Outreach Studio &amp; AI Copilot
              </h3>
              <p className="text-[13px] text-[#57524B] leading-relaxed">
                Generate high-converting personalized pitches via AI hook strategies. Dispatch production-grade cold emails via custom SMTP relays or initiate 1-click WhatsApp web conversations.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between text-xs font-delight font-semibold text-[#78716A]">
              <span>Email &amp; WhatsApp Relays</span>
              <button
                onClick={onLogin}
                className="text-[#191716] hover:text-[#C85A32] flex items-center gap-1 font-delight font-bold text-xs cursor-pointer transition-colors"
              >
                Explore Studio &rarr;
              </button>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 hover:bg-[#FAF8F5]/70 transition-colors flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-9.5 h-9.5 rounded-[6px] bg-[#F5F2EB] text-[#C85A32] border border-[#D6CFC2] flex items-center justify-center mb-4">
                <Waypoints className="w-4 h-4" />
              </div>
              <span className="text-[10.5px] font-delight font-bold uppercase tracking-wider text-[#C85A32] block">
                Pillar 03 // Pipeline
              </span>
              <h3 className="text-lg font-extrabold tracking-tight text-[#191716]">
                Kanban Pipeline &amp; Journeys
              </h3>
              <p className="text-[13px] text-[#57524B] leading-relaxed">
                Organize commercial prospects across interactive Kanban stages. Track deal momentum, configure automated multi-step journeys, and advance conversion stages seamlessly.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E0D5] flex items-center justify-between text-xs font-delight font-semibold text-[#78716A]">
              <span>Behavioral Triggers</span>
              <button
                onClick={onLogin}
                className="text-[#191716] hover:text-[#C85A32] flex items-center gap-1 font-delight font-bold text-xs cursor-pointer transition-colors"
              >
                Explore Pipeline &rarr;
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 5. BENTO GRID CAPABILITIES (id="features") ================= */}
      <section id="features" ref={targetRef} className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10 scroll-mt-20">
        <motion.div style={{ opacity, y }} className="text-left mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] border border-[#E5E0D5] bg-[#F5F2EB] text-[11px] font-delight font-bold text-[#57524B] mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>PRODUCTION TELEMETRY // BENTO SPECIFICATIONS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#191716] mb-3.5">
            Engineered capabilities for predictable pipeline growth.
          </h2>
          <p className="text-sm md:text-[15px] text-[#57524B] font-normal leading-relaxed">
            By fusing spatial audience data with AI-assisted delivery, LeadPulse ensures outbound messages are targeted, context-rich, and free from automated spam markers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-min">
          
          {/* Feature 1 - Large spanning 2 cols */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 bg-white border border-[#E5E0D5] rounded-lg overflow-hidden relative flex flex-col justify-between p-8 hover:border-[#D6CFC2] transition-colors"
          >
            <div>
              <div className="w-10 h-10 bg-[#F5F2EB] border border-[#D6CFC2] rounded-[6px] flex items-center justify-center mb-5 text-[#C85A32]">
                <Search className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#191716] mb-2 tracking-tight">Real-Time Lead Harvesting</h3>
              <p className="text-[13.5px] text-[#57524B] leading-relaxed max-w-xl">
                Query verified commercial listings on demand. Filter by targeted metropolitan regions, industry categories, and operational status without relying on stale third-party databases.
              </p>
            </div>

            {/* Mini Harvested Entity Ledger */}
            <div className="mt-6 border border-[#E5E0D5] rounded-[6px] overflow-hidden bg-white font-delight text-xs">
              <div className="px-3.5 py-2 bg-[#F5F2EB] border-b border-[#E5E0D5] flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#78716A]">
                <span>Harvested Entity</span>
                <span className="hidden sm:inline">Domain &amp; MX Verification</span>
                <span>Rating</span>
              </div>
              <div className="px-3.5 py-2.5 border-b border-[#E5E0D5] flex items-center justify-between">
                <span className="font-bold text-[#191716]">Apex Dental Studio • Austin, TX</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  hello@apexdental.io (Verified)
                </span>
                <span className="font-bold text-[#C85A32] tabular-nums">★ 4.9 (214)</span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="font-bold text-[#191716]">Vanguard Logistics • Dallas, TX</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  ops@vanguardfreight.com (Verified)
                </span>
                <span className="font-bold text-[#C85A32] tabular-nums">★ 4.8 (162)</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Small (Warm Linen Surface) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg p-8 relative overflow-hidden flex flex-col justify-between hover:border-[#D6CFC2] transition-colors"
          >
            <div>
              <div className="w-10 h-10 bg-white border border-[#D6CFC2] rounded-[6px] flex items-center justify-center mb-5 text-[#191716]">
                <Waypoints className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#191716] mb-2 tracking-tight">Automated Journeys</h3>
              <p className="text-[13px] text-[#57524B] leading-relaxed">
                Design multi-stage nurturing sequences triggered by prospect engagement, status transitions, and custom delays.
              </p>
            </div>

            <div className="mt-6 border border-[#E5E0D5] rounded-[6px] overflow-hidden bg-white font-delight text-[11.5px]">
              <div className="px-3.5 py-2.5 border-b border-[#E5E0D5] flex items-center justify-between">
                <span className="text-[#78716A] font-semibold">01. WHEN</span>
                <span className="font-bold text-[#191716]">Lead Harvested (★ &ge; 4.5)</span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-[#C85A32] font-bold">02. THEN</span>
                <span className="font-bold text-[#C85A32]">Dispatch AI Pitch + Slack</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - Small (Warm Linen Surface) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg p-8 relative overflow-hidden flex flex-col justify-between hover:border-[#D6CFC2] transition-colors"
          >
            <div>
              <div className="w-10 h-10 bg-white border border-[#D6CFC2] rounded-[6px] flex items-center justify-center mb-5 text-[#191716]">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#191716] mb-2 tracking-tight">Multi-Channel Delivery</h3>
              <p className="text-[13px] text-[#57524B] leading-relaxed">
                Reach decision-makers via verified corporate email relays and direct WhatsApp conversational frameworks.
              </p>
            </div>

            <div className="mt-6 border border-[#E5E0D5] rounded-[6px] overflow-hidden bg-white font-delight text-[11.5px]">
              <div className="px-3.5 py-2.5 border-b border-[#E5E0D5] flex items-center justify-between">
                <span className="text-[#57524B]">Custom SMTP Relay</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> TLS 1.3 Active
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-[#57524B]">WhatsApp Direct Bridge</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#C85A32]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]"></span> Instant Sync
                </span>
              </div>
            </div>
          </motion.div>

          {/* Feature 4 - Large spanning 2 cols */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="md:col-span-2 bg-white border border-[#E5E0D5] rounded-lg p-8 relative overflow-hidden flex flex-col justify-between hover:border-[#D6CFC2] transition-colors"
          >
            <div>
              <div className="w-10 h-10 bg-[#FDF3EF] border border-[#F2D0C2] rounded-[6px] flex items-center justify-center mb-5 text-[#C85A32]">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#191716] mb-2 tracking-tight">
                Contextual AI Copilot (Delight Auto-Fill Engine)
              </h3>
              <p className="text-[13.5px] text-[#57524B] leading-relaxed max-w-xl">
                Synthesize customized email copy and conversation starters tailored to your prospect's business profile without generic AI buzzwords or spam triggers.
              </p>
            </div>

            <div className="mt-6 bg-[#191716] border border-[#2E2A27] rounded-[6px] p-4 text-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-7.5 h-7.5 rounded-[5px] bg-[#C85A32] text-white flex items-center justify-center font-delight font-bold text-xs">
                  ✦
                </div>
                <div>
                  <div className="text-xs font-delight font-bold text-white">AI Email Copilot • Auto-Fill Studio Card</div>
                  <div className="text-[10.5px] font-delight text-[#A8A096]">
                    Tone: Direct Executive • Hook: Google Maps Reputation + Audit
                  </div>
                </div>
              </div>
              <button
                onClick={onLogin}
                className="text-[11px] font-delight font-bold px-3 py-1.5 rounded-[4px] bg-[#C85A32]/20 border border-[#E07A5F]/40 text-[#E07A5F] hover:bg-[#C85A32] hover:text-white transition-colors cursor-pointer"
              >
                1-Click Synthesize &rarr;
              </button>
            </div>
          </motion.div>
        </div>

        {/* Unified 4-Column Divided Telemetry Benchmark Bar */}
        <div
          id="benchmarks"
          className="mt-6 bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E0D5] overflow-hidden scroll-mt-24"
        >
          <div className="p-5.5">
            <div className="text-[10px] font-delight font-bold uppercase tracking-wider text-[#78716A]">
              Spatial Extraction Speed
            </div>
            <div className="text-2xl font-delight font-extrabold text-[#191716] mt-1 tabular-nums">&lt; 1.8s</div>
          </div>
          <div className="p-5.5">
            <div className="text-[10px] font-delight font-bold uppercase tracking-wider text-[#78716A]">
              Zero Spoofed Records
            </div>
            <div className="text-2xl font-delight font-extrabold text-[#191716] mt-1 tabular-nums">100% Public</div>
          </div>
          <div className="p-5.5">
            <div className="text-[10px] font-delight font-bold uppercase tracking-wider text-[#78716A]">
              Pipeline Stages
            </div>
            <div className="text-2xl font-delight font-extrabold text-[#191716] mt-1 tabular-nums">6 Kanban</div>
          </div>
          <div className="p-5.5">
            <div className="text-[10px] font-delight font-bold uppercase tracking-wider text-[#78716A]">
              Avg. Reply Velocity
            </div>
            <div className="text-2xl font-delight font-extrabold text-[#C85A32] mt-1 tabular-nums">3.4x Faster</div>
          </div>
        </div>
      </section>

      {/* ================= 6. CTA SECTION (ESPRESSO & TERRACOTTA) ================= */}
      <section className="py-22 px-6 md:px-12 bg-[#191716] border-t border-[#2E2A27] text-[#FAF8F5] text-left relative overflow-hidden z-10 mt-8">
        <div
          className="absolute right-[-8%] top-[-30%] w-[520px] h-[520px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(200, 90, 50, 0.22) 0%, transparent 65%)'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-[#E07A5F]/35 bg-[#C85A32]/20 text-[11px] font-delight font-bold text-[#E07A5F] tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]"></span>
            <span>READY TO SCALE</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#FAF8F5]">
            Accelerate your outreach pipeline.
          </h2>
          <p className="text-sm md:text-base text-[#B8B0A4] mb-8 max-w-xl leading-relaxed">
            Equip your revenue operations with precision prospecting, custom SMTP delivery, and visual pipeline control.
          </p>
          <button
            onClick={onLogin}
            className="h-11 px-7 bg-[#C85A32] text-white rounded-[6px] font-delight font-bold text-[13px] hover:bg-[#B04B25] transition-colors border border-[#B04B25] shadow-xs flex items-center gap-2 cursor-pointer"
          >
            Launch Workspace Console &rarr;
          </button>
          <p className="mt-4 text-xs font-delight text-[#8C8479]">
            Autonomous operation • Zero complex setup
          </p>
        </div>
      </section>

      {/* ================= 7. FOOTER ================= */}
      <footer className="py-9 px-6 md:px-12 border-t border-[#E5E0D5] bg-[#F5F2EB] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6.5 h-6.5 rounded-[4px] bg-[#C85A32] text-white flex items-center justify-center font-delight font-extrabold text-[11px] shadow-xs">
              <Target className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold tracking-tight text-[#191716] text-sm">LeadPulse</span>
            <span className="text-[10.5px] font-delight font-semibold text-[#78716A]">
              // ENTERPRISE OPERATING SYSTEM
            </span>
          </div>

          {/* Interactive Footer Menu */}
          <div className="flex gap-6 text-xs font-delight font-semibold text-[#57524B]">
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-[#C85A32] transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-[#C85A32] transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => setIsContactOpen(true)} className="hover:text-[#C85A32] transition-colors cursor-pointer">
              Contact &amp; Support
            </button>
          </div>

          <p className="text-xs font-delight text-[#78716A]">
            &copy; {new Date().getFullYear()} LeadPulse Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= MODAL: PRIVACY POLICY ================= */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 bg-[#191716]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-lg shadow-xl border border-[#D6CFC2] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#191716]">
            <div className="p-5 border-b border-[#E5E0D5] flex items-center justify-between bg-[#F5F2EB]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[5px] bg-[#191716] text-white flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-[#191716]">LeadPulse Privacy Policy</h3>
                  <p className="text-[11px] font-delight text-[#78716A]">Effective Date: October 2026 • GDPR &amp; CCPA Compliant</p>
                </div>
              </div>
              <button onClick={() => setIsPrivacyOpen(false)} className="text-[#78716A] hover:text-[#191716] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#57524B] leading-relaxed">
              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">1. Information We Collect</h4>
                <p>
                  LeadPulse collects account credentials (name, email address), workspace profile configurations, and outreach preferences. In order to power your B2B prospect discovery, we access verified public professional records adhering strictly to data protection guidelines.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">2. How We Use and Protect Data</h4>
                <p>
                  We use collected telemetry solely to provide, refine, and secure the LeadPulse service. All CRM contacts, email templates, and automated workflows are encrypted both in transit (TLS 1.3) and at rest via Google Cloud Firestore. We never sell or rent your private database to third parties.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">3. B2B Outreach &amp; Compliance Rights</h4>
                <p>
                  Prospect data is processed on the basis of legitimate business interest for professional commercial communication. You maintain the right to delete, export, or modify any contact records at any time directly through your Audience Hub.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">4. Data Inquiries &amp; Contact</h4>
                <p>
                  For any privacy questions or data deletion requests, contact our Data Protection Officer at <a href="mailto:privacy@leadpulse.io" className="text-[#C85A32] font-delight font-semibold underline">privacy@leadpulse.io</a>.
                </p>
              </section>
            </div>

            <div className="p-4 border-t border-[#E5E0D5] bg-[#F5F2EB] flex justify-end">
              <button onClick={() => setIsPrivacyOpen(false)} className="px-4 py-1.5 bg-[#191716] text-white rounded-[5px] font-delight font-semibold text-xs hover:bg-[#C85A32] transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TERMS OF SERVICE ================= */}
      {isTermsOpen && (
        <div className="fixed inset-0 bg-[#191716]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-lg shadow-xl border border-[#D6CFC2] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-[#191716]">
            <div className="p-5 border-b border-[#E5E0D5] flex items-center justify-between bg-[#F5F2EB]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[5px] bg-[#191716] text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-[#191716]">Terms of Service</h3>
                  <p className="text-[11px] font-delight text-[#78716A]">Master Subscription Agreement • LeadPulse Inc.</p>
                </div>
              </div>
              <button onClick={() => setIsTermsOpen(false)} className="text-[#78716A] hover:text-[#191716] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#57524B] leading-relaxed">
              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">1. Acceptance of Terms</h4>
                <p>
                  By launching your workspace or accessing the LeadPulse platform, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, you represent that you have authority to bind that entity.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">2. Acceptable Outreach &amp; CAN-SPAM Policy</h4>
                <p>
                  You agree to use LeadPulse outreach tools (Email, WhatsApp, SMS) strictly for lawful, legitimate B2B communication. Sending unsolicited deceptive spam, phishing, harassment, or violating national anti-spam statutes (CAN-SPAM, CASL, PECR) will result in immediate workspace termination.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">3. Lead Credits &amp; Subscription Quotas</h4>
                <p>
                  Lead tokens and credits are consumed when harvesting or enriching verified contact records. Free tier plans receive 15 Lead Tokens / Credits with automated 4-day pool refreshes. Paid tiers provide expanded quotas, team seat allocation, and high-frequency scraper execution.
                </p>
              </section>

              <section className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#191716] font-delight">4. Limitation of Liability</h4>
                <p>
                  LeadPulse provides AI suggestions and contact intelligence on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee specific sales outcomes, conversion rates, or email inbox placement rates which depend on external recipient mail servers.
                </p>
              </section>
            </div>

            <div className="p-4 border-t border-[#E5E0D5] bg-[#F5F2EB] flex justify-end">
              <button onClick={() => setIsTermsOpen(false)} className="px-4 py-1.5 bg-[#191716] text-white rounded-[5px] font-delight font-semibold text-xs hover:bg-[#C85A32] transition-colors cursor-pointer">
                Acknowledge Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONTACT & SUPPORT ================= */}
      {isContactOpen && (
        <div className="fixed inset-0 bg-[#191716]/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-lg shadow-xl border border-[#D6CFC2] max-w-md w-full p-5 space-y-5 text-[#191716]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[5px] bg-[#191716] text-white flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight text-[#191716]">Technical Support &amp; Inquiries</h3>
                  <p className="text-[10px] font-delight text-[#78716A]">LeadPulse Engineering Relay</p>
                </div>
              </div>
              <button onClick={() => setIsContactOpen(false)} className="text-[#78716A] hover:text-[#191716] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-[5px] border border-emerald-200 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#191716]">Dispatch Successful</h4>
                <p className="text-xs text-[#57524B]">Telemetry ticket opened. Our team will follow up via your email address.</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setContactSubmitted(true);
                setTimeout(() => {
                  setContactSubmitted(false);
                  setIsContactOpen(false);
                }, 2000);
              }} className="space-y-3">
                <div>
                  <label className="block text-[10.5px] font-delight font-bold text-[#57524B] mb-1 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Alex Rivera"
                    className="w-full h-8.5 px-2.5 border border-[#D6CFC2] rounded-[5px] text-xs font-delight outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-delight font-bold text-[#57524B] mb-1 uppercase tracking-wider">Work Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="alex@company.com"
                    className="w-full h-8.5 px-2.5 border border-[#D6CFC2] rounded-[5px] text-xs font-delight outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-delight font-bold text-[#57524B] mb-1 uppercase tracking-wider">Message</label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="Describe your inquiry..."
                    className="w-full p-2.5 border border-[#D6CFC2] rounded-[5px] text-xs font-delight outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32]"
                  />
                </div>
                <button type="submit" className="w-full h-9 bg-[#C85A32] text-white rounded-[5px] font-delight font-bold text-xs hover:bg-[#B04B25] transition-colors border border-[#B04B25] shadow-xs cursor-pointer">
                  Submit Support Ticket
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-[#E5E0D5] flex items-center justify-between text-[11px] font-delight text-[#78716A]">
              <span>support@leadpulse.io</span>
              <span>SLA: &lt; 2 hrs</span>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Landing;
