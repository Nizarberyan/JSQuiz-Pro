const { Question } = require('../../models');

async function index(req, res) {
  try {
    const themes = await Question.findAll({
      attributes: ['theme'],
      group: ['theme'],
      raw: true
    });
    res.render('quiz/index', { themes, userId: req.session.userId });
  } catch (error) {
    res.status(500).render('error', { error: 'Failed to load themes' });
  }
}

function createQuestion(req, res) {
  console.log("create question");
}

function showCreateForm(req, res) {
  res.render("admin/create-quiz");
}

function showQuestion(req, res) {}

module.exports = { index, showCreateForm, createQuestion };
