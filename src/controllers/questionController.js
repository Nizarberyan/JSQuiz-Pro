const { Question, Image } = require("../../models");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/quizzes/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function index(req, res) {
  try {
    const themes = await Question.findAll({
      attributes: ["theme"],
      group: ["theme"],
      raw: true,
    });
    
    const themesWithImages = await Promise.all(
      themes.map(async (theme) => {
        const images = await Image.findAll({
          where: { theme: theme.theme },
          attributes: ["imagePath"],
          raw: true
        });
        return {
          ...theme,
          images: images.map(img => img.imagePath)
        };
      })
    );
    
    res.render("quiz/index", {
      themes: themesWithImages,
      userId: req.session.userId,
      userRole: req.session.userRole,
    });
  } catch (error) {
    res.status(500).render("error", { error: "Failed to load themes" });
  }
}

async function createQuestion(req, res) {
  if (req.session.userRole !== "admin") {
    return res.redirect("/");
  }
  
  try {
    const { theme, question, option1, option2, option3, option4, correct } = req.body;
    let imagePath = null;
    
    if (req.file) {
      imagePath = `/images/quizzes/${req.file.filename}`;
      
      await Image.create({
        theme,
        imagePath
      });
    }
    
    await Question.create({
      theme,
      question,
      options: [option1, option2, option3, option4],
      correctAnswer: [parseInt(correct)]
    });
    
    res.redirect("/quizzes");
  } catch (error) {
    console.error(error);
    res.render("admin/create-quiz", {
      userId: req.session.userId,
      userRole: req.session.userRole,
      error: "Erreur lors de la création de la question"
    });
  }
}

async function createMultipleQuestions(req, res) {
  if (req.session.userRole !== "admin") {
    return res.redirect("/");
  }
  
  try {
    const { theme, questions } = req.body;
    
    if (req.file) {
      const imagePath = `/images/quizzes/${req.file.filename}`;
      await Image.create({ theme, imagePath });
    }
    
    const questionPromises = Object.values(questions).map(q => 
      Question.create({
        theme,
        question: q.question,
        options: [q.option1, q.option2, q.option3, q.option4],
        correctAnswer: [parseInt(q.correct)]
      })
    );
    
    await Promise.all(questionPromises);
    res.redirect("/quizzes");
  } catch (error) {
    console.error(error);
    res.render("admin/create-quiz", {
      userId: req.session.userId,
      userRole: req.session.userRole,
      error: "Erreur lors de la création des questions"
    });
  }
}

async function playQuiz(req, res) {
  try {
    const { theme } = req.params;
    const questions = await Question.findAll({
      where: { theme: decodeURIComponent(theme) },
      order: [['id', 'ASC']]
    });
    
    if (questions.length === 0) {
      return res.redirect('/quizzes');
    }
    
    const questionsWithoutAnswers = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));
    
    res.render('quiz/play', {
      theme: decodeURIComponent(theme),
      questions: questionsWithoutAnswers,
      userId: req.session.userId,
      userRole: req.session.userRole
    });
  } catch (error) {
    console.error(error);
    res.redirect('/quizzes');
  }
}

async function validateAnswer(req, res) {
  try {
    const { questionId, answer } = req.body;
    const question = await Question.findByPk(questionId);
    
    if (!question) {
      return res.json({ success: false, error: 'Question not found' });
    }
    
    const isCorrect = question.correctAnswer[0] === answer;
    res.json({ 
      success: true, 
      isCorrect,
      correctAnswer: question.correctAnswer[0]
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: 'Validation failed' });
  }
}

async function submitQuiz(req, res) {
  try {
    const { theme, answers, score } = req.body;
    
    const { Score } = require('../../models');
    await Score.create({
      score,
      theme,
      user_id: req.session.userId,
      played_at: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
}

function showCreateForm(req, res) {
  res.render("admin/create-quiz", {
    userId: req.session.userId,
    userRole: req.session.userRole,
  });
}

function showQuestion(req, res) {}

module.exports = { index, showCreateForm, createQuestion, createMultipleQuestions, playQuiz, validateAnswer, submitQuiz, upload };
