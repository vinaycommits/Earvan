

import { Request, Response } from 'express';
import { User } from '../models/User';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // set in authMiddleware
    const userId = (req as any).userId as string;
    const { eqBands } = req.body;

    if (!eqBands) {
      return res.status(400).json({ message: 'Missing eqBands' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profile: { eqBands } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return exactly what frontend authService.updateProfile expects: a User object
    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      profile: user.profile || null
    });
  } catch (err) {
    console.error('updateProfile error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
