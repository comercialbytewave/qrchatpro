import api, { openApi } from "../../services/api";

const useCategories = () => {

    const getCategoriesList = async (params) => {
        const { data } = await openApi.request({
            url: '/categories/list',
            method: 'GET',
            params
        });
        return data;
    }

    const list = async (params) => {
        const { data } = await api.request({
            url: '/categories/list',
            method: 'GET',
            params
        });
        return data;
    }

    const finder = async (id) => {
        const { data } = await api.request({
            url: `/categories/${id}`,
            method: 'GET'
        });
        return data;
    }

    const save = async (data) => {
        const { data: responseData } = await api.request({
            url: '/categories',
            method: 'POST',
            data
        });
        return responseData;
    }

    const update = async (data) => {
        const { data: responseData } = await api.request({
            url: `/categories/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }

    const remove = async (id) => {
        const { data } = await api.request({
            url: `/categories/${id}`,
            method: 'DELETE'
        });
        return data;
    }

    return {
        getCategoriesList,
        list,
        save,
        update,
        finder,
        remove
    }
}

export default useCategories;