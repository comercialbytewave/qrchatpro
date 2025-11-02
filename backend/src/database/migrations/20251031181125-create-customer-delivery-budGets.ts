import { QueryInterface, DataTypes, DECIMAL } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("BudGetAdressRouters", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      budGetId: {
        type: DataTypes.INTEGER,
        references: { model: "Budgets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },       
      zipCode: {
        type: DataTypes.STRING(8),
        allowNull: false
      },
      address: {
        type: DataTypes.STRING(250),
        allowNull: false
      },
      number: {
        type: DataTypes.STRING(30),
        allowNull: true
      },
      complement: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      neighborhood: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      city: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
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
    return queryInterface.dropTable("BudGetAdressRouters");
  }
};
