export interface LeadData {
  _id?: string;
  businessName: string;
  location: string;
  category?: string;
  fieldOfWork?: string;
  firstName?: string;
  phone?: string;
  rating?: string;
  email?: string;
}

export interface TemplateStyling {
  containerWidth?: string;
  spacingPadding?: string;
  accentColor?: string;
  borderRadius?: string;
  showComplianceFooter?: boolean;
}

export interface TemplatePayload {
  templateId: string;
  templateData: Record<string, any>;
  templateStyling?: TemplateStyling;
}

export function replaceMergeTags(text: string | undefined, lead: LeadData): string {
  if (!text) return '';
  const firstName = lead.firstName || (lead.businessName ? lead.businessName.split(' ')[0] : 'Partner');
  const fieldOfWork = lead.fieldOfWork || lead.category || 'Local Business';
  const location = lead.location || 'Local Area';
  const phone = lead.phone || 'N/A';
  const rating = lead.rating || '4.8';

  return text
    .replace(/{{business_name}}/g, lead.businessName)
    .replace(/{{location}}/g, location)
    .replace(/{{field_of_work}}/g, fieldOfWork)
    .replace(/{{first_name}}/g, firstName)
    .replace(/{{phone}}/g, phone)
    .replace(/{{rating}}/g, rating);
}

