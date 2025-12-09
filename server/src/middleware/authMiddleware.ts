import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const token = auth.split(' ')[1];
  const secret = 'super-secret-key-change-later-8f3a1c4b9e';
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET not set' });
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: string };
    (req as any).userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
