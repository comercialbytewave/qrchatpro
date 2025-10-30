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
    DataType
  } from "sequelize-typescript";
  
  import Company from "./Company";
  import Customer from "./Customer";
  
  @Table
  class CustomerAddress extends Model<CustomerAddress> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Customer)
    @Column
    customerId: number;
  
    @BelongsTo(() => Customer)
    customer: Customer;
  
    @Column({
      type: DataType.STRING(30),
      allowNull: false
    })
    name: string;
  
    @Column({
      type: DataType.STRING(8),
      allowNull: false
    })
    zipCode: string;
  
    @Column({
      type: DataType.STRING(250),
      allowNull: false
    })
    address: string;
  
    @Column({
      type: DataType.STRING(30),
      allowNull: true
    })
    number: string;
  
    @Column({
      type: DataType.STRING(255),
      allowNull: true
    })
    complement: string;
  
    @Column({
      type: DataType.STRING(150),
      allowNull: false
    })
    neighborhood: string;
  
    @Column({
      type: DataType.STRING(150),
      allowNull: false
    })
    city: string;
  
    @Column({
      type: DataType.STRING(2),
      allowNull: false
    })
    state: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true
    })
    latitude: string;
  
    @Column({
      type: DataType.STRING,
      allowNull: true
    })
    longitude: string;
  
    @Column({
      type: DataType.STRING(30),
      allowNull: true,
      defaultValue: true
    })
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
  
  export default CustomerAddress; 
  