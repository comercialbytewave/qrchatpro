import { QueryInterface, DataTypes, DECIMAL } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Budgets", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      storeId: {
        type: DataTypes.INTEGER,
        references: { model: "Stores", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      }, 
      customerId: {
        type: DataTypes.INTEGER,
        references: { model: "Customers", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "SET NULL",
        allowNull: true
      }, 
      emissionDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      number: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      route: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      channel: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      ticketId: {
        type: DataTypes.INTEGER,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "SET NULL",
        allowNull: true
      },
      statusBudGetId: {
        type: DataTypes.INTEGER,
        references: { model: "StatusBudGets", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "SET NULL",
        allowNull: true
      }, 
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE", 
        onDelete: "SET NULL",
        allowNull: true
      },  
      observation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subTotal: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      freigh: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      discount: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      increase: {
        type: DECIMAL(10, 2),
        allowNull: true
      },
      total: {
        type: DECIMAL(10, 2),
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
    return queryInterface.dropTable("Budgets");
  }
};
