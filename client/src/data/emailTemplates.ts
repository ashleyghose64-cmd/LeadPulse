export type TemplateId = 
  | 'text_only' 
  | 'one_column' 
  | 'two_column' 
  | 'hybrid' 
  | 'inverted_pyramid' 
  | 'zig_zag' 
  | 'f_pattern' 
  | 'dynamic_product_feed';

export interface EmailTemplateConfig {
  id: TemplateId;
  name: string;
  tagline: string;
  bestFor: string;
  purpose: string;
  category: 'direct' | 'promotional' | 'newsletter' | 'ecommerce';
  defaultData: {
    subject: string;
    preheader?: string;
    headline: string;
    subheadline?: string;
    body: string;
    ctaText?: string;
    ctaUrl?: string;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    // Two Column & Hybrid
    col1Title?: string;
    col1Body?: string;
    col1Cta?: string;
    col1CtaUrl?: string;
    col2Title?: string;
    col2Body?: string;
    col2Cta?: string;
    col2CtaUrl?: string;
    // Zig Zag
    zig1Title?: string;
    zig1Text?: string;
    zig1Cta?: string;
    zig1CtaUrl?: string;
    zig2Title?: string;
    zig2Text?: string;
    zig2Cta?: string;
    zig2CtaUrl?: string;
    // F-Pattern
    fBullet1?: string;
    fBullet2?: string;
    fBullet3?: string;
    fBottomNote?: string;
    // Dynamic Product Feed
    products?: Array<{
      name: string;
      category?: string;
      price: string;
      badge?: string;
      imageUrl?: string;
      description?: string;
      ctaText?: string;
      ctaUrl?: string;
    }>;
  };
}

