import Customer from "../../models/Customer";


const FindAllCustomerService = async (companyId): Promise<Customer[]> => {
  const customers = await Customer.findAll({
    where: {
      companyId: companyId,
    },
    order: [["fullName", "ASC"]]
  });
  return customers;
};

export default FindAllCustomerService;
