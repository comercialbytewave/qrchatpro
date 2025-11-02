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
  Default
} from "sequelize-typescript";
import Store from "./Stores";
import Company from "./Company";
import Product from "./Product";
import BudGet from "./BudGet";
@Table({
  tableName: "BudGetItens", // ou "budgets" se quiser tudo minúsculo
})
class BudGetItem extends Model<BudGetItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => BudGet)
  @Column
  budGetId: number;

  @BelongsTo(() => BudGet)
  budGet: BudGet;

  @ForeignKey(() => Product)
  @Column
  productId: number;

  @BelongsTo(() => Product)
  product: Store;
  

  @AllowNull(false)
  @Column
  amount: number;

  @AllowNull(false)
  @Column
  unitary: number;

  @AllowNull(false)
  @Column
  discount: number;

  //@AllowNull(false)
  //@Column
  //increase: number;

  @AllowNull(false)
  @Column
  total: number;

  @Default(true)
  @Column
  isActive: boolean;

  @Column
  canceledAt: Date;

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

export default BudGetItem;
