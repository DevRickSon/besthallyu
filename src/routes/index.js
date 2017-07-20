import express from 'express';
import join from './join';
import admin from './admin';

const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/join');
});

router.use('/join', join);
router.use('/admin', admin);

export default router;
