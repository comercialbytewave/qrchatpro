import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable("Coupons", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "FREE_SHIPPING",
        "PERCENTAGE_DISCOUNT",
        "FIXED_DISCOUNT"
      ),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    valueMin: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    maxUsage: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    currentUsage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Companies", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable("Coupons");

  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_Coupons_type";'
  );
}
