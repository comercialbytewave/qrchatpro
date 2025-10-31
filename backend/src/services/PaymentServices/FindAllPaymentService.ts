import Category from "../../models/Category";
import Payment from "../../models/Payment";


const FindAllPaymentService = async (companyId): Promise<Payment[]> => {
  const payments = await Payment.findAll({
    where: {
      companyId: companyId,
    },
    order: [["name", "ASC"]]
  });
  return payments;
};

export default FindAllPaymentService;
