const Score = require("../models/Score");
const User = require("../models/User");


exports.addScore = async (req, res)=> {
   
    try{
        const score = req.body.score;
        const userId = req.session.userId;
        const newScore = await Score.create({ score, user_id: userId });
        res.status(201).json(newScore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}





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
 
