import express from 'express';
import controller from './controller';
import authMiddleware from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/', controller.admin);

router.post('/login', controller.login);
router.get('/logout', controller.logout);

router.use('/lists', authMiddleware);
router.get('/lists', controller.redirectLists);
router.get('/lists/:page', controller.lists);

export default router;
