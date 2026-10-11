import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  BookOpen, Search, Filter, Send, MessageCircle, Settings, Shield, 
  ChevronRight, ChevronDown, Check, Copy, ExternalLink, AlertCircle, 
  Sparkles, Users, Webhook, Zap, CreditCard, ArrowRight, Lock, 
  HelpCircle, CheckCircle2, Layers, Globe, FileText, Terminal, 
  Sliders, RefreshCw, X, ArrowUpRight, Mail
} from 'lucide-react';
import { useStore } from '../store/useStore';

interface DocStep {
  step: string;
  title: string;
  desc: string;
  details?: string[];
  code?: string;
  note?: string;
}

interface DocModule {
  id: string;
  section: string;
  title: string;
  category: string;
  badge: string;
  icon: any;
  overview: string;
  steps: DocStep[];
  troubleshooting?: string[];
}

interface FAQItem {
  question: string;
  category: string;
  answer: string;
  steps?: string[];
}

const MODULES: DocModule[] = [
  {
    id: 'lead-finder',
    section: 'MODULE 01',
    category: 'Lead Scraping & Discovery',
    badge: 'Core Engine',
    title: 'Commercial Lead Scraping & Spatial Harvesting',
    icon: Search,
    overview: 'The Lead Finder query system queries live spatial and business registries to surface validated business entities, commercial contacts, websites, ratings, and physical locations.',
    steps: [
      {
        step: 'Step 1',
        title: 'Navigate to Lead Finder & Formulate High-Intent Queries',
        desc: 'Open Lead Finder from the left sidebar navigation. Construct targeted search syntax specifying the exact industry niche and municipal geography.',
        details: [
          'High-yield query format: [Industry Keyword] in [City, State / Region] (e.g. "HVAC Contractors in Austin, TX" or "Boutique Law Firms in Chicago, IL").',
          'Avoid overly generic single-word queries like "companies" or "restaurants" to ensure commercial viability and decision-maker contact density.'
        ],
        code: 'Format: {Industry/Niche} in {City, State/Country}\nExample: Commercial Roofing Contractors in Phoenix, AZ'
      },
      {
        step: 'Step 2',
        title: 'Execute Spatial Query & Review Live Registry Feeds',
        desc: 'Click "Execute Search" to initialize spatial harvesting. LeadPulse queries live Google Maps and public business registries.',
        details: [
          'Real-time verification evaluates business status (Open / Operating), physical address, phone numbers, domain URLs, and verified customer review counts.',
          'Review the live table results showing phone numbers, websites, Star Ratings, and total customer review counts.'
        ]
      },
      {
        step: 'Step 3',
        title: 'Evaluate Prospect Fit & Handle Long Commercial Titles',
        desc: 'Inspect the fetched contact details. Names often fetched by business registries (such as multi-service descriptive agency titles) automatically wrap cleanly to preserve full readability.',
        details: [
          'Click the edit pencil icon next to any business name or contact to customize or shorten their display name prior to adding them to your CRM.',
          'Verify that the company URL and contact numbers match your target client profile.'
        ]
      },
      {
        step: 'Step 4',
        title: 'Save Prospect to CRM Pipeline (Credit Metering)',
        desc: 'Click "Add to Pipeline" on individual prospect rows, or select multiple prospects and click "Save Selected Leads".',
        details: [
          'Each prospect saved into your CRM consumes exactly 1 Lead Credit.',
          'Free-tier accounts receive 50 Lead Credits that automatically refresh on a 4-day rolling cycle.',
          'Saved prospects transition immediately into the "New" stage in your CRM Kanban board.'
        ],
        note: 'Saved leads are immediately preserved in your workspace database and are never duplicated.'
      },
      {
        step: 'Step 5',
        title: 'Export Curated Prospect Lists to CSV or Excel',
        desc: 'Export your scraped prospects for external analysis, team distribution, or cold calling spreadsheets.',
        details: [
          'Click "Export CSV" or "Export Excel" in the top action toolbar.',
          'Files include Name, Phone Number, Website, Address, Star Rating, Reviews, and Date Discovered.'
        ]
      }
    ],
    troubleshooting: [
      'If a query returns fewer leads than expected, widen your geographic radius (e.g., search the metro county instead of a single neighborhood).',
      'If credit balance is zero, wait for your 4-day free refresh or click "Upgrade / Top-Up" to get instant credits.'
    ]
  },
  {
    id: 'crm-pipeline',
    section: 'MODULE 02',
    category: 'CRM & Pipeline',
    badge: 'Deal Management',
    title: 'Visual CRM Kanban Pipeline & Lifecycle Tracking',
    icon: Filter,
    overview: 'The CRM Pipeline organizes your qualified prospects across 4 operational lifecycle stages to systematically move prospects from initial discovery to closed revenue.',
    steps: [
      {
        step: 'Step 1',
        title: 'Access the Kanban Workspace',
        desc: 'Click "CRM Pipeline" in the sidebar navigation. Your saved prospects are organized into visual columns.',
        details: [
          'New: Freshly harvested prospects awaiting initial review or outreach assignment.',
          'Contacted: Prospects who have received an email sequence or WhatsApp message.',
          'Replied: High-intent prospects who answered your outbound communication with commercial interest.',
          'Converted: Won accounts, signed agreements, or active paying clients.'
        ]
      },
      {
        step: 'Step 2',
        title: 'Drag-and-Drop Stage Transitions with Instant Cloud Sync',
        desc: 'Click and hold any lead card, then drag it across columns as deals progress.',
        details: [
          'Moving a card from "New" to "Contacted" or "Replied" triggers real-time updates to your database with zero delay.',
          'Stage progression automatically updates your top-level conversion analytics and funnel metrics.'
        ]
      },
      {
        step: 'Step 3',
        title: 'In-Line Contact Editing & Notes',
        desc: 'Click the edit icon on any card to update contact details, phone numbers, decision-maker names, or custom notes.',
        details: [
          'All text fields allow multi-line text wrapping for long names and descriptions.',
          'Notes are auto-saved and visible to all authorized team members in your workspace.'
        ]
      },
      {
        step: 'Step 4',
        title: 'Switching Between Kanban Board & Data-Dense Table View',
        desc: 'Toggle between the visual Kanban card layout and the structured Table view using the view selector in the top-right toolbar.',
        details: [
          'Table view provides high data density, column sorting, search filtering, and bulk status updates.',
          'Filter by stage, phone availability, or website presence.'
        ]
      }
    ],
    troubleshooting: [
      'If a card does not stay in its dragged column, check your internet connectivity to ensure Firestore sync completes.',
      'Deleting a card permanently removes it from your CRM pipeline, but preserves your overall credit quota.'
    ]
  },
  {
    id: 'outreach-email',
    section: 'MODULE 03',
    category: 'Outreach & Email',
    badge: 'High Deliverability',
    title: 'Executive Outreach Center (Email Campaigns & AI Copilot)',
    icon: Send,
    overview: 'Deploy production-grade, executive-formatted email layouts with personalized AI copy generation, dynamic merge tags, and A/B test variations.',
    steps: [
      {
        step: 'Step 1',
        title: 'Select Target Prospect & Channel in Outreach Center',
        desc: 'Navigate to "Outreach Center" from the sidebar. Choose your recipient from the left prospect selector.',
        details: [
          'Click the "Email Dispatch" tab at the top of the interface.',
          'The prospect email address and company details will be loaded into the active composer.'
        ]
      },
      {
        step: 'Step 2',
        title: 'Choose from 8 Engineered Email Layout Wireframes',
        desc: 'Click "Browse 8 Layouts" to select a structured, enterprise-grade email wireframe.',
        details: [
          'Layout 1: Minimalist Executive Note — High open rate, plain-text appearance with subtle typography.',
          'Layout 2: Two-Column Feature Grid — Showcases services, pricing, and visual deliverables.',
          'Layout 3: Social Proof & Metrics — Highlights client testimonials, ROI numbers, and case studies.',
          'Layout 4: Product Feed & Demo Invite — Highlights software or product catalog items with direct CTA buttons.'
        ]
      },
      {
        step: 'Step 3',
        title: 'Generate Personalized Copy via AI Assistant Copilot',
        desc: 'Click the Sparkle icon to activate the AI Writing Copilot.',
        details: [
          'Enter your objective prompt (e.g., "Pitch local SEO optimization to a dental clinic with focus on Google reviews").',
          'AI generates tailored, professional copy avoiding generic filler, with dynamic tags like {{company_name}}, {{first_name}}, and {{city}} automatically resolved.'
        ]
      },
      {
        step: 'Step 4',
        title: 'Configure A/B Testing Subject Line & Hook Variants',
        desc: 'Toggle "A/B Testing Variants" to draft two competing versions (Variant A and Variant B).',
        details: [
          'Test curiosity-based subjects vs. ROI-based numerical subjects to identify highest open rates.',
          'LeadPulse tracks open and reply rates across both variants automatically in your Analytics dashboard.'
        ]
      },
      {
        step: 'Step 5',
        title: 'Review Live HTML Preview & Send Outbound Message',
        desc: 'Inspect the real-time responsive email rendering in the right pane, then click "Send Outbound Email".',
        details: [
          'Emails are dispatched through your configured SMTP gateway or standard LeadPulse transport.',
          'The prospect stage in your CRM is automatically updated to "Contacted".'
        ]
      }
    ],
    troubleshooting: [
      'If emails fail to send, ensure your SMTP settings in Settings > SMTP Gateway are verified.',
      'Check that recipient email addresses are valid and do not contain special characters.'
    ]
  },
  {
    id: 'outreach-whatsapp',
    section: 'MODULE 04',
    category: 'WhatsApp Engine',
    badge: 'Conversational',
    title: 'Direct WhatsApp Conversational Dispatch Engine',
    icon: MessageCircle,
    overview: 'Engage decision-makers directly with pre-formatted conversational scripts through WhatsApp Web with 1-click dispatch and zero manual address book saving.',
    steps: [
      {
        step: 'Step 1',
        title: 'Switch to the WhatsApp Dispatch Channel',
        desc: 'In the Outreach Center, click the "WhatsApp Business" tab in the top header.',
        details: [
          'The interface transitions to conversational chat mode with instant device preview.',
          'Prospects with valid phone numbers are highlighted in the recipient list.'
        ]
      },
      {
        step: 'Step 2',
        title: 'Select from 10 Field-Tested Conversational Scripts',
        desc: 'Browse the script drawer on the left to select an outreach framework matching your commercial proposal.',
        details: [
          'Script 1: Executive Direct Introduction — Quick intro referencing mutual business context.',
          'Script 2: Website / Speed Audit Finding — Friendly notification pointing out an optimization opportunity.',
          'Script 3: Local Competitor Comparison — Brief observation on market ranking in their city.',
          'Script 4: Special Commercial Promotion / Partnership — High-value, low-friction discovery offer.'
        ]
      },
      {
        step: 'Step 3',
        title: 'Auto-Inject Dynamic Contact & Business Variables',
        desc: 'LeadPulse dynamically injects variables such as the business name, city, phone number, and owner name into the message text.',
        details: [
          'You can freely edit or personalize the drafted text in the message editor before sending.'
        ]
      },
      {
        step: 'Step 4',
        title: '1-Click Dispatch via WhatsApp Web',
        desc: 'Click "Open in WhatsApp Web" button.',
        details: [
          'LeadPulse launches the official WhatsApp Web API link formatted with the international phone code and URL-encoded message.',
          'Your WhatsApp Web opens with the chat pre-filled and ready to send. No need to save the prospect to your phonebook!'
        ],
        note: 'Requires you to be logged into web.whatsapp.com in your default browser.'
      }
    ],
    troubleshooting: [
      'Ensure the prospect phone number includes their country code (e.g., +1 for USA, +91 for India).',
      'If WhatsApp Web does not open, disable browser pop-up blockers for the domain.'
    ]
  },
  {
    id: 'smtp-setup',
    section: 'MODULE 05',
    category: 'SMTP & Deliverability',
    badge: 'Infrastructure',
    title: 'Custom SMTP Gateway & Domain Deliverability Setup',
    icon: Settings,
    overview: 'Connect your verified business domain or email provider so all outbound outreach is delivered directly from your own email address with verified DKIM and SPF authentication.',
    steps: [
      {
        step: 'Step 1',
        title: 'Navigate to Settings & Open SMTP Gateway',
        desc: 'Click "Settings" in the sidebar navigation, then switch to the "SMTP Gateway" tab.',
        details: [
          'Select your email transport provider from the dropdown: Gmail / Google Workspace, Resend, SendGrid, Postmark, AWS SES, or Custom SMTP.'
        ]
      },
      {
        step: 'Step 2',
        title: 'Setting up Google Workspace / Gmail with App Passwords',
        desc: 'Follow these exact steps to connect Gmail without exposing your primary account password:',
        details: [
          '1. Go to your Google Account > Security > 2-Step Verification.',
          '2. Scroll to the bottom and select "App passwords".',
          '3. Create an app password named "LeadPulse". Google will generate a 16-character code.',
          '4. In LeadPulse, enter your Gmail address and paste the 16-character code as your SMTP Password.',
          '5. Host: smtp.gmail.com, Port: 587 (TLS).'
        ],
        code: 'Host: smtp.gmail.com\nPort: 587\nUsername: your_email@domain.com\nPassword: [16-character App Password]\nEncryption: TLS'
      },
      {
        step: 'Step 3',
        title: 'Setting up Professional Relays (Resend / SendGrid / Postmark)',
        desc: 'Connect dedicated transactional email services for high-volume sending:',
        details: [
          'Resend: Host: smtp.resend.com, Port: 465, Username: resend, Password: [Your Resend API Key].',
          'SendGrid: Host: smtp.sendgrid.net, Port: 587, Username: apikey, Password: [Your SG API Key].',
          'Postmark: Host: smtp.postmarkapp.com, Port: 587, Username: [Server Token], Password: [Server Token].'
        ]
      },
      {
        step: 'Step 4',
        title: 'Verify DNS Records for Maximum Inbox Deliverability',
        desc: 'Ensure your custom sending domain has proper DNS records configured at your domain registrar (GoDaddy, Cloudflare, Namecheap):',
        details: [
          'SPF: v=spf1 include:_spf.google.com ~all (or your relay provider SPF).',
          'DKIM: Publish the TXT record provided by your mail provider.',
          'DMARC: Add TXT record for _dmarc.yourdomain.com with value "v=DMARC1; p=none; sp=none;".'
        ]
      },
      {
        step: 'Step 5',
        title: 'Test Connection Handshake & Save Credentials',
        desc: 'Click "Send Test Email" to verify handshake. If successful, click "Save Gateway Configuration".',
        details: [
          'All future outbound emails will now be signed with your domain credentials and replies will route directly to your inbox.'
        ]
      }
    ],
    troubleshooting: [
      'If you receive "535 Authentication Failed" with Gmail, ensure 2-Factor Authentication is ON and you are using an App Password (not your normal login password).',
      'Port 587 uses STARTTLS. Port 465 uses SSL/TLS.'
    ]
  },
  {
    id: 'team-management',
    section: 'MODULE 06',
    category: 'Team & Universal Tokens',
    badge: 'Collaboration',
    title: 'Team Management, Role RBAC & Universal Tokens Quotas',
    icon: Users,
    overview: 'Manage team seats, configure role-based access control (Admin, Sales Lead, Account Executive, Marketing Analyst, Viewer), and manage shared Universal Tokens pools according to your subscription tier.',
    steps: [
      {
        step: 'Step 1',
        title: 'Review Your Workspace Tier Seat Rules',
        desc: 'Understand how seats are allocated based on your subscription tier:',
        details: [
          'Free Tier: Fixed allowance of exactly 2 workspace seats.',
          'Basic Tier: Unlocks 50% of the seats selected during registration (e.g., 6 registered seats = 3 active workspace seats) with 500 shared Universal Tokens.',
          'Pro Tier: Unlocks 100% of the seats selected during registration (e.g., 10 registered seats = 10 active workspace seats) with 2,500 shared Universal Tokens.'
        ]
      },
      {
        step: 'Step 2',
        title: 'Add a New Team Member',
        desc: 'Click the "Add Team Member" button in the top right of the Team page or "+ Add Member" in the table header.',
        details: [
          'Enter their Full Name and Work Email Address.',
          'Select their Assigned Role (Admin, Sales Lead / SDR, Account Executive, Marketing Analyst, Workspace Viewer).',
          'Set their Monthly Universal Token Quota using preset chips (100, 250, 500, 1000 tokens).',
          'Choose Member Activation Status: "Active Now" (direct immediate workspace access) or "Invite Pending" (sends an invitation link).'
        ]
      },
      {
        step: 'Step 3',
        title: 'Manage Roles & Token Allowances (RBAC)',
        desc: 'To change an existing team member\'s permissions, click the "Manage Role" button on their row.',
        details: [
          'Select a new role from the dropdown. Role descriptions and capability summaries display in real time.',
          'Adjust their monthly Universal Token quota limit from the shared pool.',
          'Click "Save Role Changes". Permissions take effect immediately.'
        ]
      },
      {
        step: 'Step 4',
        title: 'Remove Team Member (Preserving Pipeline Deals)',
        desc: 'To remove a team member who has left the organization or changed teams:',
        details: [
          'Click the red Trash icon on their table row.',
          'A confirmation modal will appear reassuring you that their assigned CRM leads and deals will remain preserved in your workspace pipeline for reassignment.',
          'Click "Confirm Removal". Their workspace seat is immediately freed up for another team member.'
        ],
        note: 'The primary Workspace Owner is protected from removal and cannot be deleted.'
      },
      {
        step: 'Step 5',
        title: 'Handling Seat Limits & Upgrades',
        desc: 'If you reach your maximum seat quota, clicking "Add Team Member" opens the Seat Limit & Upgrade modal.',
        details: [
          'Click "Upgrade Plan" to upgrade from Free to Basic (50% capacity) or Pro (100% capacity).',
          'Alternatively, click "Seats & Tier Rules" to adjust your registered seats baseline via the settings drawer.'
        ]
      }
    ],
    troubleshooting: [
      'If you see "SEAT_LIMIT_REACHED (403)", you must either upgrade your subscription tier or remove an inactive team member to free up a seat.',
      'Workspace Owner privileges can only be transferred by contacting platform support.'
    ]
  },
  {
    id: 'integrations',
    section: 'MODULE 07',
    category: 'Integrations & API',
    badge: '40+ Apps',
    title: 'Connecting 40+ Integrations & Enterprise Webhooks',
    icon: Webhook,
    overview: 'Sync your harvested leads, pipeline stages, and contact updates with Airtable, HubSpot, Salesforce, Google Sheets, Slack, Notion, Stripe, and 35+ enterprise services.',
    steps: [
      {
        step: 'Step 1',
        title: 'Navigate to the Integrations Hub',
        desc: 'Click "Integrations" in the sidebar navigation. Browse cards organized by Category (CRM, Productivity, Communication, Data & Analytics, AI).',
        details: [
          'Use the category filter tabs or search input to quickly find any specific app (e.g. HubSpot, Google Sheets, Slack, Notion).'
        ]
      },
      {
        step: 'Step 2',
        title: 'Connect via 1-Click OAuth 2.0 (Recommended)',
        desc: 'Click "Connect" on any integration card.',
        details: [
          'The connection modal displays a 3-step setup guide and visual OAuth authorization card.',
          'Click the blue "1-Click Connect with [App]" button. LeadPulse handles the OAuth token handshake and marks the integration as Active Sync.'
        ]
      },
      {
        step: 'Step 3',
        title: 'Connect via Direct API Key / Secret Token (Alternative)',
        desc: 'If your organization prefers direct API access or self-hosted instances:',
        details: [
          'Scroll to the "Direct API Credentials & Webhooks" section below the OAuth button.',
          'Enter your API Key, Access Token, or Webhook URL, then click "Save API Credentials".'
        ]
      },
      {
        step: 'Step 4',
        title: 'Verify Active Sync & Status Beacons',
        desc: 'Once connected, the integration card displays a glowing green "Active Sync" beacon and an "Auto-Syncing" pill.',
        details: [
          'New prospects added to your CRM will be automatically mirrored to your destination application.'
        ]
      }
    ],
    troubleshooting: [
      'If OAuth handshake fails, ensure third-party cookies are enabled in your browser during the OAuth redirect.',
      'API tokens should have write permissions on your target CRM or spreadsheet to allow LeadPulse to create rows.'
    ]
  },
  {
    id: 'billing-credits',
    section: 'MODULE 08',
    category: 'Billing & Upgrades',
    badge: 'Token Pool',
    title: 'Universal Tokens, Rolling Quotas & Tier Upgrades',
    icon: CreditCard,
    overview: 'Understand your lead credits, Universal Tokens pool, automatic refresh cycles, and how to top up via the integrated PhonePe payment gateway.',
    steps: [
      {
        step: 'Step 1',
        title: 'Understanding Lead Credits vs Universal Tokens',
        desc: 'LeadPulse uses a dual-credit architecture for clarity and flexibility:',
        details: [
          'Lead Credits: Consumed when scraping and adding new commercial leads to your CRM (1 credit = 1 lead).',
          'Universal Tokens: A shared pool consumed by multi-channel actions, AI personalization copy generation, contact enrichment, and sequence automations.'
        ]
      },
      {
        step: 'Step 2',
        title: 'Free-Tier Automatic Refresh Schedule',
        desc: 'Free accounts receive 50 Lead Credits every 4 days.',
        details: [
          'The 4-day timer starts from the moment your credits replenish.',
          'You can view your remaining days and current quota in the top dashboard metric card.'
        ]
      },
      {
        step: 'Step 3',
        title: 'Upgrading Your Subscription Plan (Basic & Pro)',
        desc: 'To upgrade your plan for unlimited leads, continuous daily quotas, and full team seats:',
        details: [
          'Click "Upgrade Plan" in the sidebar or top header.',
          'Select LeadPulse Basic (₹699/mo) for 600 saved leads, 50% registered seats, and 500 universal tokens.',
          'Select LeadPulse Pro (₹1,999/mo) for unlimited saved leads, 100% registered seats, and 2,500 universal tokens.',
          'Complete checkout securely via the integrated PhonePe gateway.'
        ]
      },
      {
        step: 'Step 4',
        title: 'Instant Micro & Mega Credit Top-Ups',
        desc: 'Need extra tokens without upgrading your monthly plan?',
        details: [
          'Switch to the "Top-Up Credits" tab in the upgrade modal.',
          'Micro Pack: 100 Instant Universal Tokens for ₹199.',
          'Mega Pack: 500 Instant Universal Tokens for ₹799.',
          'Tokens are credited immediately upon payment confirmation.'
        ]
      }
    ],
    troubleshooting: [
      'If payment completes but credits do not update immediately, refresh your browser or check the billing receipt in Settings.',
      'All transactions are processed through RBI-authorized payment rails.'
    ]
  }
];

