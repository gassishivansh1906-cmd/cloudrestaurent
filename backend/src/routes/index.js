import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as menu from '../controllers/menuController.js';
import * as reservation from '../controllers/reservationController.js';
import * as order from '../controllers/orderController.js';
import * as contact from '../controllers/contactController.js';

const router = Router();

// ---- Auth ----
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.me);

// ---- Menu (public reads, admin writes) ----
router.get('/categories', menu.listCategories);
router.get('/menu', menu.listMenu);
router.post('/menu', authenticate, requireAdmin, menu.createMenuItem);
router.delete('/menu/:id', authenticate, requireAdmin, menu.deleteMenuItem);

// ---- Reservations ----
router.post('/reservations', reservation.createReservation);
router.get('/reservations', authenticate, requireAdmin, reservation.listReservations);
router.patch('/reservations/:id', authenticate, requireAdmin, reservation.updateReservationStatus);

// ---- Orders ----
router.post('/orders', order.createOrder);
router.get('/orders', authenticate, requireAdmin, order.listOrders);

// ---- Contact ----
router.post('/contact', contact.createMessage);
router.get('/contact', authenticate, requireAdmin, contact.listMessages);

export default router;
