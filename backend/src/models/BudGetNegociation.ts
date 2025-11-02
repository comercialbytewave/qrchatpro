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
} from "sequelize-typescript";
import Company from "./Company";
import BudGets from "./BudGet";
import Payment from "./Payment";

@Table({
  tableName: "BudGetNegotiations", // ou "budgets" se quiser tudo minúsculo
})
class BudGetNegociation extends Model<BudGetNegociation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;


  @AllowNull(false)
  @Column
  status: string;

  @ForeignKey(() => BudGets)
  @Column
  budGetId: number;

  @BelongsTo(() => BudGets)
  budGet: BudGets;

  @AllowNull(false)
  @Column
  emissionDate: Date;
  
  @AllowNull(false)
  @Column
  days: number;

  @AllowNull(false)
  @Column
  number: string;

  @ForeignKey(() => Payment)
  @Column
  paymentId: number;

  @BelongsTo(() => Payment)
  payment: Payment;

  @AllowNull(false)
  @Column
  value: number;

  @AllowNull(false)
  @Column
  installments: number;

  @AllowNull(false)
  @Column
  change: number;

  @AllowNull(false)
  @Column
  dueDate: Date;


  @AllowNull(true)
  @Column
  paidDate: Date;
  
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

export default BudGetNegociation;
