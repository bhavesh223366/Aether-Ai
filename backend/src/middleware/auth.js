import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // In dev, the token is simply the clerk userId passed from the frontend.
    // In production, we would use clerkClient.verifyToken(token).
    req.userId = token; 
    next();
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
