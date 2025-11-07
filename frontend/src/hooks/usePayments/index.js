import api, { openApi } from "../../services/api";

const usePayments = () => {

    const getPaymentsList = async (params) => {
        const { data } = await openApi.request({
            url: '/payments/list',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/payments/list',
            method: 'GET',
            params
        });
        return data;
    }

    const finder = async (id) => {
        const { data } = await api.request({
            url: `/payments/${id}`,
            method: 'GET'
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/payments',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/payments/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/payments/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    return {
        getPaymentsList,
        list,
        save,
        update,
        finder,
        remove
    }
}

export default usePayments;