import * as Yup from "yup";

import AppError from "../../errors/AppError";
import StatusBudGets from "../../models/StatusBudGets";

interface Request {
  name: string;
  code: string | null;
  companyId: number;
}

const CreateStatusBudGetService = async ({
  name,
  code,
  companyId,  
}: Request): Promise<StatusBudGets> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3),
    code: Yup.string().optional().nullable().transform(value => (!value ? null : value))
  });

  try {
    await schema.validate({ name,code });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  
  if (code) {
    const codeExists = await StatusBudGets.findOne({ where: { code, companyId } });

    if (codeExists) {
      throw new AppError("ERR_STATUS_BUDGET_CONFLICT_CODE", 409);
    }
  }

  const [statusBudGets] = await StatusBudGets.findOrCreate({
    where: { name, companyId },
    defaults: { name,code, companyId }
  });

  await statusBudGets.reload();

  return statusBudGets;
};

export default CreateStatusBudGetService;
