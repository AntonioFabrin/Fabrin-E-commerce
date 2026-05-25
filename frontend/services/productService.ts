import api from '../lib/api';

export const productService = {
    create: async (formData: FormData) => {
        const response = await api.post('/api/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getAll: async () => {
        const response = await api.get('/api/products');
        return response.data;
    }
};
