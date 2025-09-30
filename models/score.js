'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Score extends Model {
        /**
         * Helper method for defining associations.
         */
        static associate(models) {
            // A Score belongs to a User
            Score.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    Score.init(
        {
            score: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            theme: {
                type: DataTypes.STRING,
                allowNull: false
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            played_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            sequelize,
            modelName: 'Score',
            tableName: 'Scores'
        }
    );

    return Score;
};
