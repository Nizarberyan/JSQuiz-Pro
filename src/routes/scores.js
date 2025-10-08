const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// Middleware to ensure the user is authenticated
// const authMiddleware = require('../middleware/authMiddleware');
// router.use(authMiddleware.ensureAuth);

const authMiddleware = require('../middleware/authMiddleware');

router.post('/calculate', scoreController.calculateScore);
router.get('/history', authMiddleware.ensureAuth, scoreController.getMyScores);

module.exports = router;