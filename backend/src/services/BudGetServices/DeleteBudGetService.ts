import Category from "../../models/Category";
import AppError from "../../errors/AppError";
import BudGet from "../../models/BudGet";

const DeleteBudGetService = async (id: string | number): Promise<void> => {
  const budGet = await BudGet.findOne({
    where: { id }
  });

  if (!budGet) {
    throw new AppError("ERR_NO_BUDGET_FOUND", 404);
  }

  await budGet.destroy();
};

export default DeleteBudGetService;
