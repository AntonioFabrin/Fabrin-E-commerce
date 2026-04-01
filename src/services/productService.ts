import productRepository from '../repositories/productRepository';

const productService = {
    createProduct: async (productData: any) => {
        if (!productData.name || !productData.price) {
            throw new Error("O nome e o preço do produto são obrigatórios!");
        }
        if (!productData.seller_id) {
            throw new Error("Erro interno: ID do vendedor não identificado!");
        }
        const result = await productRepository.create(productData);
        return result;
    },

    getAllProducts: async (limit: number, offset: number) => {
        try {
            const result = await productRepository.findAll(limit, offset);
            return result;
        } catch (error) {
            throw new Error("Erro ao carregar a vitrine de produtos");
        }
    },

    // ✅ NOVO: retorna todos os produtos de um seller pelo ID
    getProductsBySeller: async (sellerId: number) => {
        try {
            const products = await productRepository.findBySeller(sellerId);
            return products;
        } catch (error) {
            throw new Error("Erro ao buscar produtos do vendedor.");
        }
    },

    getProductById: async (id: number) => {
        const product = await productRepository.findById(id);
        if (!product) {
            throw new Error("Produto não encontrado na nossa loja.");
        }
        return product;
    },

    updateProduct: async (id: number, productData: any) => {
        await productService.getProductById(id);
        const result = await productRepository.update(id, productData);
        return result;
    },

    deleteProduct: async (id: number) => {
        await productService.getProductById(id);
        const result = await productRepository.delete(id);
        return result;
    }
};

export default productService;
