import { QueryInterface, DataTypes, DECIMAL } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("BudGetNegotiations", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(60),
        allowNull: false
      },
      budGetId: {
        type: DataTypes.INTEGER,
        references: { model: "Budgets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      paymentId: {
        type: DataTypes.INTEGER,
        references: { model: "Payments", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "SET NULL",
        allowNull: true
      },  
      emissionDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      days: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      number: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      value: {
        type: DECIMAL(10, 2),
        allowNull: false
      },
      change: {
        type: DECIMAL(10, 2),
        allowNull: false
      },
      installments: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      paidDate: {
        type: DataTypes.DATE,
        allowNull: true
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
    return queryInterface.dropTable("BudGetNegotiations");
  }
};
