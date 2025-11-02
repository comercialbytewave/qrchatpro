import StatusBudGets from "../../models/StatusBudGets";

const FindAllStatusBudGetService = async (companyId): Promise<StatusBudGets[]> => {
  const statusBudGets = await StatusBudGets.findAll({
    where: {
      companyId: companyId,
    },
    order: [["name", "ASC"]]
  });
  return statusBudGets;
};

export default FindAllStatusBudGetService;
