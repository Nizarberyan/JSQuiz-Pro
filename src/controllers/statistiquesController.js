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

    // Badge
    let badge = "Débutant";
    if (totalGames >= 10 && avgScore.avg_score >= 80) badge = "Expert";
    else if (avgScore.avg_score >= 50) badge = "Intermédiaire";

    res.json({
      success: true,
      stats: {
        avgScore: Number(avgScore.avg_score || 0).toFixed(2),
        totalGames,
        history,
        repartition,
        badge
      }
    });

  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
