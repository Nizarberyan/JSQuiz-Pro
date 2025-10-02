"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      // associations can be defined here
    }
  }

  Image.init(
    {
      theme: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Image",
      tableName: "Images",
    }
  );

  return Image;
};