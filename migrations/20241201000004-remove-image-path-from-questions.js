'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Questions', 'imagePath');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Questions', 'imagePath', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};