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
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import PaymentDetails from "./PaymentDetails";
import TypePayments from "./TypePayment";

@Table({
  tableName: "Payments"
})
class Payment extends Model<Payment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  code: string;

  @AllowNull(false)
  @Column
  name: string;

  @ForeignKey(() => TypePayments)
  @Column
  typePaymentId: number;

  @BelongsTo(() => TypePayments)
  typePayment: TypePayments;


  @HasMany(() => PaymentDetails)
  paymentDetails: PaymentDetails[];

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

export default Payment;
