// src/services/Company/CompanyGenerationTokenService.ts
import crypto from "crypto";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";

interface CompanyData {
  id?: number | string;
  campaignsEnabled?: boolean;
  token?: string;
}

const CompanyGenerationTokenService = async (
  companyData: CompanyData
): Promise<Company> => {
  const company = await Company.findByPk(companyData.id);

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  const token = companyData.token || crypto.randomBytes(32).toString("hex");

  await company.update({
    token
  });

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${companyData.campaignsEnabled}`
      }
    });

    if (!created) {
      await setting.update({ value: `${companyData.campaignsEnabled}` });
    }
  }

  return company;
};

export default CompanyGenerationTokenService;
