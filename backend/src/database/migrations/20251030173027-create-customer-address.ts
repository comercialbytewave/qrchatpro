import { zip } from "lodash";
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CustomerAddresses", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      customerId: {
        type: DataTypes.INTEGER,
        references: { model: "Customers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(30),
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
      latitude: {
        type: DataTypes.STRING,
        allowNull: true
      },
      longitude: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("ContactAddresses");
  }
};
