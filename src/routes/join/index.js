import express from 'express';
import controller from './controller';

const router = express.Router();

router.get('/', controller.join);

router.post('/registerJoin', controller.registerJoin);

router.get('/success', controller.success);

export default router;
