import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Category from "./Category";
import Company from "./Company";
import ProductStore from "./ProductStore";



@Table
class Product extends Model<Product> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  ean: string;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column
  code: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description: string;

  @Default(true)
  @Column
  isActive: boolean;

  @ForeignKey(() => Category)
  @Column
  categoryId: number;

  @BelongsTo(() => Category)
  category: Category;

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => ProductStore)
  productStore: ProductStore[];
}

export default Product;
