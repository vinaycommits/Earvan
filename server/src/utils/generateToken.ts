import jwt from 'jsonwebtoken';
import { UserDoc } from '../models/User';

export const generateToken = (user: UserDoc) => {
  const secret = 'super-secret-key-change-later-8f3a1c4b9e';
  if (!secret) {
    throw new Error('JWT_SECRET not set');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    },
    secret,
    { expiresIn: '7d' }
  );
};
