export interface CrawlResult {
  url: string;
  email: string | null;
  status: 'Verified Email' | 'Phone Only / No Email Found';
  contactPageFound?: boolean;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
const EXCLUDED_DOMAINS = ['sentry.io', 'example.com', 'wixpress.com', 'schema.org', 'domain.com', 'email.com'];
const EXCLUDED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.js', '.css'];

/**
 * Fast Asynchronous HTTP Crawler that concurrently checks Homepage,
 * /contact, and /about paths for public email contacts in milliseconds.
 */
export async function crawlWebsiteForEmails(websiteUrl: string): Promise<CrawlResult> {
  if (!websiteUrl || !websiteUrl.startsWith('http')) {
    return { url: websiteUrl, email: null, status: 'Phone Only / No Email Found' };
  }

  try {
    const parsed = new URL(websiteUrl);
    const origin = parsed.origin;

    const targetPaths = [
      '',
      '/contact',
      '/contact-us',
      '/about',
      '/about-us'
    ];

    const foundEmails = new Set<string>();

    // Concurrently fetch raw HTML of each target route
    const fetchPromises = targetPaths.map(async (path) => {
      try {
        const fullUrl = `${origin}${path}`;
        const res = await fetch(fullUrl, {
          signal: AbortSignal.timeout(4000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          redirect: 'follow'
        });

        if (!res.ok) return;
        const html = await res.text();

        // 1. Check mailto: links
        const mailtoMatches = html.matchAll(/href=["']mailto:([^"'\s?]+)["']/gi);
        for (const match of mailtoMatches) {
          if (match[1]) {
            const clean = match[1].trim().toLowerCase();
            if (isValidEmail(clean)) foundEmails.add(clean);
          }
        }

        // 2. Check regex in text
        const textMatches = html.match(EMAIL_REGEX);
        if (textMatches) {
          for (const raw of textMatches) {
            const clean = raw.trim().toLowerCase();
            if (isValidEmail(clean)) foundEmails.add(clean);
          }
        }
      } catch {}
    });

    await Promise.all(fetchPromises);

    const emailList = Array.from(foundEmails);
    if (emailList.length > 0) {
      // Prioritize info@, contact@, or hello@
      const priorityEmail = emailList.find(e => e.startsWith('contact@') || e.startsWith('info@') || e.startsWith('hello@')) || emailList[0];
      return {
        url: websiteUrl,
        email: priorityEmail,
        status: 'Verified Email',
        contactPageFound: true
      };
    }

    return {
      url: websiteUrl,
      email: null,
      status: 'Phone Only / No Email Found'
    };
  } catch (err) {
    return {
      url: websiteUrl,
      email: null,
      status: 'Phone Only / No Email Found'
    };
  }
}

function isValidEmail(email: string): boolean {
  if (!email || email.length < 5 || email.length > 64) return false;
  if (!EMAIL_REGEX.test(email)) return false;

  for (const ext of EXCLUDED_EXTENSIONS) {
    if (email.endsWith(ext)) return false;
  }

  const domain = email.split('@')[1];
  if (!domain || EXCLUDED_DOMAINS.includes(domain)) return false;

  return true;
}
