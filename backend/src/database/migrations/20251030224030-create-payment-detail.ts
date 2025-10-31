import { QueryInterface, DataTypes, DECIMAL } from "sequelize";
import Contact from "../../models/Contact";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("PaymentDetails", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      minimumValue: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      installments: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      paymentId: {
        type: DataTypes.INTEGER,
        references: { model: "Payments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    return queryInterface.dropTable("PaymentDetails");
  }
};
