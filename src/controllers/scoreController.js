const { Score } = require("../../models");
const { User } = require("../../models");
const { Question } = require("../../models");


// exports.addScore = async (req, res) => {

//     try {
//     const { theme, score } = req.body;
//     const userId = req.session.userId; 
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const newScore = await Score.create({
//       user_id: userId,
//       theme,
//       score,
//     });

//     res.status(201).json(newScore);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
// function to calculate and save score
exports.calculateScore = async (req, res) => {
    try {
        const { userId, theme, answers } = req.body;
        /**
         * userId  → l'id de l'utilisateur
         * theme   → le thème joué (ex: "math", "science", ...)
         * answers → un objet/array contenant les réponses de l'utilisateur :
         *           { questionId: 1, answer: "..." }
         */

        if (!userId || !theme || !answers) {
            return res.status(400).json({
                success: false,
                message: "userId, theme and answers are required"
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Récupérer les questions du thème
        const questions = await Question.findAll({
            where: { theme }
        });

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No questions found for theme: ${theme}`
            });
        }

        let score = 0;

        // Calcul du score
        for (const q of questions) {
            // trouver la réponse de l'utilisateur pour cette question
            const userAnswer = answers.find(a => a.questionId === q.id);

            if (userAnswer) {
                // comparaison → les correctAnswer et options sont stockés en JSON
                // donc si c'est une seule réponse : q.correctAnswer = "A"
                // si plusieurs : q.correctAnswer = ["A","C"]
                const correct = Array.isArray(q.correctAnswer)
                    ? JSON.stringify(q.correctAnswer.sort()) === JSON.stringify([].concat(userAnswer.answer).sort())
                    : q.correctAnswer == userAnswer.answer;

                if (correct) {
                    score++;
                }
            }
        }

        // Sauvegarder dans la table Scores
        const newScore = await Score.create({
            score,
            theme,
            user_id: userId,
            played_at: new Date()
        });

        res.json({
            success: true,
            message: "Score calculated successfully",
            score,
            total: questions.length,
            data: newScore
        });

    } catch (err) {
        console.error("Error calculating score:", err);
        res.status(500).json({
            success: false,
            message: "Failed to calculate score"
        });
    }
};


exports.getUserScores = async (req, res) => {
    try {
        const userId = req.session.userId;


        const scores = await Score.findAll({
            where: { user_id: userId },
            order: [["date", "DESC"]],
        });

        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

