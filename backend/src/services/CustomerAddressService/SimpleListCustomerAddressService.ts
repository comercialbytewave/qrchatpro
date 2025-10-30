import { Op, Sequelize } from "sequelize";
import CustomerAddress from "../../models/CustomerAddress";

interface Request {
  companyId: number;
  customerId: number | string;
  isActive?: boolean;
  searchParam?: string;
}

const SimpleListCustomerAddressService = async ({
  companyId,
  customerId,
  isActive = false,
  searchParam
}: Request): Promise<CustomerAddress[]> => {
  let whereCondition: any = { companyId, customerId };

  if(isActive) {
    whereCondition = { ...whereCondition, isActive };
  }

  if (searchParam) {
    whereCondition[Op.and] = [
      { "$CustomerAddress.name$": { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  const customerAddress = await CustomerAddress.findAll({
    where: whereCondition,
    order: [["name", "ASC"]],
    subQuery: false,
    attributes: [
     "id",
      "customerId",
      "name",
      "zipCode",
      "address",
      "number",
      "complement",
      "neighborhood",
      "city",
      "isActive",
      "state",
      "longitude",
      "latitude"
    ],
    group: ["CustomerAddress.id"]
  });

  return customerAddress;
};

export default SimpleListCustomerAddressService;
