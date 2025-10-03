const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

//ensure that only authenticated users can access the create question form
router.use(authMiddleware.ensureAuth);
//ensure that only admin users can create a new question
router.use(["/create"], authMiddleware.ensureAdmin);

router.get("/", questionController.index);

router.get("/create", questionController.showCreateForm);
router.post(
  "/create",
  questionController.upload.single("quizImage"),
  questionController.createQuestion,
);

module.exports = router;
