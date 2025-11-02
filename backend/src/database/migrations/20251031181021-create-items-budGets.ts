import { QueryInterface, DataTypes, DECIMAL } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("BudGetItens", {
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
      productId: {
        type: DataTypes.INTEGER,
        references: { model: "Products", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "SET NULL",
        allowNull: true
      },
      amount: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      unitary: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      discount: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      total: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      canceledAt: {
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
    return queryInterface.dropTable("BudGetItens");
  }
};
