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
},

getAll: async (req:Request, res:Response) => {
    try {
        console.log("🏪 Carregando a vitrine de produtos...");
        const products = await productService.getAllProducts() as any[];

        return res.status(200).json({
            total: products.length,
            produtos: products
        });
    } catch (error:any) {
        return res.status(400).json({ erro: error.message });
        
    }
},

getById: async (req:Request, res: Response) => {
    try{
        const id = parseInt(req.params.id as string);
        console.log (`🔍 Buscando detalhes do produto ID: ${id}...`);
        const product = await productService.getProductById(id);
        return res.status(200).json(product);
    } catch (error: any) {
        return res.status(404).json ({erro: error.message});
    }
},

update: async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string); // 👈 Variável chama 'id'
        const userData = (req as any).user;
        const productData = req.body;

        // Corrigido: Trocado vírgula por ponto e 'productId' por 'id'
        const product = await productService.getProductById(id); 

        if (product.seller_id !== userData.id && userData.role !== 'admin') {
            return res.status(403).json({
                erro: "Acesso negado! Você não pode editar um produto que não é seu"
            });
        }

        console.log(`✏️ Atualizando produto ID: ${id}...`);
        await productService.updateProduct(id, productData);
        return res.status(200).json({ mensagem: "Produto atualizado com sucesso no Marketplace!" });
    } catch (error: any) {
        return res.status(400).json({ erro: error.message });
    }
},

delete: async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string); // 👈 Variável chama 'id'
        const userData = (req as any).user;

        // Corrigido: Trocado 'productId' por 'id'
        const product = await productService.getProductById(id);

        if (product.seller_id !== userData.id && userData.role !== 'admin') {
            return res.status(403).json({
                erro: "Acesso negado! Você não pode deletar um produto de outro vendedor."
            });
        }

        console.log(`🗑️ Deletando produto ID: ${id}...`);
        await productService.deleteProduct(id);
        return res.status(200).json({ mensagem: "Produto removido da loja com sucesso!" });
    } catch (error: any) {
        return res.status(400).json({ erro: error.message });
    }
}

};

export default productController;