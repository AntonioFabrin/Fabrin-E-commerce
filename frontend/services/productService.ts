import axios from 'axios'; 

const api = axios.create ({
    baseURL: 'http://localhost:3333',
});

export const productService = {
    create: async (formData: FormData, token: string) => {
        const response = await api.post('/products',formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    },

    getAll: async () => {
        const response = await api.get ('/products');
        return response.data;
    }
};
