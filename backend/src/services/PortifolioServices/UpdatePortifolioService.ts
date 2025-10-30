import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Portifolio from "../../models/Portifolio";
import User from "../../models/User";

interface portifolioData {
  id?: number;
  name?: string;
  userId?: number | string;
}

interface Request {
  portifolioData: portifolioData;
  id: string | number;
  companyId: number;
}

const UpdatePortifolioService = async ({
  portifolioData,
  id,
  companyId
}: Request): Promise<Portifolio | undefined> => {
  const portifolio = await Portifolio.findOne({ where: { id, companyId } });

  if (!portifolio) {
    throw new AppError("ERR_NO_PORTIFOLIO_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(3),
    userId: Yup.number().required()
  });

  const { name, userId } = portifolioData;

  try {
    await schema.validate({ name, userId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (userId && userId !== portifolio.userId) {
    const portifolioExists = await Portifolio.findOne({ where: { userId, companyId } });

    if (portifolioExists) {
      throw new AppError("ERR_PORTIFOLIO_CONFLICT_CODE", 409);
    }
  }

  await portifolio.update({
    name,
    userId
  });

  await portifolio.reload({ include: [{ model: User, as: "user" }] });
  return portifolio;
};

export default UpdatePortifolioService;
