const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

//ensure that only authenticated users can access the create question form
router.use(authMiddleware.ensureAuth);

router.get("/", questionController.index);

router.get(
  "/create",
  authMiddleware.ensureAdmin,
  questionController.showCreateForm,
);
router.post(
  "/create",
  authMiddleware.ensureAdmin,
  questionController.createQuestion,
);

module.exports = router;
