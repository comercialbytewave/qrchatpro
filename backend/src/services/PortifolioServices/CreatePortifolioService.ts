import * as Yup from "yup";

import AppError from "../../errors/AppError";

import Portifolio from "../../models/Portifolio";
import User from "../../models/User";

interface Request {
  name: string;
  userId: number | string;
  companyId: number;
}

const CreatePortifolioService = async ({
  name,
  userId,
  companyId
}: Request): Promise<Portifolio> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3),
    userId: Yup.number().required(),
  });

  try {
    await schema.validate({ name, userId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (userId) {
    const userExists = await Portifolio.findOne({ where: { userId, companyId } });

    if (userExists) {
      throw new AppError("ERR_PORTIFOLIO_CONFLICT_CODE", 409);
    }
  }

  const [portifolio] = await Portifolio.findOrCreate({
    where: { name, userId, companyId },
    defaults: { name, userId, companyId },
  });

  await portifolio.reload({ include: [{ model: User, as: "user" }] });

  return portifolio;
};

export default CreatePortifolioService;
