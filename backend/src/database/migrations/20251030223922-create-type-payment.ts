import { QueryInterface, DataTypes, DECIMAL } from "sequelize";
import Contact from "../../models/Contact";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("TypePayments", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      change: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      
      installments: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },      
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("TypePayments");
  }
};
