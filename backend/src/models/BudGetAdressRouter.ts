import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import BudGets from "./BudGet";

@Table({
  tableName: "BudGetAdressRouters",
})
class BudGetAdressRouter extends Model<BudGetAdressRouter> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => BudGets)
  @Column
  budGetId: number;

  @BelongsTo(() => BudGets)
  budGet: BudGets;

  @Column({
    type: DataType.STRING(8),
    allowNull: false
  })
  zipCode: string;

  @Column({
    type: DataType.STRING(250),
    allowNull: false
  })
  address: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: true
  })
  number: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  complement: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  neighborhood: string;

  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  city: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: false
  })
  state: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BudGetAdressRouter;
