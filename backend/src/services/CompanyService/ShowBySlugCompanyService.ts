
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

const ShowBySlugCompanyService = async (slug: string): Promise<Company> => {
  const company = await Company.findOne({ where: { slug }, include: [Plan] });

  if (!company) {
    throw new AppError("Empresa não encontrada");
  }


  const result = company.toJSON() as any;

  delete result.plan;
  
  return result;
};

export default ShowBySlugCompanyService;
