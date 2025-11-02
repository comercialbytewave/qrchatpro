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
  HasMany,
  HasOne
} from "sequelize-typescript";
import Ticket from "./Ticket";
import User from "./User";
import Store from "./Stores";
import Customer from "./Customer";
import StatusBudGets from "./StatusBudGets";
import Company from "./Company";
import BudGetItem from "./BudGetItem";
import BudGetNegociation from "./BudGetNegociation";
import BudGetAdressRouter from "./BudGetAdressRouter";

@Table({
  tableName: "Budgets", // ou "budgets" se quiser tudo minúsculo
})
class BudGet extends Model<BudGet> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Store)
  @Column
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @ForeignKey(() => Customer)
  @Column
  customerId: number;

  @BelongsTo(() => Customer)
  customer: Customer;

  @AllowNull(false)
  @Column
  emissionDate: Date;

  @Column
  number: string;

  @Column
  type: number;

  @Column
  route: string;

  @Column
  channel: string;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => StatusBudGets)
  @Column
  statusBudGetId: number;

  @BelongsTo(() => StatusBudGets)
  statusBudGet: StatusBudGets;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  observation: string;

  @AllowNull(false)
  @Column
  subTotal: number;

  @AllowNull(false)
  @Column
  freigh: number;

  @AllowNull(false)
  @Column
  discount: number;

  @AllowNull(false)
  @Column
  increase: number;

  @AllowNull(false)
  @Column
  total: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => BudGetItem)
  BudGetItens: BudGetItem[];

  @HasMany(() => BudGetNegociation)
  BudGetNegotiations: BudGetNegociation[];

  
  @HasOne(() => BudGetAdressRouter)
  BudGetAdressRouters: BudGetAdressRouter;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BudGet;