const FAQS: FAQItem[] = [
  {
    question: 'How do Free Tier lead credits refresh?',
    category: 'Billing & Upgrades',
    answer: 'Free accounts receive 50 Lead Credits automatically every 4 days on a rolling cycle. You do not need to take any action; the system checks your last refresh timestamp and restores your balance to 50 credits automatically.'
  },
  {
    question: 'Why did my lead query return 0 or fewer results than expected?',
    category: 'Lead Scraping & Discovery',
    answer: 'Business registries require a clear municipal location. If you search "Plumbers", the registry does not know where to look. Always provide both the industry and the city, like "Plumbing Contractors in Dallas, TX". Also ensure you are not searching too narrow a geographic boundary (like a specific street address).'
  },
  {
    question: 'What is the difference between Basic (50%) and Pro (100%) seats?',
    category: 'Team & Universal Tokens',
    answer: 'When you sign up, you specify your organization\'s team size baseline (e.g. 6 seats). On the Basic Tier, you can add up to 50% of those registered seats (3 seats). On the Pro Tier, you unlock 100% of those registered seats (6 seats), with all members sharing your universal token pool.'
  },
  {
    question: 'Can my team members use the shared Universal Tokens pool?',
    category: 'Team & Universal Tokens',
    answer: 'Yes! Both Basic and Pro tiers provide a shared workspace token pool. As the Workspace Owner or Admin, you can allocate monthly quotas per member (e.g. 250 tokens/mo) to keep resource consumption organized across your sales team.'
  },
  {
    question: 'Can I remove a team member without losing their deals and leads?',
    category: 'Team & Universal Tokens',
    answer: 'Absolutely. When you remove a team member, their workspace access is revoked and their seat is immediately freed up. However, all leads and pipeline deals they created or were assigned to remain safely intact in your CRM pipeline for reassignment to another team member.'
  },
  {
    question: 'Why can\'t I remove the Workspace Owner?',
    category: 'Team & Universal Tokens',
    answer: 'The primary Workspace Owner is the root administrator account that created the workspace and holds the billing subscription. To prevent accidental workspace lockout or orphaned accounts, the platform strictly forbids deleting the Workspace Owner.'
  },
  {
    question: 'How does the 1-Click WhatsApp dispatch work without saving contacts?',
    category: 'WhatsApp Engine',
    answer: 'LeadPulse uses the official WhatsApp Web API protocol (https://web.whatsapp.com/send?phone=...&text=...). When you click "Open in WhatsApp Web", your browser passes the phone number and pre-filled message directly to WhatsApp Web. WhatsApp Web handles the direct chat without needing to save them in your phonebook contacts.'
  },
  {
    question: 'How do I connect my Gmail account to the SMTP Gateway?',
    category: 'SMTP & Deliverability',
    answer: 'Google requires an "App Password" rather than your normal password. Enable 2-Step Verification on your Google Account, navigate to "App Passwords", generate a 16-character code for LeadPulse, and paste that code into Settings > SMTP Gateway with Host smtp.gmail.com and Port 587.'
  },
  {
    question: 'Are my API keys and SMTP credentials secure?',
    category: 'Integrations & API',
    answer: 'Yes. All SMTP passwords, API keys, and webhook secrets are encrypted at rest using AES-256 before storage in Google Cloud Firestore. They are never exposed to client-side browsers or logged in plain text.'
  },
  {
    question: 'How do I export my CRM leads to CSV or Excel?',
    category: 'CRM & Pipeline',
    answer: 'Navigate to the CRM Pipeline page. In the top right header, click "Export CSV" or "Export Excel". A formatted spreadsheet containing all prospect names, phones, emails, stages, websites, and discovery dates will be downloaded instantly.'
  },
  {
    question: 'What happens if I exceed my workspace seat limit?',
    category: 'Team & Universal Tokens',
    answer: 'When you reach your maximum seat quota, the system will block further member additions with a 403 SEAT_LIMIT_REACHED error and display an Upgrade Modal. You can upgrade to a higher tier (Basic for 50%, Pro for 100%) or remove an inactive team member to free up a seat.'
  },
  {
    question: 'Can I edit the name of a business if it is too long?',
    category: 'Lead Scraping & Discovery',
    answer: 'Yes! Some Google business names are descriptive (e.g. "Digital Keddy Internet Marketing Services in Delhi | Social Media Agency | PPC Agency"). The LeadPulse interface wraps these long names across lines cleanly and provides an inline edit button so you can rename the contact to something concise before saving.'
  }
];

