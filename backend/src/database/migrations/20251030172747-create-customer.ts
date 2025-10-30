import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Customers", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      document: {
        type: DataTypes.STRING(18),
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      birthday: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      customerDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      portifolioId: {
        type: DataTypes.INTEGER,
        references: { model: "Portifolios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    return queryInterface.dropTable("Customers");
  }
};
