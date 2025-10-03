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

function showCreateForm(req, res) {
  res.render("admin/create-quiz", {
    userId: req.session.userId,
    userRole: req.session.userRole,
  });
}

function showQuestion(req, res) {}

module.exports = { index, showCreateForm, createQuestion, upload };
