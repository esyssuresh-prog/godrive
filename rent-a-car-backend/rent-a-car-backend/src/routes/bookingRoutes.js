import { Router } from 'express';
import { createBooking, getMyBookings, getOwnerBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { allowRoles, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.post('/', allowRoles('customer'), createBooking);
router.get('/my', allowRoles('customer'), getMyBookings);
router.get('/owner', allowRoles('owner'), getOwnerBookings);
router.patch('/:id/status', allowRoles('customer', 'owner'), updateBookingStatus);

export default router;
