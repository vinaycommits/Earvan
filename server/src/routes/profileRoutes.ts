import { Router } from 'express';
import { updateProfile } from '../controllers/profileController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.put('/profile', protect, updateProfile);

export default router;
