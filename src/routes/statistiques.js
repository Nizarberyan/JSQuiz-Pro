const express = require("express");
const router = express.Router();
const statistiqueController = require("../controllers/statistiquesController");

router.get("/dashboard", statistiqueController.getUserDashboard);

module.exports = router;

