import api, { openApi } from "../../services/api";

const useTypePayments = () => {

    const getTypePaymentList = async (params) => {
        const { data } = await openApi.request({
            url: '/typePayments/list',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/typePayments/list',
            method: 'GET',
            params
        });
        return data;
    }

    const finder = async (id) => {
        const { data } = await api.request({
            url: `/typePayments/${id}`,
            method: 'GET'
        });
        return data;
    }

    
    return {
        getTypePaymentList,
        list,
        finder
        
    }
}

export default useTypePayments;