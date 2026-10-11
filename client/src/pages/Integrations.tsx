import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  Webhook, Search, CheckCircle2, Plus, Settings, ExternalLink, 
  Trash2, X, Check, Copy, Code, Terminal, Zap, Shield, Key, 
  Send, RefreshCw, AlertCircle, Sparkles, Layers, Eye, EyeOff,
  ChevronLeft, Lock, ArrowRight, ShieldCheck, LayoutGrid, List, ArrowUpDown
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { confirmDialog, alertDialog } from '../components/AppConfirmModal';
import axios from 'axios';

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email';
  placeholder: string;
  helperText?: string;
  required?: boolean;
}

interface IntegrationApp {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  logo: string;
  description: string;
  config: Record<string, string>;
  configFields?: ConfigField[];
  lastSync?: string | null;
  badge?: string;
}

const CATEGORIES = [
  'All', 
  'CRM', 
  'AI & LLM', 
  'Communication', 
  'Productivity', 
  'Marketing & Forms', 
  'Finance & Payments', 
  'Data & Warehouses', 
  'Analytics', 
  'Developer'
];

// Complete local icon mapping for all platform integrations
const LOCAL_INTEGRATION_ICONS: Record<string, string> = {
  'airtable': '/integrations/Airtable.png',
  'amplitude': '/integrations/Amplitude.png',
  'anthropic': '/integrations/Anthropic.png',
  'apollo': '/integrations/Apollo.png',
  'asana': '/integrations/Asana.png',
  'attio': '/integrations/Attio.png',
  'box': '/integrations/Box.png',
  'brevo': '/integrations/Brevo.png',
  'calendly': '/integrations/Calendly.png',
  'clickhouse': '/integrations/ClickHouse.png',
  'databricks': '/integrations/Databricks.png',
  'elevenlabs': '/integrations/ElevenLabs.png',
  'facebook pages': '/integrations/Facebook%20Pages.png',
  'facebook': '/integrations/Facebook%20Pages.png',
  'firecrawl': '/integrations/Firecrawl.png',
  'gemini (google)': '/integrations/Gemini%20(Google).png',
  'google gemini': '/integrations/Gemini%20(Google).png',
  'gemini': '/integrations/Gemini%20(Google).png',
  'github': '/integrations/GitHub.png',
  'google analytics': '/integrations/Google%20Analytics.png',
  'google calendar': '/integrations/Google%20Calendar.png',
  'google drive': '/integrations/Google%20Drive.png',
  'google forms': '/integrations/Google%20Forms.png',
  'google maps': '/integrations/Google%20Maps.png',
  'google sheets': '/integrations/Google%20Sheets.png',
  'hubspot': '/integrations/HubSpot.png',
  'jira': '/integrations/Jira.png',
  'linear': '/integrations/Linear.png',
  'linkedin': '/integrations/LinkedIn.png',
  'mailchimp': '/integrations/Mailchimp.png',
  'microsoft excel': '/integrations/Microsoft%20Excel.png',
  'excel': '/integrations/Microsoft%20Excel.png',
  'microsoft outlook': '/integrations/Microsoft%20Outlook.png',
  'outlook': '/integrations/Microsoft%20Outlook.png',
  'microsoft teams': '/integrations/Microsoft%20Teams.png',
  'teams': '/integrations/Microsoft%20Teams.png',
  'monday.com': '/integrations/monday.com.png',
  'monday': '/integrations/monday.com.png',
  'netsuite': '/integrations/NetSuite.png',
  'notion': '/integrations/Notion.png',
  'okta (sso)': '/integrations/Okta%20(SSO).png',
  'okta': '/integrations/Okta%20(SSO).png',
  'onedrive': '/integrations/OneDrive.png',
  'openai': '/integrations/OpenAI.png',
  'quickbooks': '/integrations/QuickBooks.png',
  'resend': '/integrations/Resend.png',
  'slack': '/integrations/Slack.png',
  'snowflake': '/integrations/Snowflake.png',
  'stripe': '/integrations/Stripe.png',
  'trello': '/integrations/Trello.png',
  'twilio': '/integrations/Twilio.png',
  'typeform': '/integrations/Typeform.png',
  'xero': '/integrations/Xero.png',
  'google workspace / gmail': '/integrations/Google%20Drive.png',
  'gmail': '/integrations/Google%20Drive.png',
};

const resolveLogoSrc = (logo: string, name: string): string => {
  const normName = name.toLowerCase().trim();
  if (LOCAL_INTEGRATION_ICONS[normName]) return LOCAL_INTEGRATION_ICONS[normName];

  // Try matching clean alphanumeric
  const clean = normName.replace(/[^a-z0-9]/g, '');
  for (const [key, path] of Object.entries(LOCAL_INTEGRATION_ICONS)) {
    if (key.replace(/[^a-z0-9]/g, '') === clean) return path;
  }

  // If logo starts with /integrations, ensure spaces are URL-encoded
  if (logo && logo.startsWith('/integrations/')) {
    return encodeURI(decodeURI(logo));
  }

  return logo || '';
};

