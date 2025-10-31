import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  Unique,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

export interface ICoupon {
  id: number;
  code: string;
  type: CouponTypeEnum;
  value: number | null;
  valueMin: number;
  startDate: Date;
  expirationDate: Date;
  maxUsage: number | null;
  currentUsage: number;
  isActive: boolean;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum CouponTypeEnum {
  FREE_SHIPPING = "FREE_SHIPPING",
  PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT",
  FIXED_DISCOUNT = "FIXED_DISCOUNT"
}

@Table({
  tableName: "Coupons"
})
export class Coupon extends Model<Coupon> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  code: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(CouponTypeEnum)))
  type: CouponTypeEnum;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 2))
  value: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  valueMin: number;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  startDate: Date;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  expirationDate: Date;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  maxUsage: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  currentUsage: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