const CATEGORIES = [
  'All Docs',
  'Lead Scraping & Discovery',
  'CRM & Pipeline',
  'Outreach & Email',
  'WhatsApp Engine',
  'SMTP & Deliverability',
  'Team & Universal Tokens',
  'Integrations & API',
  'Billing & Upgrades',
  'FAQs & Troubleshooting'
];

const HelpCenter = () => {
  const { user, setUpgradeModalOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Docs');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(id);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Filtered Modules
  const filteredModules = useMemo(() => {
    return MODULES.filter(module => {
      const matchesCategory = selectedCategory === 'All Docs' || module.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = module.title.toLowerCase().includes(q);
      const inOverview = module.overview.toLowerCase().includes(q);
      const inSteps = module.steps.some(s => 
        s.title.toLowerCase().includes(q) || 
        s.desc.toLowerCase().includes(q) || 
        s.details?.some(d => d.toLowerCase().includes(q))
      );
      const inTrouble = module.troubleshooting?.some(t => t.toLowerCase().includes(q));

      return inTitle || inOverview || inSteps || inTrouble;
    });
  }, [searchQuery, selectedCategory]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQS.filter(faq => {
      const matchesCategory = selectedCategory === 'All Docs' || selectedCategory === 'FAQs & Troubleshooting' || faq.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          {/* Strictly Left-Aligned Container */}
          <div className="w-full max-w-5xl space-y-8 pb-24 text-left flex flex-col items-start">

            {/* Header & Title Banner */}
            <div className="w-full space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-sm text-[11px] font-delight text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-slate-800" />
                <span>OFFICIAL SYSTEM MANUAL & DOCUMENTATION</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight text-left">
                LeadPulse Operator Manual & Knowledgebase
              </h1>
              
              <p className="text-slate-500 font-sans text-xs sm:text-sm max-w-3xl leading-relaxed text-left">
                Step-by-step technical guides, operational procedures, multi-channel configurations, team administration rules, and answers to frequently asked questions.
              </p>
            </div>

            {/* Search Bar in Help */}
            <div className="w-full space-y-3 text-left">
              <div className="relative w-full max-w-2xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in help, guides, steps, error codes, FAQs, or integrations..."
                  className="w-full h-10 pl-10 pr-24 bg-white border border-slate-200 rounded-md text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors shadow-2xs text-left"
                />
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-delight text-slate-400 border border-slate-200 bg-slate-50 px-1.5 py-0.5 rounded-sm">
                    Search Docs
                  </div>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-left">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-delight transition-colors cursor-pointer text-left ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white font-semibold border border-slate-900 shadow-xs' 
                        : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Match Counter if searching */}
            {searchQuery && (
              <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-delight text-slate-600 flex items-center justify-between text-left">
                <span>
                  Showing results for "<strong className="text-slate-900">{searchQuery}</strong>": {filteredModules.length} Modules, {filteredFaqs.length} FAQs
                </span>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Quick Summary Cards (Left-Aligned) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 bg-white border border-slate-200 rounded-md space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold font-delight text-xs text-slate-900">Lead Harvesting</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed text-left">
                  Query Google Maps & business registries. Free tier refreshes with 50 credits every 4 days.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-md space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold font-delight text-xs text-slate-900">Email & WhatsApp</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed text-left">
                  8 responsive email wireframes, AI Copilot copy generator, and 1-click WhatsApp web dispatch.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-md space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold font-delight text-xs text-slate-900">Team & Universal Tokens</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed text-left">
                  Free: 2 seats. Basic: 50% registered seats. Pro: 100% registered seats with universal tokens.
                </p>
              </div>
            </div>

            {/* ================= SECTION: DETAILED DOCUMENTATION MODULES ================= */}
            <div className="w-full space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-left">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight text-left">
                    Detailed Step-by-Step Operator Modules
                  </h2>
                  <p className="text-slate-500 font-sans text-xs text-left">
                    Follow these verified procedures to execute daily commercial operations.
                  </p>
                </div>
                <span className="text-xs font-delight font-medium text-slate-400">
                  {filteredModules.length} Modules Available
                </span>
              </div>

              {filteredModules.length === 0 && (
                <div className="p-6 bg-white border border-slate-200 rounded-md text-center py-10 space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-delight font-medium text-slate-600">No documentation modules match your search criteria.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All Docs'); }}
                    className="text-xs font-delight font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset filters and show all modules
                  </button>
                </div>
              )}

              {filteredModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <div 
                    key={module.id} 
                    id={module.id}
                    className="bg-white border border-slate-200 rounded-md overflow-hidden text-left"
                  >
                    {/* Module Title Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 text-left">
                      <div className="flex items-start gap-3 text-left">
                        <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                          <IconComponent className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-delight text-slate-500 uppercase tracking-wider font-semibold">
                              {module.section} • {module.category}
                            </span>
                            <span className="text-[10px] font-delight bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-xs">
                              {module.badge}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 tracking-tight text-left">
                            {module.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Overview */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 text-left">
                      <p className="text-xs text-slate-600 font-sans leading-relaxed text-left">
                        {module.overview}
                      </p>
                    </div>

                    {/* Detailed Steps List */}
                    <div className="p-4 sm:p-5 space-y-5 text-left">
                      <h4 className="text-xs font-delight uppercase tracking-wider font-semibold text-slate-500 text-left">
                        Step-by-Step Execution Guide:
                      </h4>

                      <div className="space-y-4 text-left">
                        {module.steps.map((st, sIdx) => (
                          <div 
                            key={sIdx} 
                            className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-md text-left space-y-2 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-start gap-2.5 text-left">
                              <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-slate-900 text-white font-delight text-[10px] font-bold rounded-xs shrink-0 mt-0.5">
                                {st.step}
                              </span>
                              <div className="text-left">
                                <h5 className="font-bold text-xs font-display text-slate-900 text-left">
                                  {st.title}
                                </h5>
                                <p className="text-xs text-slate-600 font-sans mt-0.5 leading-relaxed text-left">
                                  {st.desc}
                                </p>
                              </div>
                            </div>

                            {/* Bullet details */}
                            {st.details && st.details.length > 0 && (
                              <ul className="pl-8 space-y-1 font-sans text-xs text-slate-600 list-disc text-left">
                                {st.details.map((dt, dIdx) => (
                                  <li key={dIdx} className="leading-relaxed text-left">
                                    {dt}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Code or config snippet */}
                            {st.code && (
                              <div className="ml-8 mt-2 relative">
                                <pre className="p-2.5 bg-slate-950 text-slate-100 rounded-sm font-delight font-normal text-[11px] overflow-x-auto text-left">
                                  {st.code}
                                </pre>
                                <button
                                  onClick={() => handleCopyCode(st.code!, `${module.id}-${sIdx}`)}
                                  className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-delight font-medium rounded-xs flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedCodeIndex === `${module.id}-${sIdx}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Note */}
                            {st.note && (
                              <div className="ml-8 mt-1 p-2 bg-amber-50 border border-amber-200 rounded-sm text-[11px] font-sans text-amber-900 flex items-start gap-1.5 text-left">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                <span>{st.note}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Troubleshooting callout */}
                      {module.troubleshooting && module.troubleshooting.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50/60 border border-blue-200 rounded-md text-left space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-delight font-bold text-blue-900 text-left">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                            <span>Pro Tips & Troubleshooting for {module.title}</span>
                          </div>
                          <ul className="pl-5 space-y-1 font-sans text-xs text-blue-900/80 list-disc text-left">
                            {module.troubleshooting.map((tr, tIdx) => (
                              <li key={tIdx} className="leading-relaxed text-left">{tr}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= SECTION: FREQUENTLY ASKED QUESTIONS (FAQS) ================= */}
            <div className="w-full space-y-4 text-left pt-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-left">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight text-left">
                    Frequently Asked Questions (FAQs)
                  </h2>
                  <p className="text-slate-500 font-sans text-xs text-left">
                    Direct answers to common operational questions, account policies, and technical edge cases.
                  </p>
                </div>
                <span className="text-xs font-delight font-medium text-slate-400">
                  {filteredFaqs.length} Answers
                </span>
              </div>

              {filteredFaqs.length === 0 && (
                <div className="p-4 bg-white border border-slate-200 rounded-md text-xs font-delight font-medium text-slate-600 text-left">
                  No FAQs match your search query. Try another keyword or browse all modules above.
                </div>
              )}

              <div className="space-y-2.5 text-left w-full">
                {filteredFaqs.map((faq, fIdx) => {
                  const isExpanded = expandedFaq === fIdx;
                  return (
                    <div 
                      key={fIdx}
                      className="bg-white border border-slate-200 rounded-md overflow-hidden text-left transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : fIdx)}
                        className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 text-left">
                          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div className="text-left">
                            <span className="text-xs sm:text-sm font-bold font-display text-slate-900 text-left">
                              {faq.question}
                            </span>
                            <span className="block text-[10px] font-delight text-slate-500 mt-0.5 text-left">
                              Category: {faq.category}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-3.5 sm:p-4 pt-1 bg-slate-50 border-t border-slate-100 text-left text-xs font-sans text-slate-700 leading-relaxed space-y-2">
                          <p className="text-left">{faq.answer}</p>
                          {faq.steps && (
                            <ol className="list-decimal pl-5 space-y-1 font-delight font-normal text-[11px] text-slate-800 text-left">
                              {faq.steps.map((st, sIdx) => (
                                <li key={sIdx} className="text-left">{st}</li>
                              ))}
                            </ol>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Security & Contact Reassurance Footer */}
            <div className="w-full p-4 bg-slate-900 text-white rounded-md border border-slate-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-left">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold font-display text-xs sm:text-sm tracking-tight text-white text-left">
                  Enterprise Security & Isolated Control Plane
                </h3>
              </div>
              <p className="text-[11px] font-sans text-slate-300 leading-relaxed text-left max-w-3xl">
                LeadPulse operates on zero-trust role verification. All outbound credentials and API tokens are encrypted with AES-256 at rest. Master administrative controls run on an isolated administrative control plane (Port 5174) with cryptographic gateway authorization.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
