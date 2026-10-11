import express from 'express';
import { db } from '../index';
import { scraperQueue } from '../services/scraperQueue';

const router = express.Router();

router.get('/', async (req, res) => {
  const userId = req.headers.userid as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const leadsRef = db.collection('leads');
    const snapshot = await leadsRef.where('userId', '==', userId).limit(300).get();
    
    const leads = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    leads.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    res.json(leads);
  } catch (err) {
    console.error('[Leads] Error fetching leads:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manual Contact / Lead Creation
router.post('/', async (req, res) => {
  const userId = req.headers.userid as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { businessName, email, phone, category, location, website, status = 'New', tags = [], source = 'Manual Entry' } = req.body;
  if (!businessName && !email) {
    return res.status(400).json({ error: 'Business Name or Email is required' });
  }

  try {
    const leadsRef = db.collection('leads');
    const newLead = {
      userId,
      businessName: businessName || (email ? email.split('@')[0] : 'New Contact'),
      email: email || '',
      phone: phone || '',
      category: category || 'General B2B',
      location: location || '',
      website: website || '',
      status: status || 'New',
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      source,
      saved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await leadsRef.add(newLead);
    res.json({ _id: docRef.id, ...newLead });
  } catch (err: any) {
    console.error('Failed to create lead:', err);
    res.status(500).json({ error: err.message || 'Failed to create lead' });
  }
});

// Public Form Capture Endpoint (No auth header required so external website forms can submit!)
router.post('/form-submit/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, company, formId = 'website-embed' } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const leadsRef = db.collection('leads');
    const newLead = {
      userId,
      businessName: company || name || email.split('@')[0],
      email,
      phone: phone || '',
      category: 'Inbound Form',
      location: 'Website Inbound',
      website: '',
      status: 'New',
      tags: ['Inbound Lead', formId],
      source: `Form: ${formId}`,
      saved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await leadsRef.add(newLead);
    res.json({ success: true, message: 'Lead captured successfully!', id: docRef.id });
  } catch (err: any) {
    console.error('Failed to capture lead via form:', err);
    res.status(500).json({ error: 'Failed to capture lead' });
  }
});

router.post('/scrape', async (req, res) => {
  const userId = req.headers.userid as string;
  const { keyword, location, scope = 'quick' } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!keyword || !location) return res.status(400).json({ error: 'Keyword and Location required' });

  try {
    const userRef = db.collection('users').doc(userId);
    let creditsRemaining = 0;
    let userPlan = 'free';
    let poolRefreshedAt = new Date().toISOString();
    const computeCost = scope === 'deep' ? 2 : 1;

    // Deduct via Transaction with 4-day auto-refresh check
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      if (!doc.exists) throw new Error("User not found");
      const data = doc.data()!;
      userPlan = data.plan || 'free';
      poolRefreshedAt = data.pool_refreshed_at || new Date().toISOString();

      let currentCredits = data.lead_credits || 0;

      // Check 4-day auto-refresh for free tier
      if (userPlan === 'free') {
        const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
        const lastRefresh = data.pool_refreshed_at ? new Date(data.pool_refreshed_at).getTime() : 0;
        if (Date.now() - lastRefresh >= fourDaysMs) {
          currentCredits = 50;
          poolRefreshedAt = new Date().toISOString();
          t.update(userRef, {
            lead_credits: 50,
            pool_refreshed_at: poolRefreshedAt
          });
        }
      }

      if (currentCredits < computeCost) {
        throw new Error("Insufficient credits");
      }
      
      creditsRemaining = currentCredits - computeCost;
      t.update(userRef, { 
        lead_credits: creditsRemaining,
        pool_refreshed_at: poolRefreshedAt
      });
    });
    
    // Compute max query limit according to tier
    // Free Tier: 10 leads max per query/tag
    // Basic / Pro: up to 20 per batch
    const limit = userPlan === 'free' ? 10 : 20;
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    scraperQueue.add({ 
      id: jobId,
      userId, 
      keyword, 
      location, 
      scope, 
      limit 
    });
    
    res.json({ 
      message: 'Scraping started via Lead Finder Wizard', 
      jobId,
      creditsRemaining,
      plan: userPlan,
      poolRefreshedAt,
      limit
    });
  } catch (err: any) {
    if (err.message === "Insufficient credits") {
      return res.status(403).json({ error: 'Insufficient credits', needsTopUp: true });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/job-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const status = scraperQueue.getJobStatus(jobId);
  if (!status) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(status);
});

router.get('/active-job', (req, res) => {
  const userId = req.headers.userid as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const activeJob = scraperQueue.getActiveJobForUser(userId);
  res.json({ activeJob: activeJob || null });
});

// Batch Save / Update Leads
router.post('/batch-save', async (req, res) => {
  try {
    const userId = req.headers.userid as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { ids, all, saved = true } = req.body;

    const leadsRef = db.collection('leads');
    let docRefs: FirebaseFirestore.DocumentReference[] = [];

    if (all) {
      const snapshot = await leadsRef.where('userId', '==', userId).get();
      docRefs = snapshot.docs.map(d => d.ref);
    } else if (Array.isArray(ids) && ids.length > 0) {
      docRefs = ids.map(id => leadsRef.doc(id));
    }

    if (docRefs.length > 0) {
      // Chunk in 400s for Firestore batch limit
      const chunkSize = 400;
      for (let i = 0; i < docRefs.length; i += chunkSize) {
        const chunk = docRefs.slice(i, i + chunkSize);
        const batch = db.batch();
        chunk.forEach(ref => {
          batch.update(ref, { saved, updatedAt: new Date().toISOString() });
        });
        await batch.commit();
      }
    }

    res.json({ success: true, count: docRefs.length });
  } catch (err: any) {
    console.error('Failed to batch save leads:', err);
    res.status(500).json({ error: err.message || 'Failed to batch save leads' });
  }
});

// Batch Delete Specific Leads
router.post('/batch-delete', async (req, res) => {
  try {
    const userId = req.headers.userid as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No lead IDs provided' });
    }

    const leadsRef = db.collection('leads');
    const chunkSize = 400;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const batch = db.batch();
      chunk.forEach(id => {
        batch.delete(leadsRef.doc(id));
      });
      await batch.commit();
    }

    res.json({ success: true, deleted: ids.length });
  } catch (err: any) {
    console.error('Failed to batch delete leads:', err);
    res.status(500).json({ error: err.message || 'Failed to batch delete leads' });
  }
});

// Delete All User Leads
router.delete('/all', async (req, res) => {
  try {
    const userId = req.headers.userid as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const leadsRef = db.collection('leads');
    const snapshot = await leadsRef.where('userId', '==', userId).get();
    
    if (snapshot.docs.length > 0) {
      const chunkSize = 400;
      for (let i = 0; i < snapshot.docs.length; i += chunkSize) {
        const chunk = snapshot.docs.slice(i, i + chunkSize);
        const batch = db.batch();
        chunk.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    }

    res.json({ success: true, deleted: snapshot.docs.length });
  } catch (err: any) {
    console.error('Failed to delete all leads:', err);
    res.status(500).json({ error: err.message || 'Failed to delete all leads' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const updates = req.body;
    const docRef = db.collection('leads').doc(id);
    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await docRef.get();
    res.json({ success: true, lead: { _id: id, ...updatedDoc.data() }, message: 'Lead updated successfully' });
  } catch (err: any) {
    console.error('Failed to update lead:', err);
    res.status(500).json({ error: err.message || 'Failed to update lead' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await db.collection('leads').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
