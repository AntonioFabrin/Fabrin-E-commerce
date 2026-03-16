import productRepository from '../repositories/productRepository';

const productService = {
    createProduct: async (productData:any ) => {
        if (!productData.name || !productData.price) {
        throw new Error ("O nome e o preço do produto são obrigatórios!");
    }
    if(!productData.seller_id) {
        throw new Error("Erro interno: ID do vendedor não identificado!");
    }
    const result = await productRepository.create(productData);
    return result;
    }
};

export default productService;


