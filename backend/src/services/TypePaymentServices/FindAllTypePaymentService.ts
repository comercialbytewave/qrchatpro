import TypePayments from "../../models/TypePayment";

const FindAllTypePaymentService = async (): Promise<TypePayments[]> => {
  const typePayments = await TypePayments.findAll({
    order: [["code", "ASC"]]
  });
  return typePayments;
};

export default FindAllTypePaymentService;