export function compileEmailHtml(payload: TemplatePayload, lead: LeadData): { subject: string; html: string; text: string } {
  const { templateId, templateData, templateStyling = {} } = payload;
  const accentColor = templateStyling.accentColor || '#4F46E5';
  const borderRadius = templateStyling.borderRadius || '16px';
  const showFooter = templateStyling.showComplianceFooter !== false;

  const subject = replaceMergeTags(templateData.subject || 'Special B2B Proposal for {{business_name}}', lead);
  const headline = replaceMergeTags(templateData.headline || '', lead);
  const subheadline = replaceMergeTags(templateData.subheadline || '', lead);
  const body = replaceMergeTags(templateData.body || '', lead);
  const ctaText = replaceMergeTags(templateData.ctaText || '', lead);
  const ctaUrl = templateData.ctaUrl || 'https://leadpulse.io';

  const recipientEmail = lead.email || `contact@${lead.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;

  const complianceFooterHtml = showFooter ? `
    <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #E4E4E7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #71717A; text-align: center; line-height: 1.6;">
      <p style="margin: 0 0 6px 0;">
        You received this verified direct outreach because <strong>${lead.businessName}</strong> operates in the ${lead.category || lead.fieldOfWork || 'local'} commercial sector across ${lead.location}.
      </p>
      <p style="margin: 0;">
        Sent via LeadPulse Direct Dispatch Engine &bull; 
        <a href="https://leadpulse.io/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: #71717A; text-decoration: underline;">Unsubscribe</a> &bull; 
        <a href="https://leadpulse.io/privacy" style="color: #71717A; text-decoration: underline;">Privacy Policy</a> &bull; 
        CAN-SPAM &amp; GDPR Compliant
      </p>
    </div>
  ` : '';

  let bodyContent = '';

  switch (templateId) {
    case 'text_only':
      bodyContent = `
        <div style="padding: 24px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #18181B;">
          <div style="margin-bottom: 20px;">
            <span style="background: #09090B; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.5px;">LP DIRECT</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 16px 0; color: #09090B;">${headline}</h2>
          <div style="white-space: pre-wrap; margin-bottom: 24px;">${body}</div>
          ${ctaText ? `
            <div style="margin-top: 24px;">
              <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
                ${ctaText} &rarr;
              </a>
            </div>
          ` : ''}
        </div>
      `;
      break;

    case 'one_column':
      bodyContent = `
        <div style="padding: 32px 24px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="width: 44px; height: 44px; background: ${accentColor}; color: #FFFFFF; font-weight: 900; font-size: 16px; line-height: 44px; border-radius: 12px; margin: 0 auto 20px auto;">
            LP
          </div>
          <h1 style="font-size: 22px; font-weight: 900; color: #09090B; margin: 0 0 8px 0; line-height: 1.3;">${headline}</h1>
          ${subheadline ? `<p style="font-size: 13px; color: #71717A; margin: 0 0 24px 0; font-weight: 500;">${subheadline}</p>` : ''}

          <div style="background: linear-gradient(135deg, #4338CA 0%, ${accentColor} 50%, #7C3AED 100%); border-radius: 14px; padding: 28px 20px; color: #FFFFFF; margin: 0 0 24px 0; text-align: center;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 20px; display: inline-block; margin-bottom: 10px;">
              ${lead.location} Growth Focus
            </div>
            <h3 style="font-size: 18px; font-weight: 800; margin: 0;">${lead.category || lead.fieldOfWork || 'Commercial Growth'} Suite</h3>
          </div>

          <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #27272A; white-space: pre-wrap; margin-bottom: 28px;">
            ${body}
          </div>

          ${ctaText ? `
            <div>
              <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 13px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                ${ctaText}
              </a>
            </div>
          ` : ''}
        </div>
      `;
      break;

    case 'two_column':
      const col1Title = replaceMergeTags(templateData.col1Title || 'Service Pipeline A', lead);
      const col1Body = replaceMergeTags(templateData.col1Body || '', lead);
      const col1Cta = replaceMergeTags(templateData.col1Cta || 'Explore Track A', lead);
      const col2Title = replaceMergeTags(templateData.col2Title || 'Service Pipeline B', lead);
      const col2Body = replaceMergeTags(templateData.col2Body || '', lead);
      const col2Cta = replaceMergeTags(templateData.col2Cta || 'Explore Track B', lead);

      bodyContent = `
        <div style="padding: 28px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h1 style="font-size: 20px; font-weight: 900; color: #09090B; margin: 0 0 10px 0; text-align: center;">${headline}</h1>
          <div style="font-size: 13px; line-height: 1.6; color: #52525B; margin-bottom: 24px; text-align: center;">${body}</div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td width="48%" valign="top" style="background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 12px; padding: 16px;">
                <h3 style="font-size: 14px; font-weight: 800; color: #09090B; margin: 0 0 8px 0;">${col1Title}</h3>
                <p style="font-size: 12px; color: #52525B; line-height: 1.5; margin: 0 0 14px 0;">${col1Body}</p>
                <a href="${ctaUrl}" style="background: #09090B; color: #FFFFFF; font-size: 11px; font-weight: 700; text-decoration: none; padding: 8px 14px; border-radius: 6px; display: inline-block;">
                  ${col1Cta}
                </a>
              </td>
              <td width="4%"></td>
              <td width="48%" valign="top" style="background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 12px; padding: 16px;">
                <h3 style="font-size: 14px; font-weight: 800; color: #09090B; margin: 0 0 8px 0;">${col2Title}</h3>
                <p style="font-size: 12px; color: #52525B; line-height: 1.5; margin: 0 0 14px 0;">${col2Body}</p>
                <a href="${ctaUrl}" style="background: ${accentColor}; color: #FFFFFF; font-size: 11px; font-weight: 700; text-decoration: none; padding: 8px 14px; border-radius: 6px; display: inline-block;">
                  ${col2Cta}
                </a>
              </td>
            </tr>
          </table>
        </div>
      `;
      break;

    case 'inverted_pyramid':
      bodyContent = `
        <div style="padding: 32px 24px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: #F4F4F5; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: 900; color: #09090B; margin: 0 0 10px 0;">${headline}</h1>
            <p style="font-size: 13px; color: #52525B; margin: 0; line-height: 1.5;">${subheadline || 'Targeted Value Proposition for ' + lead.businessName}</p>
          </div>

          <div style="max-width: 440px; margin: 0 auto 28px auto; font-size: 14px; line-height: 1.6; color: #27272A; white-space: pre-wrap;">
            ${body}
          </div>

          <div style="margin-bottom: 12px;">
            <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 14px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);">
              ${ctaText || 'Claim Strategic Access'} &rarr;
            </a>
          </div>
          <span style="font-size: 11px; color: #A1A1AA;">No long-term commitment &bull; Instant activation in ${lead.location}</span>
        </div>
      `;
      break;

    case 'zig_zag':
      const zig1Title = replaceMergeTags(templateData.zig1Title || 'Phase 1: Precision Scouting', lead);
      const zig1Text = replaceMergeTags(templateData.zig1Text || 'Automated data enrichment identifies high-probability buyers.', lead);
      const zig2Title = replaceMergeTags(templateData.zig2Title || 'Phase 2: Verified Conversion', lead);
      const zig2Text = replaceMergeTags(templateData.zig2Text || 'Multi-channel touchpoints ensure direct delivery into inbox.', lead);

      bodyContent = `
        <div style="padding: 28px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h1 style="font-size: 20px; font-weight: 900; color: #09090B; text-align: center; margin: 0 0 8px 0;">${headline}</h1>
          <p style="font-size: 13px; color: #71717A; text-align: center; margin: 0 0 24px 0;">${body}</p>

          <!-- Block 1 -->
          <div style="background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 12px; padding: 16px; margin-bottom: 14px;">
            <span style="font-size: 10px; font-weight: 800; color: ${accentColor}; text-transform: uppercase;">01 / STEP ONE</span>
            <h3 style="font-size: 15px; font-weight: 800; color: #09090B; margin: 4px 0 6px 0;">${zig1Title}</h3>
            <p style="font-size: 12px; color: #52525B; line-height: 1.5; margin: 0;">${zig1Text}</p>
          </div>

          <!-- Block 2 -->
          <div style="background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">02 / STEP TWO</span>
            <h3 style="font-size: 15px; font-weight: 800; color: #09090B; margin: 4px 0 6px 0;">${zig2Title}</h3>
            <p style="font-size: 12px; color: #52525B; line-height: 1.5; margin: 0;">${zig2Text}</p>
          </div>

          <div style="text-align: center;">
            <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; display: inline-block;">
              ${ctaText || 'Get Started Now'}
            </a>
          </div>
        </div>
      `;
      break;

    case 'f_pattern':
      const fBullet1 = replaceMergeTags(templateData.fBullet1 || 'Instant verification across 50+ data sources', lead);
      const fBullet2 = replaceMergeTags(templateData.fBullet2 || 'Direct-to-inbox routing with zero intermediary clipping', lead);
      const fBullet3 = replaceMergeTags(templateData.fBullet3 || 'Automated CRM pipeline sync for ' + lead.businessName, lead);

      bodyContent = `
        <div style="padding: 28px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h1 style="font-size: 22px; font-weight: 900; color: #09090B; margin: 0 0 14px 0; border-left: 4px solid ${accentColor}; padding-left: 12px;">
            ${headline}
          </h1>
          <p style="font-size: 13px; color: #52525B; line-height: 1.6; margin: 0 0 20px 0;">${body}</p>

          <div style="background: #F4F4F5; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <div style="margin-bottom: 10px; font-size: 13px; color: #18181B; font-weight: 600;">
              <span style="color: ${accentColor}; font-weight: 800; margin-right: 8px;">&bull;</span> ${fBullet1}
            </div>
            <div style="margin-bottom: 10px; font-size: 13px; color: #18181B; font-weight: 600;">
              <span style="color: ${accentColor}; font-weight: 800; margin-right: 8px;">&bull;</span> ${fBullet2}
            </div>
            <div style="font-size: 13px; color: #18181B; font-weight: 600;">
              <span style="color: ${accentColor}; font-weight: 800; margin-right: 8px;">&bull;</span> ${fBullet3}
            </div>
          </div>

          <div>
            <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; display: inline-block;">
              ${ctaText || 'Learn More'}
            </a>
          </div>
        </div>
      `;
      break;

    case 'dynamic_product_feed':
      const products = templateData.products || [
        { name: 'Starter Harvest', category: '100 Leads', price: '₹699', badge: 'Popular', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80' },
        { name: 'Pro Scale Harvest', category: '1,000 Leads', price: '₹1,999', badge: 'High Volume', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80' }
      ];

      // Chunk products into rows of 2 or 3 for email table compatibility
      const itemsPerRow = products.length === 4 ? 2 : products.length <= 2 ? products.length : 3;
      const productRows: any[][] = [];
      for (let i = 0; i < products.length; i += itemsPerRow) {
        productRows.push(products.slice(i, i + itemsPerRow));
      }

      bodyContent = `
        <div style="padding: 28px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h1 style="font-size: 20px; font-weight: 900; color: #09090B; text-align: center; margin: 0 0 8px 0;">${headline}</h1>
          <p style="font-size: 13px; color: #71717A; text-align: center; margin: 0 0 24px 0;">${body}</p>

          ${productRows.map(row => `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
              <tr>
                ${row.map((p: any) => `
                  <td width="${Math.floor(100 / row.length)}%" valign="top" style="padding: 0 6px 12px 6px;">
                    <div style="background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; padding: 14px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                      ${p.imageUrl ? `
                        <div style="margin-bottom: 10px; border-radius: 8px; overflow: hidden; height: 110px; background: #F4F4F5;">
                          <img src="${p.imageUrl}" alt="${p.name}" width="100%" height="110" style="width: 100%; height: 110px; object-fit: cover; display: block; border-radius: 8px;" />
                        </div>
                      ` : ''}
                      ${p.badge ? `<span style="font-size: 9px; font-weight: 800; color: #FFFFFF; background: ${accentColor}; padding: 2px 8px; border-radius: 12px; text-transform: uppercase;">${p.badge}</span>` : ''}
                      <h4 style="font-size: 13px; font-weight: 800; color: #09090B; margin: 8px 0 3px 0;">${p.name}</h4>
                      ${p.category ? `<p style="font-size: 10px; color: #71717A; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 600;">${p.category}</p>` : ''}
                      ${p.description ? `<p style="font-size: 11px; color: #52525B; margin: 0 0 8px 0; line-height: 1.3;">${p.description}</p>` : ''}
                      <div style="font-size: 16px; font-weight: 900; color: ${accentColor}; margin-bottom: 10px;">${p.price}</div>
                      <a href="${p.ctaUrl || ctaUrl || '#'}" style="background: #09090B; color: #FFFFFF; font-size: 11px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 8px; display: inline-block;">
                        ${p.ctaText || 'Select Plan'}
                      </a>
                    </div>
                  </td>
                `).join('')}
              </tr>
            </table>
          `).join('')}

          ${ctaText ? `
            <div style="text-align: center; margin-top: 16px;">
              <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; display: inline-block;">
                ${ctaText}
              </a>
            </div>
          ` : ''}
        </div>
      `;
      break;

    default: // hybrid or general fallback
      bodyContent = `
        <div style="padding: 28px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h1 style="font-size: 22px; font-weight: 900; color: #09090B; margin: 0 0 12px 0;">${headline}</h1>
          <div style="font-size: 13px; line-height: 1.6; color: #27272A; white-space: pre-wrap; margin-bottom: 24px;">${body}</div>
          ${ctaText ? `
            <div>
              <a href="${ctaUrl}" style="background-color: ${accentColor}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; display: inline-block;">
                ${ctaText}
              </a>
            </div>
          ` : ''}
        </div>
      `;
      break;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #F4F4F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F4F5;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: ${borderRadius}; border: 1px solid #E4E4E7; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
              <tr>
                <td>
                  ${bodyContent}
                  ${complianceFooterHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html, text: body };
}
