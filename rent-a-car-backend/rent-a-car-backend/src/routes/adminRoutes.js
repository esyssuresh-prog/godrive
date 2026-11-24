import { Router } from 'express';
import { allowRoles, protect } from '../middleware/auth.js';
import { getAdminSummary, getAdminUsers, getAdminCars, getAdminBookings } from '../controllers/adminController.js';

const router = Router();
router.use(protect, allowRoles('admin'));
router.get('/summary', getAdminSummary);
router.get('/users', getAdminUsers);
router.get('/cars', getAdminCars);
router.get('/bookings', getAdminBookings);
export default router;
