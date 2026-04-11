import orderRepository from '../repositories/orderRepository';
import productRepository from '../repositories/productRepository';

const orderService = {

    // Cria pedido a partir de um único produto (fluxo do checkout MP)
    createOrderFromProduct: async (
        userId: number,
        product: { id: number; price: number; name: string },
        quantity: number,
        externalReference: string
    ) => {
        const dbProduct = await productRepository.findById(product.id);
        if (!dbProduct) throw new Error(`Produto ID ${product.id} não encontrado.`);
        if (dbProduct.stock < quantity) throw new Error(`Estoque insuficiente para '${dbProduct.name}'.`);

        const unitPrice = parseFloat(Number(product.price).toFixed(2));
        const total = unitPrice * quantity;

        const items = [{ product_id: product.id, quantity, price: unitPrice }];
        const orderId = await orderRepository.createOrder(userId, total, items);

        // Salva o external_reference no pedido para o webhook achar depois
        await orderRepository.saveExternalReference(orderId, externalReference);

        return orderId;
    },

    // Criação de pedido com múltiplos itens (uso futuro — carrinho)
    createOrder: async (userId: number, items: any[]) => {
        if (!items || items.length === 0) throw new Error('O carrinho está vazio.');

        let total = 0;
        const processedItems: any[] = [];

        for (const item of items) {
            const product = await productRepository.findById(item.product_id);
            if (!product) throw new Error(`Produto ID ${item.product_id} não existe mais na loja.`);
            if (product.stock < item.quantity) throw new Error(`Estoque insuficiente para '${product.name}'.`);

            const itemPrice = parseFloat(product.price);
            total += itemPrice * item.quantity;
            processedItems.push({ product_id: item.product_id, quantity: item.quantity, price: itemPrice });
        }

        const orderId = await orderRepository.createOrder(userId, total, processedItems);
        return { mensagem: 'Pedido realizado com sucesso!', pedido_id: orderId, valor_total: total };
    },

    // Webhook do MP — atualiza status do pedido e pagamento
    handleWebhook: async (data: any) => {
        const { type, data: mpData } = data;
        if (type !== 'payment') return;

        const paymentId = mpData?.id;
        if (!paymentId) return;

        // Atualiza o status do pagamento pelo transaction_id
        await orderRepository.updatePaymentStatus(String(paymentId), 'approved');

        // Tenta atualizar o pedido ligado a este pagamento
        const order = await orderRepository.findByTransactionId(String(paymentId));
        if (order) {
            await orderRepository.updateOrderStatus(order.id, 'paid');
        }
    },

    // Pedidos do comprador
    listUserOrders: async (userId: number) => {
        return await orderRepository.getUserOrders(userId);
    },

    // Pedidos recebidos pelo vendedor
    listSellerOrders: async (sellerId: number) => {
        return await orderRepository.getSellerOrders(sellerId);
    }
};

export default orderService;
