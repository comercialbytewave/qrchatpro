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
import Product from "./Product";

@Table({
  indexes: [
    {
      unique: true,
      fields: ["companyId", "code"],
      name: "categories_companyId_code_unique"
    }
  ]
})
class Category extends Model<Category> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(true)
  @Unique('categories_companyId_code_unique')
  @Column
  code: string | null;

  @ForeignKey(() => Company)
  @Unique('categories_companyId_code_unique')
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Product)
  products: Product[];
}

export default Category;
