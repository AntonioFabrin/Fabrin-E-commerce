import { Request, Response} from 'express';
import productService from '../services/productService';

const productController = {
    create: async (req:Request, res:Response) => {
        try {
            console.log("Recebendo dados para novo anúncio...");
            const {seller_id, name, description, price, stock, image_url} = req.body;
            const newProduct = {
                seller_id,
                name,
                description,
                price,
                stock,
                image_url
            };
            const result = await productService.createProduct(newProduct);
            return res.status(201).json ({
                mensagem: "Produto anunciado com sucesso!",
                produtoId: (result as any).insertId
            });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
    }
}
};

export default productController;