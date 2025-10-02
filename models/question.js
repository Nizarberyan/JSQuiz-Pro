"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of the Sequelize lifecycle.
     */
    static associate(models) {
      // Example: if Scores should be linked to Questions later
      // Question.hasMany(models.Score, { foreignKey: 'questionId' });
    }
  }

  Question.init(
    {
      theme: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      correctAnswer: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Question",
      tableName: "Questions",
    },
  );

  return Question;
};
