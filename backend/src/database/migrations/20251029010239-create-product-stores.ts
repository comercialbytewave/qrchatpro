import { zip } from "lodash";
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ProductStores", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        references: { model: "Products", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      storeId: {
        type: DataTypes.INTEGER,
        references: { model: "Stores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      stock: {
        // Renomeei para um nome mais descritivo
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      costPrice: {
        // Renomeei para um nome mais descritivo
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      sellingPrice: {
        // Renomeei para um nome mais descritivo
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      promotionPrice: {
        // Renomeei para um nome mais descritivo
        type: DataTypes.DECIMAL(10, 2),
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

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("ProductStores");
  }
};
