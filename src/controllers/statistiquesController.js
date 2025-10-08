const { Score, Sequelize, User, Question } = require("../../models");

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.session.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Vérifier l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Récupérer les scores de l'utilisateur
    const scores = await Score.findAll({
      where: { user_id: userId },
      order: [["played_at", "DESC"]],
      raw: true
    });

    // Calcul des pourcentages selon le nombre de questions dans le thème
    const quizStats = await Promise.all(
      scores.map(async (score) => {
        // Compter les questions de ce thème
        const totalQuestions = await Question.count({ where: { theme: score.theme } });
        const percentage = totalQuestions > 0 ? (score.score / totalQuestions) * 100 : 0;
        return {
          theme: score.theme,
          score: percentage.toFixed(2),
          played_at: score.played_at
        };
      })
    );

    // Moyenne des scores
    const avgScoreValue = quizStats.length
      ? quizStats.reduce((acc, q) => acc + Number(q.score), 0) / quizStats.length
      : 0;

    // Meilleur score
    const bestScore = quizStats.length
      ? Math.max(...quizStats.map(q => Number(q.score)))
      : 0;

    const totalGames = quizStats.length;

    // Répartition moyenne par thème
    const repartition = await Promise.all(
      [...new Set(scores.map(s => s.theme))].map(async (theme) => {
        const themeScores = quizStats.filter(q => q.theme === theme);
        const avgTheme = themeScores.reduce((acc, q) => acc + Number(q.score), 0) / themeScores.length;
        return { theme, avg_score: avgTheme.toFixed(2) };
      })
    );

    // Classement global (top 5 joueurs)
    const topPlayers = await Score.findAll({
      attributes: [
        "user_id",
        [Sequelize.fn("AVG", Sequelize.col("score")), "avg_score"]
      ],
      include: [{
        model: User,
        as: "user",
        attributes: ["name"]
      }],
      group: ["user_id", "user.id", "user.name"],
      order: [[Sequelize.fn("AVG", Sequelize.col("score")), "DESC"]],
      raw: false
    });

    const topPlayersWithPercent = topPlayers.map(p => ({
      User: { name: p.user?.name || "Unknown" },
      avg_score: Number(p.dataValues.avg_score).toFixed(2)
    }));

    // Badge
    let badge = "Débutant";
    if (totalGames >= 10 && avgScoreValue >= 80) badge = "Expert";
    else if (avgScoreValue >= 50) badge = "Intermédiaire";

    // Rendre la vue EJS
    res.render("user/dashboard", {
      user: {
        name: user.name,
        email: user.email
      },
      stats: {
        avgScore: avgScoreValue.toFixed(2),
        bestScore: bestScore.toFixed(2),
        totalGames,
        history: quizStats.slice(0, 5),
        repartition,
        badge
      },
      topPlayers: topPlayersWithPercent
    });

  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
