const { Score, Sequelize, User } = require("../../models");

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.session.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Vérif user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Stats
    const avgScore = await Score.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("score")), "avg_score"]],
      where: { user_id: userId },
      raw: true
    });

    const totalGames = await Score.count({ where: { user_id: userId } });

    // Meilleur score
    const bestScoreResult = await Score.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("score")), "best_score"]],
      where: { user_id: userId },
      raw: true
    });

    const history = await Score.findAll({
      attributes: ["theme", "score", "played_at"],
      where: { user_id: userId },
      order: [["played_at", "DESC"]],
      limit: 5,
      raw: true
    });

    const repartition = await Score.findAll({
      attributes: ["theme", [Sequelize.fn("AVG", Sequelize.col("score")), "avg_score"]],
      where: { user_id: userId },
      group: ["theme"],
      raw: true
    });

    // Classement global (top 10 joueurs)
    const topPlayers = await Score.findAll({
      attributes: [
        "user_id",
        [Sequelize.fn("AVG", Sequelize.col("score")), "avg_score"]
      ],
      include: [{
        model: User,
        attributes: ["name"]
      }],
      group: ["user_id", "User.id", "User.name"],
      order: [[Sequelize.literal("avg_score"), "DESC"]],
      limit: 10,
      raw: false
    });

    // Badge
    let badge = "Débutant";
    const avgScoreValue = Number(avgScore.avg_score || 0);
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
        bestScore: Number(bestScoreResult?.best_score || 0).toFixed(2),
        totalGames,
        history,
        repartition,
        badge
      },
      topPlayers: topPlayers.map(p => ({
        User: { name: p.User.name },
        avg_score: p.dataValues.avg_score
      }))
    });

  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};