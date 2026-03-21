import orderRepository from '../repositories/orderRepository';
import productRepository from '../repositories/productRepository';

const orderService = {
    createOrder: async (userId:number, items: any[]) => {
        if(!items || items.length === 0) {
            throw new Error ("O carrinho está vazio");
        }
        let total = 0;
        const processedItems:any [] = [];
        for (const item of items) {
            const product = await productRepository.findById(item.product_id);
            if (!product) {
                throw new Error (`Produto ID ${item.product_id} não existe mais na loja`)
                
            }   
            if (product.stock < item.quantity) {
                throw new Error (`Estoque insuficiente para '${product.name}'. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
            }
            const itemPrice = parseFloat(product.price);
            total += itemPrice * item.quantity;

            processedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: itemPrice
            });
        }
        const orderId = await orderRepository.createOrder(userId, total, processedItems);
        return {
            mensagem: "Pedido realizado com sucesso!",
            pedido_id:orderId,
            valor_total: total
            
        };
    },
    listUserOrders: async (userId: number) => {
        return await orderRepository.getUserOrders(userId);
    }
}

export default orderService;