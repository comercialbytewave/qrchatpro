import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    ForeignKey,
    BelongsTo,
    Default
  } from "sequelize-typescript";
  import Company from "./Company";
  
  @Table
  class Store extends Model<Store> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @AllowNull(false)
    @Column
    document: string;
  
    @AllowNull(false)
    @Column
    name: string;
  
    @Column
    fantasy: string;
  
    @Default(false)
    @Column
    zipCode: string;
  
    @Default(false)
    @Column
    address: string;
  
    @Default(false)
    @Column
    number: string;
  
    @Default(false)
    @Column
    complement: string;
  
    @Default(false)
    @Column
    neighborhood: string;
  
    @Default(false)
    @Column
    city: string;
  
    @Default(false)
    @Column
    state: string;
  
    @Default(false)
    @Column
    latitude: string;
  
    @Default(false)
    @Column
    longitude: string;
  
    @Default(false)
    @Column
    isActive: boolean;

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
  
  export default Store;
  