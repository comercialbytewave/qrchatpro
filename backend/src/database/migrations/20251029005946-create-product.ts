import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Products", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      ean: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false
      },      
      description: {
        type: DataTypes.TEXT, // Alterei para TEXT para suportar descrições longas
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      categoryId: {
        type: DataTypes.INTEGER,
        references: { model: "Categories", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      mediaPath: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mediaName: {
        type: DataTypes.TEXT,
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
    await queryInterface.dropTable("Products");
  }
};
