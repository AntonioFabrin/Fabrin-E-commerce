import { Request, Response } from 'express';
import productService from '../services/productService';

const productController = {
    create: async (req: Request, res: Response) => {
        try {
            const { name, description, price, stock, category_id } = req.body;
            const userData = (req as any).user;

            if (!userData) {
                return res.status(401).json({ erro: "Usuário não autenticado ou token inválido." });
            }
            
            let image_url = '';
            if (req.file) {
                image_url = `uploads/${req.file.filename}`;
            } else {
                return res.status(400).json({ erro: "A imagem do produto é obrigatória!" });
            }

            const newProduct = {
                seller_id: userData.id,
                name,
                description,
                price: Number(price),
                stock: Number(stock),
                category_id: Number(category_id),
                image_url
            };

            const result = await productService.createProduct(newProduct);
            
            return res.status(201).json({
                mensagem: "Produto anunciado com sucesso!",
                produtoId: (result as any).insertId
            });
            
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = (page - 1) * limit;

            const result = await productService.getAllProducts(limit, offset);
            const totalPages = Math.ceil(result.total / limit);

            return res.status(200).json({
                dados: result.items,
                paginacao: {
                    pagina_atual: page,
                    itens_por_pagina: limit,
                    total_de_itens: result.total,
                    total_de_paginas: totalPages
                }
            });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    // ✅ NOVO: retorna produtos do vendedor autenticado via JWT
    getMySeller: async (req: Request, res: Response) => {
        try {
            const userData = (req as any).user;
            if (!userData) {
                return res.status(401).json({ erro: "Não autenticado." });
            }
            const products = await productService.getProductsBySeller(userData.id);
            return res.status(200).json(products);
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const product = await productService.getProductById(id);
            return res.status(200).json(product);
        } catch (error: any) {
            return res.status(404).json({ erro: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const userData = (req as any).user;
            const productData = req.body;

            if (!userData) {
                return res.status(401).json({ erro: "Sessão expirada. Faça login novamente." });
            }

            const product = await productService.getProductById(id);

            if (!product) {
                return res.status(404).json({ erro: "Produto não encontrado." });
            }

            if (product.seller_id !== userData.id && userData.role !== 'admin') {
                return res.status(403).json({
                    erro: "Acesso negado! Você não pode editar um produto que não é seu."
                });
            }

            await productService.updateProduct(id, productData);
            return res.status(200).json({ mensagem: "Produto atualizado com sucesso no Marketplace!" });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const userData = (req as any).user;

            const product = await productService.getProductById(id);

            if (!product) {
                return res.status(404).json({ erro: "Produto não encontrado." });
            }

            if (product.seller_id !== userData.id && userData.role !== 'admin') {
                return res.status(403).json({
                    erro: "Acesso negado! Você não pode deletar um produto de outro vendedor."
                });
            }

            await productService.deleteProduct(id);
            return res.status(200).json({ mensagem: "Produto removido da loja com sucesso!" });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }
};

export default productController;