// Fallback-resilient logo component with multi-size support
const IntegrationLogo = ({ 
  logo, 
  name, 
  size = 'md' 
}: { 
  logo: string; 
  name: string; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  const [error, setError] = useState(false);
  const resolvedLogo = resolveLogoSrc(logo, name);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const badgeSizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-16 h-16 text-base'
  };

  if (error || !resolvedLogo) {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    return (
      <div className={`${badgeSizes[size]} rounded-md bg-slate-900 text-white font-delight font-bold flex items-center justify-center select-none shadow-2xs`}>
        {initials || name.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img 
      src={resolvedLogo} 
      alt={name} 
      onError={() => setError(true)} 
      loading="lazy"
      className={`${sizeClasses[size]} object-contain drop-shadow-2xs`} 
    />
  );
};

// Generates customized, authentic 3-step OAuth instructions based on app category
const getAppSteps = (app: IntegrationApp) => {
  const name = app.name;
  const id = app.id.toLowerCase();
  const cat = app.category.toLowerCase();
  
  if (id === 'google-sheets') {
    return [
      'Sign in with Google',
      'Grant access to LeadPulse',
      'Select a spreadsheet to sync leads'
    ];
  }
  if (id === 'slack') {
    return [
      'Sign in to Slack',
      'Choose a workspace',
      'Select channels to use'
    ];
  }
  if (id === 'microsoft-teams') {
    return [
      'Sign in with Microsoft',
      'Grant Teams access to LeadPulse',
      'Start sending real-time messages'
    ];
  }
  if (id === 'github') {
    return [
      'Sign in to GitHub',
      'Grant access to your repositories',
      'Start reading repos and managing issues'
    ];
  }
  if (id === 'google-drive') {
    return [
      'Sign in with Google',
      'Grant Drive access to LeadPulse',
      'Select target folders for exports'
    ];
  }
  if (id === 'notion') {
    return [
      'Sign in to Notion',
      'Choose Notion workspace and pages',
      'Select database to sync audience contacts'
    ];
  }
  if (id === 'hubspot') {
    return [
      'Sign in to HubSpot',
      'Choose your HubSpot portal',
      'Map contacts & deal pipeline stages'
    ];
  }
  if (id === 'stripe') {
    return [
      'Sign in with Stripe',
      'Authorize LeadPulse platform access',
      'Stream live invoice and payment conversions'
    ];
  }
  if (cat.includes('crm')) {
    return [
      `Sign in to ${name}`,
      `Grant LeadPulse authorization`,
      `Sync pipeline stages and deal records`
    ];
  }
  if (cat.includes('communication')) {
    return [
      `Sign in to ${name}`,
      `Select your alert channel or workspace`,
      `Activate instant notification webhooks`
    ];
  }
  if (cat.includes('data') || cat.includes('analytics')) {
    return [
      `Authenticate with ${name}`,
      `Grant query and ingestion permissions`,
      `Stream lead telemetry in real time`
    ];
  }
  if (cat.includes('ai')) {
    return [
      `Sign in to ${name}`,
      `Grant model execution permissions`,
      `Activate autonomous AI cold pitches`
    ];
  }
  return [
    `Sign in with ${name}`,
    `Grant access to LeadPulse`,
    `Complete automated 2-way sync setup`
  ];
};

// Official Authorization & Developer Console Portals for every integration
const INTEGRATION_PORTALS: Record<string, { authUrl: string; consoleUrl: string; docsUrl: string; portalLabel: string }> = {
  'slack': {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    consoleUrl: 'https://api.slack.com/apps',
    docsUrl: 'https://api.slack.com/messaging/webhooks',
    portalLabel: 'Slack OAuth & Incoming Webhooks Portal'
  },
  'microsoft-teams': {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    consoleUrl: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    docsUrl: 'https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook',
    portalLabel: 'Microsoft Entra ID & Teams Connectors'
  },
  'microsoft-outlook': {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    consoleUrl: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/auth-v2-user',
    portalLabel: 'Microsoft 365 & Azure OAuth Portal'
  },
  'twilio': {
    authUrl: 'https://console.twilio.com/',
    consoleUrl: 'https://console.twilio.com/us1/account/keys-credentials/api-keys',
    docsUrl: 'https://www.twilio.com/docs/iam/keys/api-key',
    portalLabel: 'Twilio Console & API Keys'
  },
  'resend': {
    authUrl: 'https://resend.com/api-keys',
    consoleUrl: 'https://resend.com/domains',
    docsUrl: 'https://resend.com/docs/introduction',
    portalLabel: 'Resend API Keys Console'
  },
  'gmail-workspace': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    consoleUrl: 'https://console.cloud.google.com/apis/credentials',
    docsUrl: 'https://developers.google.com/gmail/api/guides',
    portalLabel: 'Google Workspace & Cloud OAuth Console'
  },
  'hubspot': {
    authUrl: 'https://app.hubspot.com/login',
    consoleUrl: 'https://app.hubspot.com/private-apps',
    docsUrl: 'https://developers.hubspot.com/docs/api/private-apps',
    portalLabel: 'HubSpot Private Apps & OAuth Portal'
  },
  'salesforce': {
    authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    consoleUrl: 'https://login.salesforce.com/',
    docsUrl: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm',
    portalLabel: 'Salesforce Lightning OAuth Portal'
  },
  'apollo': {
    authUrl: 'https://app.apollo.io/#/settings/integrations/api',
    consoleUrl: 'https://developer.apollo.io/keys/',
    docsUrl: 'https://apolloio.github.io/apollo-api-docs/',
    portalLabel: 'Apollo.io API & Integrations Portal'
  },
  'attio': {
    authUrl: 'https://app.attio.com/',
    consoleUrl: 'https://developers.attio.com/',
    docsUrl: 'https://developers.attio.com/reference/get_v2-self',
    portalLabel: 'Attio Workspace & Developer Portal'
  },
  'linkedin': {
    authUrl: 'https://www.linkedin.com/developers/apps',
    consoleUrl: 'https://www.linkedin.com/developers/apps',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication',
    portalLabel: 'LinkedIn Developer OAuth Portal'
  },
  'netsuite': {
    authUrl: 'https://system.netsuite.com/pages/customerlogin.jsp',
    consoleUrl: 'https://system.netsuite.com/',
    docsUrl: 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/',
    portalLabel: 'Oracle NetSuite TBA Login Portal'
  },
  'openai': {
    authUrl: 'https://platform.openai.com/api-keys',
    consoleUrl: 'https://platform.openai.com/settings/organization/general',
    docsUrl: 'https://platform.openai.com/docs/api-reference/authentication',
    portalLabel: 'OpenAI Platform API Keys'
  },
  'anthropic': {
    authUrl: 'https://console.anthropic.com/settings/keys',
    consoleUrl: 'https://console.anthropic.com/',
    docsUrl: 'https://docs.anthropic.com/en/api/getting-started',
    portalLabel: 'Anthropic Console API Keys'
  },
  'gemini': {
    authUrl: 'https://aistudio.google.com/app/apikey',
    consoleUrl: 'https://console.cloud.google.com/apis/credentials',
    docsUrl: 'https://ai.google.dev/gemini-api/docs/api-key',
    portalLabel: 'Google AI Studio API Key Portal'
  },
  'elevenlabs': {
    authUrl: 'https://elevenlabs.io/app/settings/api-keys',
    consoleUrl: 'https://elevenlabs.io/app/voice-lab',
    docsUrl: 'https://elevenlabs.io/docs/api-reference/authentication',
    portalLabel: 'ElevenLabs API Keys Console'
  },
  'airtable': {
    authUrl: 'https://airtable.com/create/tokens',
    consoleUrl: 'https://airtable.com/create/oauth',
    docsUrl: 'https://airtable.com/developers/web/api/introduction',
    portalLabel: 'Airtable Builder Hub & PAT Portal'
  },
  'notion': {
    authUrl: 'https://www.notion.so/my-integrations',
    consoleUrl: 'https://www.notion.so/my-integrations',
    docsUrl: 'https://developers.notion.com/docs/create-a-notion-integration',
    portalLabel: 'Notion My Integrations Portal'
  },
  'google-sheets': {
    authUrl: 'https://console.cloud.google.com/apis/library/sheets.googleapis.com',
    consoleUrl: 'https://docs.google.com/spreadsheets/',
    docsUrl: 'https://developers.google.com/sheets/api/guides/concepts',
    portalLabel: 'Google Sheets & Cloud OAuth Console'
  },
  'microsoft-excel': {
    authUrl: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    consoleUrl: 'https://www.office.com/launch/excel',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/excel',
    portalLabel: 'Microsoft Graph & Excel Portal'
  },
  'google-calendar': {
    authUrl: 'https://console.cloud.google.com/apis/library/calendar-json.googleapis.com',
    consoleUrl: 'https://calendar.google.com/',
    docsUrl: 'https://developers.google.com/calendar/api/guides/overview',
    portalLabel: 'Google Calendar OAuth Console'
  },
  'calendly': {
    authUrl: 'https://calendly.com/integrations/api_webhooks',
    consoleUrl: 'https://calendly.com/event_types/user/me',
    docsUrl: 'https://developer.calendly.com/how-to-authenticate-with-personal-access-tokens',
    portalLabel: 'Calendly API & Webhooks Portal'
  },
  'asana': {
    authUrl: 'https://app.asana.com/0/my-apps',
    consoleUrl: 'https://app.asana.com/',
    docsUrl: 'https://developers.asana.com/docs/personal-access-token',
    portalLabel: 'Asana Developer App Console'
  },
  'trello': {
    authUrl: 'https://trello.com/power-ups/admin',
    consoleUrl: 'https://trello.com/',
    docsUrl: 'https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/',
    portalLabel: 'Trello Power-Ups & API Portal'
  },
  'monday': {
    authUrl: 'https://auth.monday.com/oauth2/authorize',
    consoleUrl: 'https://monday.com/developers/apps',
    docsUrl: 'https://developer.monday.com/api-reference/docs/authentication',
    portalLabel: 'monday.com Developer Center'
  },
  'linear': {
    authUrl: 'https://linear.app/settings/api',
    consoleUrl: 'https://linear.app/',
    docsUrl: 'https://developers.linear.app/docs/graphql/working-with-the-graphql-api',
    portalLabel: 'Linear API & OAuth Settings'
  },
  'jira': {
    authUrl: 'https://id.atlassian.com/manage-profile/security/api-tokens',
    consoleUrl: 'https://developer.atlassian.com/console/myapps/',
    docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/',
    portalLabel: 'Atlassian API Tokens & OAuth Console'
  },
  'google-drive': {
    authUrl: 'https://console.cloud.google.com/apis/library/drive.googleapis.com',
    consoleUrl: 'https://drive.google.com/',
    docsUrl: 'https://developers.google.com/drive/api/guides/about-sdk',
    portalLabel: 'Google Drive API Console'
  },
  'onedrive': {
    authUrl: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    consoleUrl: 'https://onedrive.live.com/',
    docsUrl: 'https://learn.microsoft.com/en-us/onedrive/developer/',
    portalLabel: 'Microsoft OneDrive Graph Portal'
  },
  'box': {
    authUrl: 'https://app.box.com/developers/console',
    consoleUrl: 'https://app.box.com/',
    docsUrl: 'https://developer.box.com/guides/authentication/',
    portalLabel: 'Box Developer Console'
  },
  'mailchimp': {
    authUrl: 'https://us1.admin.mailchimp.com/account/api/',
    consoleUrl: 'https://login.mailchimp.com/',
    docsUrl: 'https://mailchimp.com/developer/marketing/guides/quick-start/',
    portalLabel: 'Mailchimp API Keys & OAuth Portal'
  },
  'brevo': {
    authUrl: 'https://app.brevo.com/settings/keys/api',
    consoleUrl: 'https://app.brevo.com/',
    docsUrl: 'https://developers.brevo.com/docs/getting-started',
    portalLabel: 'Brevo SMTP & API Keys Console'
  },
  'typeform': {
    authUrl: 'https://admin.typeform.com/user#/section/tokens',
    consoleUrl: 'https://admin.typeform.com/',
    docsUrl: 'https://www.typeform.com/developers/get-started/personal-access-token/',
    portalLabel: 'Typeform Personal Access Tokens'
  },
  'google-forms': {
    authUrl: 'https://console.cloud.google.com/apis/library/forms.googleapis.com',
    consoleUrl: 'https://docs.google.com/forms/',
    docsUrl: 'https://developers.google.com/forms/api/guides',
    portalLabel: 'Google Forms API Console'
  },
  'facebook-pages': {
    authUrl: 'https://developers.facebook.com/apps/',
    consoleUrl: 'https://developers.facebook.com/tools/explorer/',
    docsUrl: 'https://developers.facebook.com/docs/pages-api/',
    portalLabel: 'Meta for Developers Portal'
  },
  'stripe': {
    authUrl: 'https://dashboard.stripe.com/apikeys',
    consoleUrl: 'https://dashboard.stripe.com/webhooks',
    docsUrl: 'https://docs.stripe.com/keys',
    portalLabel: 'Stripe Dashboard API Keys & Webhooks'
  },
  'quickbooks': {
    authUrl: 'https://developer.intuit.com/app/developer/dashboard',
    consoleUrl: 'https://accounts.intuit.com/',
    docsUrl: 'https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization',
    portalLabel: 'Intuit Developer Portal'
  },
  'xero': {
    authUrl: 'https://developer.xero.com/app/manage',
    consoleUrl: 'https://login.xero.com/',
    docsUrl: 'https://developer.xero.com/documentation/guides/oauth2/overview/',
    portalLabel: 'Xero Developer Portal'
  },
  'shopify': {
    authUrl: 'https://partners.shopify.com/',
    consoleUrl: 'https://admin.shopify.com/',
    docsUrl: 'https://shopify.dev/docs/apps/build/authentication-authorization',
    portalLabel: 'Shopify Admin & Partner Portal'
  },
  'snowflake': {
    authUrl: 'https://app.snowflake.com/',
    consoleUrl: 'https://app.snowflake.com/',
    docsUrl: 'https://docs.snowflake.com/en/user-guide/admin-security',
    portalLabel: 'Snowflake Cloud Console'
  },
  'databricks': {
    authUrl: 'https://accounts.cloud.databricks.com/',
    consoleUrl: 'https://accounts.cloud.databricks.com/',
    docsUrl: 'https://docs.databricks.com/en/dev-tools/auth/pat.html',
    portalLabel: 'Databricks Workspace & Token Console'
  },
  'clickhouse': {
    authUrl: 'https://clickhouse.cloud/',
    consoleUrl: 'https://clickhouse.cloud/',
    docsUrl: 'https://clickhouse.com/docs/en/cloud/manage/openapi',
    portalLabel: 'ClickHouse Cloud Console'
  },
  'google-analytics': {
    authUrl: 'https://analytics.google.com/analytics/web/',
    consoleUrl: 'https://analytics.google.com/',
    docsUrl: 'https://developers.google.com/analytics/devguides/collection/protocol/ga4',
    portalLabel: 'Google Analytics 4 Admin Console'
  },
  'amplitude': {
    authUrl: 'https://app.amplitude.com/analytics',
    consoleUrl: 'https://app.amplitude.com/',
    docsUrl: 'https://www.docs.developers.amplitude.com/analytics/find-api-credentials/',
    portalLabel: 'Amplitude Project Settings'
  },
  'firecrawl': {
    authUrl: 'https://www.firecrawl.dev/app/api-keys',
    consoleUrl: 'https://www.firecrawl.dev/app',
    docsUrl: 'https://docs.firecrawl.dev/introduction',
    portalLabel: 'Firecrawl API Keys Dashboard'
  },
  'google-maps': {
    authUrl: 'https://console.cloud.google.com/google/maps-apis/credentials',
    consoleUrl: 'https://console.cloud.google.com/',
    docsUrl: 'https://developers.google.com/maps/documentation/javascript/get-api-key',
    portalLabel: 'Google Maps Platform Credentials'
  },
  'github': {
    authUrl: 'https://github.com/settings/tokens/new?description=LeadPulse+Workspace+Connector&scopes=repo,workflow,read:org',
    consoleUrl: 'https://github.com/settings/apps',
    docsUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
    portalLabel: 'GitHub Token & OAuth Authorization'
  },
  'okta': {
    authUrl: 'https://login.okta.com/',
    consoleUrl: 'https://developer.okta.com/',
    docsUrl: 'https://developer.okta.com/docs/guides/implement-grant-type/authcode/main/',
    portalLabel: 'Okta Admin & SSO Console'
  },
  'zapier': {
    authUrl: 'https://zapier.com/app/zaps',
    consoleUrl: 'https://developer.zapier.com/',
    docsUrl: 'https://help.zapier.com/hc/en-us/articles/8496288690317-Trigger-Zaps-from-webhooks',
    portalLabel: 'Zapier Webhooks & Zaps Portal'
  },
  'webhook-custom': {
    authUrl: 'https://webhook.site/',
    consoleUrl: 'https://webhook.site/',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST',
    portalLabel: 'Webhook Endpoint Inspector'
  }
};

const getIntegrationPortal = (app: IntegrationApp) => {
  const id = app.id.toLowerCase();
  if (INTEGRATION_PORTALS[id]) return INTEGRATION_PORTALS[id];
  const cleanDomain = app.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  return {
    authUrl: `https://${cleanDomain}/login`,
    consoleUrl: `https://${cleanDomain}`,
    docsUrl: `https://${cleanDomain}/docs`,
    portalLabel: `${app.name} Authorization Portal`
  };
};

const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)).replace(/\/$/, '');

