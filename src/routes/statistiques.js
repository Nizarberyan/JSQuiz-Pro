const express = require("express");
const router = express.Router();
const statistiqueController = require("../controllers/statistiquesController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/dashboard", authMiddleware.ensureAuth, statistiqueController.getUserDashboard);

module.exports = router;

