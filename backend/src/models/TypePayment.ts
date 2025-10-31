import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull, 
} from "sequelize-typescript";

@Table({
  tableName: "TypePayments"
})
class TypePayments extends Model<TypePayments> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(true)
  @Column
  code: string | null;

  @AllowNull(true)
  @Column
  change: boolean | null;

  @AllowNull(true)
  @Column
  installments: boolean | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default TypePayments;
