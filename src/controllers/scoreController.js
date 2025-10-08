const { Score, User, Question } = require("../../models");


// function to calculate and save score
exports.calculateScore = async (req, res) => {
    try {
        const { userId, theme, answers } = req.body;
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

// exports.checkAnswers = (question, userAnswer) => {
//     // question.correctAnswer peut être une string ou un tableau
//     const correct = question.correctAnswer;

//     // s'assurer que userAnswer est un tableau pour la comparaison
//     const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

//     // comparaison selon le type de correctAnswer
//     if (Array.isArray(correct)) {
//         // tri pour éviter les différences d'ordre
//         const sortedCorrect = correct.slice().sort();
//         const sortedUser = userAnswers.slice().sort();

//         // vrai si toutes les réponses correctes sont choisies et aucune en trop
//         return JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);
//     } else {
//         // simple réponse
//         return correct == userAnswer;
//     }
// };


exports.getMyScores = async (req, res) => {
    try {
        const userId = req.session.userId || req.user?.id;

        if (!userId) {
            return res.redirect('/auth/login');
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.redirect('/auth/login');
        }

        const scores = await Score.findAll({
            where: { user_id: userId },
            order: [["played_at", "DESC"]]
        });

        const scoresWithDetails = await Promise.all(
            scores.map(async (score) => {
                const totalQuestions = await Question.count({ where: { theme: score.theme } });
                const percentage = totalQuestions > 0 ? ((score.score / totalQuestions) * 100).toFixed(2) : 0;
                return {
                    theme: score.theme,
                    score: score.score,
                    total: totalQuestions,
                    percentage,
                    played_at: score.played_at
                };
            })
        );

        res.render('user/history', {
            scores: scoresWithDetails,
            userId: req.session.userId,
            userRole: req.session.userRole
        });

    } catch (err) {
        console.error("Error fetching scores:", err);
        res.status(500).send('Error loading history');
    }
};


