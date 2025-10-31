import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Payment from "./Payment";

@Table({
  tableName: "PaymentDetails"
})
class PaymentDetails extends Model<PaymentDetails> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  minimumValue: number;
  
  @AllowNull(false)
  @Column
  installments: number;

  @ForeignKey(() => Payment) 
  @Column
  paymentId: number;

  @BelongsTo(() => Payment)
  payment: Payment;

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

export default PaymentDetails;
