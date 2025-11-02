import * as Yup from "yup";

import AppError from "../../errors/AppError";
import StatusBudGet from "../../models/StatusBudGets";

interface StatusBudGetData {
  id?: number;
  name?: string;
  code?: string | null;
}

interface Request {
  statusBudGetData: StatusBudGetData;
  id: string | number;
  companyId: number;
}

const UpdateStatuBudGetService = async ({
  statusBudGetData,
  id,
  companyId
}: Request): Promise<StatusBudGet | undefined> => {
  const statusBudGet = await StatusBudGet.findOne({ where: { id, companyId } });

  if (!statusBudGet) {
    throw new AppError("ERR_NO_CATEGORY_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(3),
    code: Yup.string().optional().nullable().transform(value => (!value ? null : value))
  });

  const { name, code } = statusBudGetData;

  try {
    await schema.validate({ name, code });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (code && code !== statusBudGet.code) {
    const codeExists = await StatusBudGet.findOne({ where: { code, companyId } });

    if (codeExists) {
      throw new AppError("ERR_STATUS_BUDGET_CONFLICT_CODE", 409);
    }
  }

  await statusBudGet.update({
    name,
    code
  });

  await statusBudGet.reload();
  return statusBudGet;
};

export default UpdateStatuBudGetService;
