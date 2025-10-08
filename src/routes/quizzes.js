const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

//ensure that only authenticated users can access the create question form
router.use(authMiddleware.ensureAuth);
//ensure that only admin users can create a new question
router.use(["/create"], authMiddleware.ensureAdmin);

router.get("/", questionController.index);

router.post(
  "/create-multiple",
  authMiddleware.ensureAdmin,
  questionController.upload.single("quizImage"),
  questionController.createMultipleQuestions,
);
router.post("/delete/:id", authMiddleware.ensureAdmin, questionController.deleteQuestion);

router.get("/play/:theme", questionController.playQuiz);
router.post("/validate-answer", questionController.validateAnswer);
router.post("/submit", questionController.submitQuiz);

module.exports = router;
