import AppError from "../../errors/AppError";
import Category from "../../models/Category";
import StatusBudGets from "../../models/StatusBudGets";

interface Request {
  id: string | number
  companyId: number
}

const ShowStatusBudGetService = async ({id, companyId}: Request): Promise<StatusBudGets> => {
  const statusBudGet = await StatusBudGets.findOne({where: {id, companyId}});

  if (!statusBudGet) {
    throw new AppError("ERR_NO_STATUS_BUDGET_FOUND", 404);
  }

  return statusBudGet;
};

export default ShowStatusBudGetService;
