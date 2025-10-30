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
import Portifolio from "./Portifolio";
import Contact from "./Contact";

@Table
class Customer extends Model<Customer> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  document: string;


  @AllowNull(false)
  @Column
  fullName: string;

  @AllowNull(false)
  @Column
  email: string;

  @AllowNull(false)
  @Column
  customerDefault: boolean;

  @ForeignKey(() => Portifolio)
  @Column
  portifolioId: number;

  @BelongsTo(() => Portifolio)
  portifolio: Portifolio;

  @Column
  birthday: string;

  @HasMany(() => Contact, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  contacts: Contact[];


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
}

export default Customer;
