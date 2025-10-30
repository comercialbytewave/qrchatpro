import AppError from "../../errors/AppError";
import Portifolio from "../../models/Portifolio";

interface Request {
  id: string | number
  companyId: number
}

const ShowPortifolioService = async ({id, companyId}: Request): Promise<Portifolio> => {
  const portifolio = await Portifolio.findOne({where: {id, companyId}});

  if (!portifolio) {
    throw new AppError("ERR_NO_PORTIFOLIO_FOUND", 404);
  }

  return portifolio;
};

export default ShowPortifolioService;
