'use client'
import BranchCategories from "./components/categories";
import BranchHeader from "./components/header";
import { api } from "@/lib/api";
import { useCompanytStore } from "@/data/store/useCompanyStore";
import { useQuery } from "@tanstack/react-query";
import { useSelectStore } from "@/components/select/useSelectStore";

const BranchMenuPage = () => {

  const { companyStore } = useCompanytStore()
  const { selectedStore } = useSelectStore()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });


  const fetchCategories = async () => {
    if (selectedStore?.id) {
      try {
        const data = await api.get(`/api/ecommerce/categories/list?storeId=${selectedStore.id}`);
        return data.data
      } catch (error) {
        console.log('err', error)
      }
    }
    return []
  }

  if (isLoading) return <span>Loading</span>

  return (
    < >
      <BranchHeader branch={companyStore} />
      <BranchCategories categories={categories} />
    </>
  );
};

export default BranchMenuPage;

