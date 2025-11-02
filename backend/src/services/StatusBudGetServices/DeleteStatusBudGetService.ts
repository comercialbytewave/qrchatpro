import AppError from "../../errors/AppError";
import StatusBudGets from "../../models/StatusBudGets";

const DeleteStatusBudGetService = async (id: string | number): Promise<void> => {
  const statusBudGet = await StatusBudGets.findOne({
    where: { id }
  });

  if (!statusBudGet) {
    throw new AppError("ERR_NO_STATUS_BUDGET_FOUND", 404);
  }

  await StatusBudGets.destroy();
};

export default DeleteStatusBudGetService;
