import api, { openApi } from "../../services/api";

const useStores = () => {

    const getStoresList = async (params) => {
        const { data } = await openApi.request({
            url: '/stores/list',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/stores/list',
            method: 'GET',
            params
        });
        return data;
    }

    const finder = async (id) => {
        const { data } = await api.request({
            url: `/stores/${id}`,
            method: 'GET'
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/stores',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/stores/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/stores/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    return {
        getStoresList,
        list,
        save,
        update,
        finder,
        remove
    }
}

export default useStores;