const Integrations = () => {
  const { user, integrations: storeIntegrations, integrationLogs, setIntegrations, setIntegrationLogs } = useStore();
  const [apps, setApps] = useState<IntegrationApp[]>(storeIntegrations as IntegrationApp[]);
  const [apiKey, setApiKey] = useState('lp_live_workspace_key');
  const [, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'connected' | 'category'>('az');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [testPingResult, setTestPingResult] = useState<string | null>(null);

  // External Website Authorization State
  const [isAuthorizingOAuth, setIsAuthorizingOAuth] = useState(false);
  const [oauthStep, setOauthStep] = useState<'idle' | 'portal_open' | 'verifying' | 'success'>('idle');
  const [openedPortalUrl, setOpenedPortalUrl] = useState<string>('');
  
  // Config edit state & show/hide passwords
  const [appConfigState, setAppConfigState] = useState<Record<string, string>>({});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  const fetchIntegrations = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/integrations`, {
        headers: { userid: user._id }
      });
      const fetchedApps = res.data.integrations || [];
      setApps(fetchedApps);
      setIntegrations(fetchedApps);
      if (res.data.logs) setIntegrationLogs(res.data.logs);
      if (res.data.apiKey) setApiKey(res.data.apiKey);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open configuration for an app
  const handleOpenConfig = (app: IntegrationApp) => {
    setSelectedApp(app);
    setAppConfigState(app.config || {});
    setRevealedKeys({});
    setTestPingResult(null);
    setIsAuthorizingOAuth(false);
    setOauthStep('idle');
    setOpenedPortalUrl('');
    setIsConfigModalOpen(true);
  };

  // Step 1: Launch Official External Integration Authorization / Developer Website
  const handleLaunchWebsiteAuth = () => {
    if (!selectedApp) return;
    const portal = getIntegrationPortal(selectedApp);
    setOpenedPortalUrl(portal.authUrl);
    setOauthStep('portal_open');

    // Open centered OAuth / Developer Authorization window directly on the provider's website
    const width = 680;
    const height = 760;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    window.open(
      portal.authUrl,
      `leadpulse_oauth_${selectedApp.id}`,
      `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
    );
  };

  // Step 2: Confirm & Verify Website Authorization Handshake
  const handleCompleteWebsiteAuth = async () => {
    if (!selectedApp || !user?._id) return;
    setIsAuthorizingOAuth(true);
    setOauthStep('verifying');

    const portal = getIntegrationPortal(selectedApp);
    const defaultSlug = (user?.name || user?.company_name || 'workspace').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const extraDefaults: Record<string, string> = {};
    if (selectedApp.id === 'calendly' && !appConfigState.bookingUrl) {
      extraDefaults.bookingUrl = `https://calendly.com/${defaultSlug}/15min`;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/integrations/connect`, {
        appId: selectedApp.id,
        config: {
          ...selectedApp.config,
          ...appConfigState,
          ...extraDefaults,
          authType: 'website_oauth2',
          authorizedPortal: portal.authUrl,
          connectedAt: new Date().toISOString()
        }
      }, {
        headers: { userid: user._id }
      });

      setApps(res.data.integrations);
      setIntegrations(res.data.integrations);
      if (res.data.logs) setIntegrationLogs(res.data.logs);
      setOauthStep('success');
      setTimeout(() => {
        setIsConfigModalOpen(false);
        setIsAuthorizingOAuth(false);
        setOauthStep('idle');
        showToast(`Authorized & linked ${selectedApp.name} via ${portal.portalLabel}!`);
      }, 600);
    } catch (err) {
      console.error('Website authorization connect failed:', err);
      setIsAuthorizingOAuth(false);
      setOauthStep('portal_open');
      await alertDialog({
        title: 'Authorization Verification Failed',
        message: 'Could not verify the connection. Please check your authorization or paste your API key/webhook below.',
        variant: 'error'
      });
    }
  };

  // Toggle reveal password
  const toggleRevealKey = (key: string) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Test live connection ping
  const handleTestConnection = async () => {
    if (!selectedApp) return;
    setIsTestingPing(true);
    setTestPingResult(null);
    try {
      const res = await axios.post(`${API_BASE}/api/integrations/test`, {
        appId: selectedApp.id,
        config: appConfigState
      });
      setTestPingResult(`Status: 200 OK (${res.data.latency}) — ${res.data.message || 'Connection verified!'}`);
    } catch (err) {
      setTestPingResult('Connection failed. Please check your credentials and endpoint URL.');
    } finally {
      setIsTestingPing(false);
    }
  };

  // Save / Connect App via Direct API Credentials
  const handleSaveConnection = async () => {
    if (!selectedApp || !user?._id) return;
    setIsSaving(true);
    try {
      const portal = getIntegrationPortal(selectedApp);
      const res = await axios.post(`${API_BASE}/api/integrations/connect`, {
        appId: selectedApp.id,
        config: {
          ...appConfigState,
          authType: 'api_key',
          authorizedPortal: portal.consoleUrl,
          connectedAt: new Date().toISOString()
        }
      }, {
        headers: { userid: user._id }
      });

      setApps(res.data.integrations);
      setIntegrations(res.data.integrations);
      if (res.data.logs) setIntegrationLogs(res.data.logs);
      setIsConfigModalOpen(false);
      showToast(`Connected to ${selectedApp.name} — Active across workspace!`);
    } catch (err) {
      console.error('Failed to connect app:', err);
      await alertDialog({
        title: 'Connection Error',
        message: 'Failed to connect integration. Please verify your configuration and try again.',
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Disconnect App
  const handleDisconnect = async () => {
    if (!selectedApp || !user?._id) return;
    const confirmed = await confirmDialog({
      title: `Disconnect ${selectedApp.name}?`,
      message: `Are you sure you want to disconnect ${selectedApp.name}? Workspace actions and automated syncs for this integration will be paused until reconnected.`,
      confirmText: 'Disconnect Integration',
      cancelText: 'Keep Connected',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await axios.post(`${API_BASE}/api/integrations/disconnect`, {
        appId: selectedApp.id
      }, {
        headers: { userid: user._id }
      });

      setApps(res.data.integrations);
      setIntegrations(res.data.integrations);
      if (res.data.logs) setIntegrationLogs(res.data.logs);
      setIsConfigModalOpen(false);
      showToast(`Disconnected ${selectedApp.name}.`);
    } catch (err) {
      console.error('Failed to disconnect app:', err);
    }
  };

  // Clear logs
  const handleClearLogs = async () => {
    if (!user?._id) return;
    const confirmed = await confirmDialog({
      title: 'Clear Activity Logs?',
      message: 'Are you sure you want to clear all integration delivery logs from your workspace history?',
      confirmText: 'Clear Logs',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE}/api/integrations/logs`, {
        headers: { userid: user._id }
      });
      setIntegrationLogs([]);
      showToast('Integration activity logs cleared.');
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  // Test send inbound webhook lead
  const handleSendTestWebhookLead = async () => {
    if (!user?._id) return;
    try {
      await axios.post(`${API_BASE}/api/leads/form-submit/${user._id}`, {
        name: 'Webhook Inbound Lead',
        email: 'webhook.test@cloudconnect.com',
        phone: '+1 (555) 018-9200',
        company: 'CloudConnect Systems',
        formId: 'api-webhook-sync'
      });
      await useStore.getState().notifyIntegration(
        'webhook-custom',
        'Captured inbound webhook lead: CloudConnect Systems (webhook.test@cloudconnect.com)',
        { source: 'api-webhook-sync', company: 'CloudConnect Systems', email: 'webhook.test@cloudconnect.com' }
      );
      showToast('Test Webhook Lead dispatched, saved to Audience, and logged!');
    } catch (err) {
      console.error('Webhook test failed:', err);
    }
  };

  // High-performance memoized filter & sort (alphabetical A-Z by default)
  const filteredApps = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matched = apps.filter(app => {
      if (showActiveOnly && !app.connected) return false;
      const matchesCategory = selectedCategory === 'All' || app.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        app.name.toLowerCase().includes(query) ||
        app.category.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.id.toLowerCase().includes(query)
      );
    });

    return [...matched].sort((a, b) => {
      if (sortBy === 'za') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'connected') {
        if (a.connected !== b.connected) return a.connected ? -1 : 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'category') {
        const catCmp = a.category.localeCompare(b.category);
        if (catCmp !== 0) return catCmp;
        return a.name.localeCompare(b.name);
      }
      // Default: 'az' (Alphabetical A -> Z)
      return a.name.localeCompare(b.name);
    });
  }, [apps, searchQuery, selectedCategory, showActiveOnly, sortBy]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const baseApps = showActiveOnly ? apps.filter(a => a.connected) : apps;
    const counts: Record<string, number> = { All: baseApps.length };
    CATEGORIES.forEach(cat => {
      if (cat !== 'All') {
        counts[cat] = baseApps.filter(a => a.category.toLowerCase() === cat.toLowerCase()).length;
      }
    });
    return counts;
  }, [apps, showActiveOnly]);

  const connectedCount = apps.filter(a => a.connected).length;
  const webhookUrl = `${API_BASE}/api/leads/form-submit/${user?._id || 'YOUR_USER_ID'}`;

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'CRM':
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dot: 'bg-blue-600',
          hookLabel: 'Audience & CRM Sync',
          accentBorder: 'hover:border-blue-300'
        };
      case 'Communication':
        return {
          pill: 'bg-violet-50 text-violet-700 border-violet-200/80',
          dot: 'bg-violet-600',
          hookLabel: 'Outreach & Stage Alerts',
          accentBorder: 'hover:border-violet-300'
        };
      case 'AI & LLMs':
        return {
          pill: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-600',
          hookLabel: 'Email Lookup & AI Copilot',
          accentBorder: 'hover:border-indigo-300'
        };
      case 'Automation & Workflows':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          hookLabel: 'Automations & Booking Tag',
          accentBorder: 'hover:border-amber-300'
        };
      case 'Productivity':
      case 'Data & Warehouses':
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-600',
          hookLabel: '1-Click Sheet / Table Export',
          accentBorder: 'hover:border-emerald-300'
        };
      default:
        return {
          pill: 'bg-sky-50 text-sky-700 border-sky-200/80',
          dot: 'bg-sky-600',
          hookLabel: 'Live Webhook Stream',
          accentBorder: 'hover:border-sky-300'
        };
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full space-y-7">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed top-6 right-6 z-50 bg-[#191716] text-white px-4 py-2.5 rounded-md shadow-xl border border-indigo-800 text-xs font-delight font-medium flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#191716] tracking-tight font-delight">Integrations &amp; Connectors</h1>
                <p className="text-slate-500 font-normal text-xs mt-1">
                  Connect your CRM, spreadsheets, enrichment APIs, and team channels to unlock 1-click actions across LeadPulse.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsActivityLogOpen(true)}
                  className="h-8.5 px-3 bg-[#C85A32] hover:bg-[#B04B25] text-white font-delight font-semibold text-xs rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>Activity Log</span>
                  <span className="px-1.5 py-0.2 bg-black/20 rounded text-[10px] font-delight font-medium text-white">
                    {integrationLogs.length}
                  </span>
                </button>

                <button 
                  onClick={() => setIsApiDocsOpen(true)}
                  className="h-8.5 px-3 bg-white border border-slate-200 text-[#191716] font-delight font-medium text-xs rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-slate-500" />
                  <span>API &amp; Webhooks</span>
                </button>
              </div>
            </div>

            {/* Unified 3-Column Divided Architectural Ledger */}
            <div className="bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
              {/* Column 1: Workspace Ecosystem (Click to toggle Active / Connected view) */}
              <div
                onClick={() => setShowActiveOnly(prev => !prev)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors group ${
                  showActiveOnly ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'
                }`}
                title="Click to toggle Active / Connected integrations filter"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-delight font-semibold uppercase tracking-wider text-slate-500">Workspace Ecosystem</span>
                    <span className={`text-[9px] font-delight font-semibold px-1.5 py-0.5 rounded border transition-colors ${
                      showActiveOnly
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:border-[#191716] group-hover:text-[#191716]'
                    }`}>
                      {showActiveOnly ? 'Showing Active Only' : 'Filter Active'}
                    </span>
                  </div>
                  <div className="text-xl font-bold font-delight mt-1 text-[#191716] tabular-nums">
                    {connectedCount} <span className="text-xs font-normal text-slate-500">/ {apps.length} Active</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${connectedCount > 0 ? 'bg-emerald-500' : 'bg-[#C85A32]'}`}></span>
                    <span>{showActiveOnly ? 'Click to view all available connectors' : 'Click to filter connected integrations'}</span>
                  </p>
                </div>
              </div>

              {/* Column 2: Live Delivery Telemetry */}
              <div 
                onClick={() => setIsActivityLogOpen(true)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <div>
                  <span className="text-[10px] font-delight font-semibold uppercase tracking-wider text-slate-500">Live Delivery Telemetry</span>
                  <div className="text-lg font-bold font-delight mt-1 text-[#191716] group-hover:text-[#C85A32] transition-colors flex items-center gap-1.5 tabular-nums">
                    <span>{integrationLogs.length} Dispatched Events</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C85A32] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inspect <span className="text-emerald-600 font-delight font-semibold">200 OK</span> JSON payloads
                  </p>
                </div>
              </div>

              {/* Column 3: Inbound Lead Webhook */}
              <div 
                onClick={() => setIsApiDocsOpen(true)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <div>
                  <span className="text-[10px] font-delight font-semibold uppercase tracking-wider text-slate-500">Inbound Lead Webhook</span>
                  <div className="text-lg font-bold font-delight mt-1 text-[#191716] group-hover:text-[#C85A32] transition-colors flex items-center gap-2">
                    <span>Listening</span>
                    <span className="text-[9px] font-delight font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      AES-256
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-delight font-normal truncate max-w-[210px]">
                    Key: {apiKey.substring(0, 14)}...
                  </p>
                </div>
              </div>
            </div>

            {/* Clean Category Filter, Active Toggle, Search, Sort & View Toggle Bar */}
            <div className="bg-white border border-slate-200 rounded-md p-2.5 flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 custom-scrollbar">
                {/* Prominent Active / Connected Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowActiveOnly(prev => !prev)}
                  className={`px-2.5 py-1 rounded text-xs font-delight transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap shrink-0 mr-1 ${
                    showActiveOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                      : 'bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 font-semibold'
                  }`}
                  title="Toggle viewing only active/connected integrations"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${showActiveOnly ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                  <span>Active / Connected</span>
                  <span className={`text-[10px] font-delight font-bold px-1.5 py-0.2 rounded ${
                    showActiveOnly ? 'bg-black/20 text-white' : 'bg-emerald-200/80 text-emerald-900'
                  }`}>
                    {connectedCount}
                  </span>
                </button>

                {CATEGORIES.map(cat => {
                  const count = categoryCounts[cat] ?? 0;
                  const isSelected = selectedCategory === cat;
                  const theme = getCategoryTheme(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded text-xs font-delight transition-all cursor-pointer border flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isSelected 
                          ? 'bg-[#191716] text-white border-[#191716] font-semibold' 
                          : 'bg-white text-slate-600 hover:text-[#191716] hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      {cat !== 'All' && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : theme.dot}`} />
                      )}
                      <span>{cat}</span>
                      <span className={`text-[10px] font-delight font-medium px-1 py-0.2 rounded ${
                        isSelected ? 'bg-white/15 text-indigo-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Controls: Search + Sort Dropdown + Grid/List Icon Toggle */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter connectors..." 
                    className="w-full h-8 pl-8 pr-3 text-xs font-delight bg-slate-50 focus:bg-white border border-slate-200 rounded focus:outline-none focus:border-[#191716] transition-colors placeholder:text-slate-400"
                  />
                </div>

                {/* Sort Selector */}
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded px-2.5 h-8 shrink-0">
                  <ArrowUpDown className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
                  <span className="text-[10px] font-delight font-semibold text-slate-400 uppercase mr-1 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'az' | 'za' | 'connected' | 'category')}
                    className="bg-transparent text-xs font-delight font-semibold text-[#191716] outline-none cursor-pointer pr-1"
                    title="Sort integrations"
                  >
                    <option value="az">Name (A &rarr; Z)</option>
                    <option value="za">Name (Z &rarr; A)</option>
                    <option value="connected">Connected First</option>
                    <option value="category">Category (A &rarr; Z)</option>
                  </select>
                </div>

                {/* Grid / List View Icon Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 h-8 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`h-6.5 w-6.5 rounded-xs flex items-center justify-center transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#191716] text-white'
                        : 'text-slate-500 hover:text-[#191716]'
                    }`}
                    title="Grid View"
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`h-6.5 w-6.5 rounded-xs flex items-center justify-center transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[#191716] text-white'
                        : 'text-slate-500 hover:text-[#191716]'
                    }`}
                    title="List View"
                    aria-label="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Apps Display — Compact 4-Column Grid View OR Sleek List View (Alphabetical Default) */}
            {filteredApps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-md p-10 text-center space-y-2">
                {showActiveOnly ? (
                  <>
                    <p className="text-sm font-delight text-slate-700 font-semibold">
                      No active integrations connected yet{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      Authorize an integration via its official website portal or API key to see it under Active / Connected.
                    </p>
                    <button
                      onClick={() => { setShowActiveOnly(false); setSearchQuery(''); setSelectedCategory('All'); }}
                      className="mt-3 px-3.5 py-1.5 bg-[#191716] text-white rounded text-xs font-delight font-semibold cursor-pointer"
                    >
                      Browse All {apps.length} Connectors
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-delight text-slate-700 font-semibold">No connectors matching "{searchQuery}"</p>
                    <p className="text-xs text-slate-400">Try searching for CRM, AI providers, databases, or clear the search query.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setShowActiveOnly(false); setSortBy('az'); }}
                      className="mt-3 px-3.5 py-1.5 bg-[#191716] text-white rounded text-xs font-delight font-semibold cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredApps.map((app) => {
                  const theme = getCategoryTheme(app.category);
                  return (
                    <div 
                      key={app.id} 
                      className={`bg-white rounded-md p-3.5 transition-all duration-150 group flex flex-col justify-between text-left space-y-2.5 border ${
                        app.connected
                          ? 'border-[#191716]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Compact Top Header: Small Logo + Title + Category Pill */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8.5 h-8.5 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1.5 shrink-0">
                              <IntegrationLogo logo={app.logo} name={app.name} size="md" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-[#191716] text-sm tracking-tight font-delight truncate">
                                {app.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot}`} />
                                <span className="text-[10px] font-delight font-normal text-slate-500 truncate">
                                  {app.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          {app.connected && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-delight font-semibold shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </div>

                        {/* Compact Description */}
                        <p className="text-[11px] text-slate-500 font-normal leading-snug line-clamp-2">
                          {app.description}
                        </p>
                      </div>

                      {/* Compact Bottom Action Strip */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-delight font-normal text-slate-400 truncate">
                          {theme.hookLabel}
                        </span>

                        {app.connected ? (
                          <button 
                            onClick={() => handleOpenConfig(app)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#191716] rounded text-[11px] font-delight font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                          >
                            <Settings className="w-3 h-3 text-slate-500" />
                            <span>Configure</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenConfig(app)}
                            className="px-2.5 py-1 bg-white hover:bg-[#191716] text-[#191716] hover:text-white border border-slate-200 hover:border-[#191716] font-delight text-[11px] font-semibold rounded transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="bg-white border border-slate-200 rounded-md divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const theme = getCategoryTheme(app.category);
                  return (
                    <div
                      key={app.id}
                      className="px-4 py-2.5 hover:bg-slate-50/70 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Logo + Name + Category + Description */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8.5 h-8.5 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-center p-1.5 shrink-0">
                          <IntegrationLogo logo={app.logo} name={app.name} size="md" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-[#191716] text-sm tracking-tight font-delight">
                              {app.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[10px] font-delight font-normal text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                              {app.category}
                            </span>
                            {app.connected && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-delight font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Hook Label + Action Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <span className="hidden md:inline text-[11px] font-delight font-normal text-slate-400">
                          {theme.hookLabel}
                        </span>

                        {app.connected ? (
                          <button 
                            onClick={() => handleOpenConfig(app)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#191716] rounded text-xs font-delight font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                          >
                            <Settings className="w-3 h-3 text-slate-500" />
                            <span>Configure</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOpenConfig(app)}
                            className="px-2.5 py-1 bg-white hover:bg-[#191716] text-[#191716] hover:text-white border border-slate-200 hover:border-[#191716] font-delight text-xs font-semibold rounded transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Developer Webhooks & API Banner */}
            <div className="bg-slate-950 text-white rounded-md p-6 border border-slate-800 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 font-delight font-semibold text-[10px] uppercase border border-slate-700">
                      Developer Webhooks
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white">Live Inbound Webhook Endpoint</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
                    Post JSON payloads from any custom backend, form, or Zapier action directly into this endpoint to auto-enrich and capture leads into your CRM.
                  </p>
                </div>

                <button 
                  onClick={handleSendTestWebhookLead}
                  className="h-8 px-3.5 bg-white text-slate-900 font-delight font-medium text-xs rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1.5 whitespace-nowrap self-start md:self-auto cursor-pointer border border-white"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Send Test Webhook Lead</span>
                </button>
              </div>

              {/* Webhook & API Key Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-md border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-delight font-normal">
                    <span>Inbound Webhook URL</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="font-delight font-medium text-xs text-slate-200 truncate select-all">{webhookUrl}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-md border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-delight font-normal">
                    <span>Secret API Key</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <div className="font-delight font-medium text-xs text-slate-200 truncate select-all">{apiKey}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= MODAL: CONFIGURE & AUTHORIZE INTEGRATION ================= */}
      {isConfigModalOpen && selectedApp && (() => {
        const portal = getIntegrationPortal(selectedApp);
        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh]">
              
              {/* Header: Back Button + Title + Close */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="w-7 h-7 rounded-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Back"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-display">
                      {selectedApp.connected ? `Manage ${selectedApp.name}` : `Authorize & Link ${selectedApp.name}`}
                    </h3>
                    {selectedApp.connected && (
                      <span className="text-[10px] font-delight font-medium px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Sync
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)} 
                  className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
                
                {/* 1. Numbered Step-by-Step Instructions */}
                <div className="space-y-2">
                  {getAppSteps(selectedApp).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-delight font-medium">
                      <span className="w-4 h-4 rounded-xs bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </div>
                  ))}
                </div>

                {/* 2. Official Website OAuth & Developer Portal Authorization Card */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                        <IntegrationLogo logo={selectedApp.logo} name={selectedApp.name} size="md" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 font-delight">
                          {portal.portalLabel}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-delight truncate max-w-[310px]">
                          {portal.authUrl}
                        </p>
                      </div>
                    </div>

                    <a
                      href={portal.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-delight font-semibold text-[#C85A32] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Official Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-slate-200/90 text-[11px] text-slate-600 space-y-1.5 font-delight">
                    <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Website Authorization Permissions:
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Authenticate directly on {selectedApp.name}&apos;s official login &amp; OAuth portal</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Link workspace account ({user?.email || 'your operator account'}) for live 2-way sync</span>
                    </div>
                  </div>

                  {/* Step 1 Button: Open Real Provider Website */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleLaunchWebsiteAuth}
                      disabled={isAuthorizingOAuth}
                      className="w-full h-10 bg-[#191716] hover:bg-slate-800 text-white font-delight text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 border border-[#191716] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <IntegrationLogo logo={selectedApp.logo} name={selectedApp.name} size="sm" />
                      <span>
                        {oauthStep === 'portal_open'
                          ? `Re-open ${selectedApp.name} Authorization Website`
                          : selectedApp.connected
                          ? `Re-authorize on ${selectedApp.name} Website`
                          : `Authorize on ${selectedApp.name} Website`}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                    </button>

                    {/* Step 2 Box: Shown once the external website popup/tab has been launched */}
                    {oauthStep !== 'idle' && (
                      <div className="p-3.5 rounded-md bg-emerald-50/90 border border-emerald-200 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-xs font-delight font-bold text-emerald-950 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span>External {selectedApp.name} Portal Launched</span>
                            </div>
                            <p className="text-[11px] text-emerald-800 font-delight leading-relaxed">
                              Complete sign-in and authorization in the opened {selectedApp.name} window ({openedPortalUrl || portal.authUrl}), then click below to verify and activate your workspace link.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCompleteWebsiteAuth}
                          disabled={isAuthorizingOAuth}
                          className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-delight text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          {isAuthorizingOAuth ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying Authorization with {selectedApp.name}...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>I&apos;ve Authorized on {selectedApp.name} — Verify &amp; Link Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Sleek "OR" Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-500 font-delight font-normal text-[11px]">
                      or paste live credentials from {selectedApp.name} Developer Console
                    </span>
                  </div>
                </div>

                {/* 5. Direct API Credentials / Webhook Settings */}
                <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-delight font-bold text-slate-800">
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span>Direct API Key / Webhook Configuration</span>
                    </div>
                    <a
                      href={portal.consoleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-delight font-semibold text-[#C85A32] hover:underline flex items-center gap-1"
                    >
                      <span>Open {selectedApp.name} Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {selectedApp.configFields && selectedApp.configFields.length > 0 ? (
                    selectedApp.configFields.map((field) => {
                      const isPassword = field.type === 'password';
                      const isRevealed = revealedKeys[field.key];
                      const currentInputType = isPassword ? (isRevealed ? 'text' : 'password') : field.type;

                      return (
                        <div key={field.key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="block text-[11px] font-delight text-slate-700 font-medium">
                              {field.label} {field.required && <span className="text-rose-500">*</span>}
                            </label>
                            {field.helperText && (
                              <span className="text-[10px] text-slate-400 font-delight font-normal">{field.helperText}</span>
                            )}
                          </div>
                          
                          <div className="relative">
                            <input 
                              type={currentInputType}
                              value={appConfigState[field.key] ?? ''}
                              onChange={(e) => setAppConfigState({ ...appConfigState, [field.key]: e.target.value })}
                              placeholder={field.placeholder}
                              className={`w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs font-delight font-normal outline-none focus:border-slate-400 transition-colors placeholder:text-slate-400 ${
                                isPassword ? 'pr-8' : ''
                              }`}
                            />
                            {isPassword && (
                              <button
                                type="button"
                                onClick={() => toggleRevealKey(field.key)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-delight font-semibold text-slate-600 mb-1">API Key / Token</label>
                        <input 
                          type="password"
                          value={appConfigState.apiKey || ''}
                          onChange={(e) => setAppConfigState({ ...appConfigState, apiKey: e.target.value })}
                          placeholder="Enter API token..."
                          className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs font-delight font-medium outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-delight font-semibold text-slate-600 mb-1">Target Endpoint / Webhook URL</label>
                        <input 
                          type="url"
                          value={appConfigState.endpoint || ''}
                          onChange={(e) => setAppConfigState({ ...appConfigState, endpoint: e.target.value })}
                          placeholder="https://api.service.com/v1"
                          className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs font-delight font-medium outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  {testPingResult && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-md text-xs font-delight font-medium border border-emerald-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{testPingResult}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Bottom Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5 shrink-0">
                <div>
                  {selectedApp.connected && (
                    <button 
                      type="button" 
                      onClick={handleDisconnect}
                      className="text-xs font-delight font-medium text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Disconnect Integration
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    disabled={isTestingPing}
                    onClick={handleTestConnection}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-delight font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isTestingPing && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
                    <span>{isTestingPing ? 'Pinging...' : 'Test Ping'}</span>
                  </button>
                  
                  <button 
                    type="button" 
                    disabled={isSaving}
                    onClick={handleSaveConnection}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-delight font-medium hover:bg-slate-800 transition-colors border border-slate-900 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save & Link Credentials'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: API DOCUMENTATION ================= */}
      {isApiDocsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-md shadow-xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">LeadPulse Developer REST API</h3>
                  <p className="text-[11px] font-delight font-normal text-slate-400">REST endpoints for programmatic CRM sync and outreach dispatch.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsApiDocsOpen(false)} 
                className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              
              {/* Endpoint 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-delight font-medium text-xs">
                  <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/leads</span>
                  <span className="text-slate-400">• Create or Ingest B2B Contact</span>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-delight font-normal text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST ${API_BASE}/api/leads \\
  -H "Content-Type: application/json" \\
  -H "userid: ${user?._id || 'YOUR_USER_ID'}" \\
  -d '{
    "businessName": "${user?.company_name || 'Meridian Cloud Systems'}",
    "email": "${user?.email || 'contact@meridiancloud.io'}",
    "phone": "+1 555-0192",
    "category": "SaaS",
    "status": "New"
  }'`}
                </pre>
              </div>

              {/* Endpoint 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-delight font-medium text-xs">
                  <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">POST</span>
                  <span className="font-bold text-slate-900">/api/leads/form-submit/:userId</span>
                  <span className="text-slate-400">• Public Inbound Lead Capture (No auth required)</span>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-delight font-normal text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`curl -X POST ${API_BASE}/api/leads/form-submit/${user?._id || 'YOUR_USER_ID'} \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "${user?.name || 'Enterprise Buyer'}",
    "email": "${user?.email || 'buyer@enterprise.com'}",
    "company": "${user?.company_name || 'Meridian Cloud'}",
    "formId": "landing-page-v1"
  }'`}
                </pre>
              </div>

              {/* Endpoint 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-delight font-medium text-xs">
                  <span className="px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200 font-bold">GET</span>
                  <span className="font-bold text-slate-900">/api/leads</span>
                  <span className="text-slate-400">• Fetch Audience & CRM Deals</span>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-delight font-normal text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`curl ${(import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)).replace(/\/$/, '')}/api/leads \\
  -H "userid: ${user?._id || 'YOUR_USER_ID'}"`}
                </pre>
              </div>

            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsApiDocsOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-delight font-medium text-xs hover:bg-slate-800 border border-slate-900 cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: LIVE ACTIVITY & DELIVERY LOG ================= */}
      {isActivityLogOpen && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-display">
                      Live Integration Activity &amp; Delivery Log
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-delight text-[10px] font-bold">
                      Real-Time Stream
                    </span>
                  </div>
                  <p className="text-[11px] font-delight font-normal text-slate-500 mt-0.5">
                    Every CRM push, Apollo enrichment, Slack deal alert, and webhook payload dispatched across your workspace.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {integrationLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 rounded-md text-[11px] font-delight font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <button 
                  onClick={() => setIsActivityLogOpen(false)} 
                  className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs custom-scrollbar flex-1 bg-slate-50/40">
              {integrationLogs.length === 0 ? (
                <div className="p-12 text-center bg-white border border-slate-200 rounded-md space-y-2">
                  <Webhook className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-delight font-bold text-slate-700">No integration events recorded yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Push leads to HubSpot or Google Sheets in Audience, enrich an email via Apollo, or move a deal card to Closed Won in CRM Pipeline to see live 200 OK payloads here.
                  </p>
                </div>
              ) : (
                integrationLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const typeColors: Record<string, string> = {
                    sync: 'bg-blue-50 text-blue-700 border-blue-200',
                    enrich: 'bg-violet-50 text-violet-700 border-violet-200',
                    notify: 'bg-amber-50 text-amber-700 border-amber-200',
                    auth: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    webhook: 'bg-cyan-50 text-cyan-700 border-cyan-200'
                  };

                  return (
                    <div
                      key={log.id}
                      className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center p-1">
                            <IntegrationLogo logo="" name={log.appName} size="sm" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{log.appName}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-delight uppercase font-bold border ${typeColors[log.eventType] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                {log.eventType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">{log.summary}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-delight text-[10px] font-bold">
                            {log.status} • {log.latency}
                          </span>
                          <span className="text-[10px] font-delight font-normal text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          {log.payload && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-delight font-medium text-[10px] cursor-pointer transition-colors"
                            >
                              {isExpanded ? 'Hide JSON' : 'Payload'}
                            </button>
                          )}
                        </div>
                      </div>

                      {isExpanded && log.payload && (
                        <pre className="p-3 bg-slate-950 text-emerald-300 rounded-md font-delight font-normal text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-[11px] font-delight font-normal text-slate-400">
                Showing {integrationLogs.length} recent workspace integration events
              </span>
              <button 
                onClick={() => setIsActivityLogOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-delight font-medium text-xs hover:bg-slate-800 border border-slate-900 cursor-pointer"
              >
                Close Log
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Integrations;

