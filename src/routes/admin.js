const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.ensureAuth);
router.use(authMiddleware.ensureAdmin);

router.get("/", questionController.showAdminDashboard);
router.get("/edit/:id", questionController.showEditQuestion);
router.post("/edit/:id", questionController.updateQuestion);

module.exports = router;