export const EMAIL_TEMPLATES: Record<TemplateId, EmailTemplateConfig> = {
  text_only: {
    id: 'text_only',
    name: '1. Text Only Email',
    tagline: 'Personal & Transactional Outreach',
    bestFor: 'High-touch B2B introductions, CEO-to-CEO notes, password resets, account notices',
    purpose: 'Creates a personal, authentic 1-on-1 feel with maximum email deliverability and zero spam filter triggers.',
    category: 'direct',
    defaultData: {
      subject: 'Quick question regarding {{business_name}}',
      preheader: 'Direct Executive Inquiry',
      headline: 'Hi {{first_name}}, quick inquiry regarding {{business_name}}',
      body: `I came across {{business_name}} while reviewing top-rated operators in the {{field_of_work}} sector across {{location}}.

We've been helping businesses in your niche automate local lead generation and customer acquisition without relying on expensive ad spend.

A few quick points that might interest your team:
• Automated discovery of verified local decision-maker contacts
• Zero cold call manual labor through high-deliverability sequences
• Proven 28% higher response rates for {{field_of_work}} specialists

Would you have 5 minutes this Thursday for a quick chat?

Best regards,
{{sender_name}}
{{company_name}}`,
      ctaText: 'Book a 5-Min Intro Call',
      ctaUrl: 'https://calendly.com/leadpulse/demo'
    }
  },

  one_column: {
    id: 'one_column',
    name: '2. One Column Email',
    tagline: 'Linear Mobile-First Announcement',
    bestFor: 'Welcome emails, product launches, single value proposition campaigns',
    purpose: 'Keeps focus on one clear vertical narrative with a single, frictionless path to the primary Call-To-Action.',
    category: 'promotional',
    defaultData: {
      subject: 'Special Partnership Proposal for {{business_name}}',
      preheader: 'Accelerate your pipeline in {{location}}',
      headline: 'Grow {{business_name}} with Automated Local Leads',
      subheadline: 'A custom growth package tailored specifically for {{field_of_work}}',
      body: `Traditional marketing methods in {{location}} are becoming increasingly noisy and expensive.

With LeadPulse, {{business_name}} gains direct access to an autonomous local pipeline engine that scrapes, enriches, and initiates conversations with verified buyers every day.`,
      ctaText: 'Explore Partner Program',
      ctaUrl: 'https://leadpulse.io/partner-program'
    }
  },

  two_column: {
    id: 'two_column',
    name: '3. Two Column Email',
    tagline: 'Balanced Side-by-Side Dual Offer',
    bestFor: 'Comparing two solutions, feature spotlights, dual service highlights',
    purpose: 'Creates visual equilibrium allowing recipients to digest multiple updates and choose their preferred conversion pathway.',
    category: 'promotional',
    defaultData: {
      subject: 'Two growth pathways for {{business_name}} in {{location}}',
      preheader: 'Strategic Option Comparison',
      headline: 'Choose How You Scale in {{field_of_work}}',
      body: `We’ve mapped out two distinct strategies to help {{business_name}} dominate your local market across {{location}}. Review both options below:`,
      col1Title: 'Option A: Inbound Automation',
      col1Body: 'Set up autonomous email and WhatsApp triggers that respond to inquiries in under 60 seconds.',
      col1Cta: 'View Inbound Setup',
      col1CtaUrl: 'https://leadpulse.io/inbound',
      col2Title: 'Option B: Outbound Harvesting',
      col2Body: 'Run headless Google Maps and web crawlers that generate 50-300 fresh leads in your neighborhood every morning.',
      col2Cta: 'View Outbound Setup',
      col2CtaUrl: 'https://leadpulse.io/outbound'
    }
  },

  hybrid: {
    id: 'hybrid',
    name: '4. Hybrid Email',
    tagline: 'Hero Headline + Multi-Block Sections',
    bestFor: 'Monthly partner newsletters, quarterly industry digests, conference invitations',
    purpose: 'Combines a powerful wide header announcement with flexible multi-column secondary stories for high engagement.',
    category: 'newsletter',
    defaultData: {
      subject: '{{location}} B2B Market Digest for {{business_name}}',
      preheader: 'Monthly Partner Brief',
      headline: 'The 2026 {{field_of_work}} Benchmark Report',
      subheadline: 'Key trends affecting local enterprises in {{location}}',
      body: `We surveyed over 500 business owners across {{location}} to uncover how high-performing companies in {{field_of_work}} are acquiring clients this quarter.`,
      ctaText: 'Download Full Benchmark Report',
      ctaUrl: 'https://leadpulse.io/reports',
      col1Title: 'Local Scraper Trends',
      col1Body: 'Why multi-channel outreach is outpacing standalone email marketing by 3.4x.',
      col1Cta: 'Read Article',
      col1CtaUrl: 'https://leadpulse.io/trends',
      col2Title: 'Conversion Playbook',
      col2Body: 'How {{business_name}} can improve reply rates with automated merge tags.',
      col2Cta: 'View Playbook',
      col2CtaUrl: 'https://leadpulse.io/playbook'
    }
  },

  inverted_pyramid: {
    id: 'inverted_pyramid',
    name: '5. Inverted Pyramid Email',
    tagline: 'High-Conversion Funnel to Single CTA',
    bestFor: 'Time-sensitive discounts, flash offers, exclusive webinars, single product launches',
    purpose: 'Guides the eye from a broad visual headline, narrowing down through persuasive copy, straight to a high-contrast CTA.',
    category: 'promotional',
    defaultData: {
      subject: 'Exclusive Invitation for {{business_name}}',
      preheader: 'Exclusive 500-Lead Reserve',
      headline: 'Ready to 10x Client Acquisition for {{business_name}}?',
      subheadline: 'A limited compute allocation has been reserved for your team in {{location}}.',
      body: `We’re offering {{business_name}} 500 complimentary verified leads and zero platform setup fees this month. Claim your dedicated compute node before local slots in {{location}} close.`,
      ctaText: 'Claim Your 500 Leads Now',
      ctaUrl: 'https://leadpulse.io/claim-leads'
    }
  },

  zig_zag: {
    id: 'zig_zag',
    name: '6. Zig Zag Email',
    tagline: 'Alternating "Z" Pattern Storytelling',
    bestFor: 'Feature walkthroughs, weekly case studies, multi-step customer journeys',
    purpose: 'Encourages visual scanning by alternating imagery and text left-to-right, keeping readers curious and engaged.',
    category: 'newsletter',
    defaultData: {
      subject: 'How {{business_name}} can streamline sales in 2 steps',
      preheader: 'Step-by-Step Growth Blueprint',
      headline: 'Modernize Your {{field_of_work}} Sales Engine',
      body: `Take a look at how companies in {{location}} are saving 15+ hours weekly with LeadPulse automation:`,
      zig1Title: '1. Intelligent Geographic Harvesting',
      zig1Text: 'Input your postal code or city and let our headless cluster extract verified phone numbers, ratings, and domains automatically.',
      zig1Cta: 'Explore Harvester →',
      zig1CtaUrl: 'https://leadpulse.io/harvester',
      zig2Title: '2. Dynamic Merge Tag Sequences',
      zig2Text: 'Personalize every email with dynamic tags like {{business_name}} and {{location}} to generate authentic replies.',
      zig2Cta: 'Test Templates →',
      zig2CtaUrl: 'https://leadpulse.io/templates'
    }
  },

  f_pattern: {
    id: 'f_pattern',
    name: '7. F Pattern Email',
    tagline: 'Content-Dense Editorial Scan Layout',
    bestFor: 'Detailed industry newsletters, technical digests, policy updates, SaaS product release notes',
    purpose: 'Structured along natural screen reading behavior (top-line scan + vertical left-side scan) for effortless information absorption.',
    category: 'newsletter',
    defaultData: {
      subject: 'Executive Briefing: Growth in {{field_of_work}} ({{location}})',
      preheader: 'Executive Briefing',
      headline: 'The Executive Briefing for {{business_name}}',
      subheadline: 'Key updates tailored to operators in {{location}}',
      body: `Here are the top three strategic insights for leaders in the {{field_of_work}} category this month:`,
      fBullet1: 'Automated Lead Validation: Why phone validation before outreach cuts bounce rates by 92%.',
      fBullet2: 'Local Geo-Fencing: How micro-targeting specific neighborhoods in {{location}} outperforms broad county campaigns.',
      fBullet3: 'Compliance Evolution: Updated CAN-SPAM and GDPR guidelines for outbound B2B messaging.',
      fBottomNote: 'Summary: Proactive outreach that incorporates local context continues to yield the highest ROI for {{business_name}}.',
      ctaText: 'Access Executive Dashboard',
      ctaUrl: 'https://leadpulse.io/dashboard'
    }
  },

  dynamic_product_feed: {
    id: 'dynamic_product_feed',
    name: '8. Dynamic Product Feed Email',
    tagline: 'Catalog Grid & Dynamic Pricing Matrix',
    bestFor: 'eCommerce recommendations, service tier menus, promotional package offerings',
    purpose: 'Dynamically presents modular service or product cards with real-time pricing and direct ordering action pathways.',
    category: 'ecommerce',
    defaultData: {
      subject: 'Curated Service Solutions for {{business_name}}',
      preheader: 'Dynamic Service Feed',
      headline: 'Specialized Service Menu for {{field_of_work}}',
      subheadline: 'Popular packages designed for businesses in {{location}}',
      body: `Based on your profile as a leading operator in {{location}}, we have prepared three targeted growth packages for {{business_name}}:`,
      products: [
        {
          name: 'Local Maps Accelerator',
          category: 'Lead Discovery',
          price: '₹699 / mo',
          badge: 'Starter',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
          description: 'Extract 300+ geo-targeted leads every month with live ratings & phone contacts.',
          ctaText: 'Select Plan',
          ctaUrl: 'https://leadpulse.io/checkout?plan=starter'
        },
        {
          name: 'Multi-Channel Pro Suite',
          category: 'Email + WhatsApp',
          price: '₹1,999 / mo',
          badge: 'Most Popular',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
          description: 'Autonomous direct-to-inbox dispatch with 10 structured WhatsApp scripts & zero rate limits.',
          ctaText: 'Select Plan',
          ctaUrl: 'https://leadpulse.io/checkout?plan=pro'
        },
        {
          name: 'Dedicated Headless Cluster',
          category: 'High Volume Enterprise',
          price: '₹4,999 / mo',
          badge: 'Enterprise',
          imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
          description: 'Dedicated Chromium crawler nodes with custom webhooks & CRM two-way sync.',
          ctaText: 'Select Plan',
          ctaUrl: 'https://leadpulse.io/checkout?plan=enterprise'
        }
      ],
      ctaText: 'Customize Your Package',
      ctaUrl: 'https://leadpulse.io/pricing'
    }
  }
};
