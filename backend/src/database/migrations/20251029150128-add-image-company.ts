import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
       
    return queryInterface.addColumn("Companies", "mediaName", {
      type: DataTypes.STRING,
      allowNull: true,
    }),
    queryInterface.addColumn("Companies", "mediaPath", {
      type: DataTypes.TEXT,
      allowNull: true,
    }),
    queryInterface.addColumn('Companies', 'token', {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Companies", "mediaName"),
    queryInterface.removeColumn("Companies", "mediaPath"),
    queryInterface.removeColumn("Companies", "token")
  }
};

