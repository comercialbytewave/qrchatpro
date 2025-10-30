import Portifolio from "../../models/Portifolio";

const FindAllPortifolioService = async (companyId): Promise<Portifolio[]> => {
  const portifolios = await Portifolio.findAll({
    where: {
      companyId: companyId,
    },
    order: [["name", "ASC"]]
  });
  return portifolios;
};

export default FindAllPortifolioService;
