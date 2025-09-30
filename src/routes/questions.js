const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/create', questionController.showCreateForm );

module.exports = router;