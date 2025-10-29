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
  DataType,
  Default,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import Company from "./Company";
import Product from "./Product";
import Store from "./Stores";


@Table
class ProductStore extends Model<ProductStore> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Product) // Define o relacionamento com a tabela Categories
  @Column
  productId: number;

  @BelongsTo(() => Product) // Define o relacionamento "pertence a"
  product: Product;

  @ForeignKey(() => Store) // Define o relacionamento com a tabela Categories
  @Column
  storeId: number;

  @BelongsTo(() => Store) // Define o relacionamento "pertence a"
  store: Store;

  @AllowNull(false)
  @Column
  stock: number;

  @AllowNull(false)
  @Column
  costPrice: number;

  @AllowNull(false)
  @Column
  sellingPrice: number;

  @AllowNull(false)
  @Column
  promotionPrice: number;

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

export default ProductStore; // Exportando o modelo correto (Product)
