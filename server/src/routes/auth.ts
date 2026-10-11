import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../index';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/google', async (req, res) => {
  const { googleId, email, name } = req.body;
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    let userDoc: any;
    let userId: string;
    
    if (snapshot.empty) {
      // Auto-assign SUPER_ADMIN
      const role = email === 'ashleyghose64@gmail.com' ? 'SUPER_ADMIN' : 'USER';
      const newUser = {
        googleId,
        email,
        name,
        role,
        lead_credits: 15,
        plan: 'free',
        pool_refreshed_at: new Date().toISOString(),
        onboarding_complete: false,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await usersRef.add(newUser);
      userId = docRef.id;
      userDoc = { _id: userId, ...newUser };
    } else {
      userId = snapshot.docs[0].id;
      const data = snapshot.docs[0].data();
      // Check 4-day auto-refresh for free tier
      const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
      const lastRefresh = data.pool_refreshed_at ? new Date(data.pool_refreshed_at).getTime() : 0;
      if ((data.plan || 'free') === 'free' && (Date.now() - lastRefresh >= fourDaysMs || !data.pool_refreshed_at)) {
        await snapshot.docs[0].ref.update({
          lead_credits: 15,
          pool_refreshed_at: new Date().toISOString()
        });
        data.lead_credits = 15;
        data.pool_refreshed_at = new Date().toISOString();
      }
      userDoc = { _id: userId, ...data };
    }
    
    const token = jwt.sign({ id: userId, role: userDoc.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: userDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/onboarding', async (req, res) => {
  const { userId, company_name, field_of_work, niche, target_audience, goals } = req.body;
  
  try {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await userRef.update({
      company_name,
      field_of_work,
      niche: niche || field_of_work || '',
      target_audience: target_audience || '',
      goals: goals || '',
      onboarding_complete: true
    });
    
    const updated = await userRef.get();
    res.json({ _id: updated.id, ...updated.data() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

import bcrypt from 'bcrypt';

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'User already exists. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === 'ashleyghose64@gmail.com' ? 'SUPER_ADMIN' : 'USER';
    
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role,
      lead_credits: 15,
      plan: 'free',
      pool_refreshed_at: new Date().toISOString(),
      onboarding_complete: false,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await usersRef.add(newUser);
    const userDoc = { _id: docRef.id, ...newUser };
    // Dont send back password to client
    delete (userDoc as any).password;
    
    const token = jwt.sign({ id: docRef.id, role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: userDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const doc = snapshot.docs[0];
    const userDoc = { _id: doc.id, ...doc.data() } as any;
    
    if (!userDoc.password) {
      return res.status(400).json({ error: 'Please use Login with Google.' });
    }
    
    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Auto-refresh free tier pool every 4 days
    const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
    const lastRefresh = userDoc.pool_refreshed_at ? new Date(userDoc.pool_refreshed_at).getTime() : 0;
    if ((userDoc.plan || 'free') === 'free' && (Date.now() - lastRefresh >= fourDaysMs || !userDoc.pool_refreshed_at)) {
      await doc.ref.update({
        lead_credits: 15,
        pool_refreshed_at: new Date().toISOString()
      });
      userDoc.lead_credits = 15;
      userDoc.pool_refreshed_at = new Date().toISOString();
    }
    
    delete userDoc.password;
    const token = jwt.sign({ id: userDoc._id, role: userDoc.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: userDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/profile', async (req, res) => {
  const userId = req.headers.userid as string;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { 
    name, 
    company_name, 
    field_of_work, 
    phone,
    smtp_settings,
    outreach_defaults,
    niche,
    target_audience,
    goals,
    profile_picture
  } = req.body;

  try {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (company_name !== undefined) updates.company_name = company_name;
    if (field_of_work !== undefined) updates.field_of_work = field_of_work;
    if (phone !== undefined) updates.phone = phone;
    if (smtp_settings !== undefined) updates.smtp_settings = smtp_settings;
    if (outreach_defaults !== undefined) updates.outreach_defaults = outreach_defaults;
    if (niche !== undefined) updates.niche = niche;
    if (target_audience !== undefined) updates.target_audience = target_audience;
    if (goals !== undefined) updates.goals = goals;
    if (profile_picture !== undefined) updates.profile_picture = profile_picture;
    
    updates.updatedAt = new Date().toISOString();

    await userRef.update(updates);
    const updatedDoc = await userRef.get();
    const userData = { _id: updatedDoc.id, ...updatedDoc.data() };
    delete (userData as any).password;

    res.json({ message: 'Profile updated successfully', user: userData });
  } catch (err) {
    console.error('Failed to update profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
