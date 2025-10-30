import { Op } from "sequelize";
import CustomerAddress from "../../models/CustomerAddress";

interface Request {
  customerId: string | number;
  companyId: number;
  searchParam?: string;
  isActive?: boolean;
  pageNumber?: string | number;
}

interface Response {
  customerAddress: CustomerAddress[];
  count: number;
  hasMore: boolean;
}

const ListCustomerAddressService = async ({
  customerId,
  companyId,
  searchParam,
  isActive = false,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition: any = { customerId, companyId };
  if(isActive) {
    whereCondition = { ...whereCondition, isActive };
  }

  if (searchParam) {
    whereCondition[Op.and] = [{ '$customerAddress.name$': { [Op.iLike]: `%${searchParam}%` } }];
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: customerAddress } = await CustomerAddress.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
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

  

  const hasMore = count > offset + customerAddress.length;

  return {
    customerAddress,
    count,
    hasMore
  };
};

export default ListCustomerAddressService;
