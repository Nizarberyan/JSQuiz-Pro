const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// Middleware to ensure the user is authenticated
// const authMiddleware = require('../middleware/authMiddleware');
// router.use(authMiddleware.ensureAuth);

router.post('/calculate', scoreController.calculateScore);



module.exports = router;