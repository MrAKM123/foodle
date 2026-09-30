import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

router.use(authenticate);

// Profile
router.put('/profile', validateBody(updateProfileSchema), UserController.updateProfile);

// Saved Addresses
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.addAddress);
router.delete('/addresses/:id', UserController.deleteAddress);

export default router;
