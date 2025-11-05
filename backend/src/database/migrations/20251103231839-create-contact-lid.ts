import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  return queryInterface.addColumn("Contacts", "lid", {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  });
}

export async function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn("Contacts", "lid");
}
