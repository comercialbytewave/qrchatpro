import Store from "../../models/Stores";

const LisByStoreService = async (companyId: number ): Promise<Store[]> => {
  
  const stores = await Store.findAll({ where: { companyId } }); 

  return stores;
};

export default LisByStoreService;
