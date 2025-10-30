import AppError from "../../errors/AppError";
import Portifolio from "../../models/Portifolio";

const DeletePortifolioService = async (id: string | number): Promise<void> => {
  const portifolio = await Portifolio.findOne({
    where: { id }
  });

  if (!portifolio) {
    throw new AppError("ERR_NO_PORTIFOLIO_FOUND", 404);
  }

  await portifolio.destroy();
};

export default DeletePortifolioService;
