import { Request, Response, NextFunction } from 'express';
import { db } from '../index';

export const adminSecurity = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Secret Gateway Header Check
  const gatewayToken = req.headers['x-admin-gateway-token'];
  const expectedToken = process.env.ADMIN_GATEWAY_SECRET;

  if (!gatewayToken || gatewayToken !== expectedToken) {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing gateway token' });
  }

  // 2. IP Whitelisting Check
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip;
  const allowedIps = (process.env.ALLOWED_ADMIN_IPS || '127.0.0.1,::1').split(',').map(ip => ip.trim());
  
  // Extract just the IP part if it's IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  const normalizedIp = clientIp?.includes('::ffff:') ? clientIp.split('::ffff:')[1] : clientIp;

  if (normalizedIp && !allowedIps.includes(normalizedIp) && !allowedIps.includes(clientIp as string)) {
    // Also gracefully allow local loopback
    if (normalizedIp !== '127.0.0.1' && normalizedIp !== '::1') {
      return res.status(403).json({ error: 'Forbidden: IP not authorized' });
    }
  }

  // 3. Role & Token Validation
  // We'll assume the client sends userId in headers for now, or use a proper bearer token.
  // The existing code uses req.headers.userid
  const userId = req.headers.userid as string;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing User ID' });
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'Access Denied: User not found.' });
    }
    
    const role = userDoc.data()?.role;
    if (role !== 'superadmin' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Super Admin privileges required.' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth check failure' });
  }
};
