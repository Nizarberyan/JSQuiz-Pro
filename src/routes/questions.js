const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
router.use(authMiddleware.ensureAuth)
router.get('/create', questionController.showCreateForm );
router.post('/create', authMiddleware.ensureAdmin, questionController.createQuestion );



module.exports = router;