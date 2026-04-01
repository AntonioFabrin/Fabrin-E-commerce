import { Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import orderRepository from '../repositories/orderRepository';

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

const paymentController = {

    // ─── PREFERÊNCIA PRODUTO ÚNICO ────────────────────────────────────────────────
    createPreference: async (req: Request, res: Response) => {
        try {
            const { product, quantity = 1, buyer } = req.body;
            if (!product || !buyer) return res.status(400).json({ erro: 'Dados obrigatórios ausentes.' });
            if (!process.env.MP_ACCESS_TOKEN) return res.status(500).json({ erro: 'Credenciais MP não configuradas.' });

            const preference = new Preference(client);
            const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
            const externalReference = `produto-${product.id}-${Date.now()}`;
            const phoneDigits = String(buyer.phone).replace(/\D/g, '');

            const preferenceBody: any = {
                items: [{
                    id: String(product.id),
                    title: String(product.name).substring(0, 256),
                    description: String(product.description || product.name).substring(0, 600),
                    category_id: 'electronics',
                    quantity: Number(quantity),
                    currency_id: 'BRL',
                    unit_price: parseFloat(Number(product.price).toFixed(2)),
                }],
                payer: {
                    name: String(buyer.name),
                    email: String(buyer.email),
                    phone: { area_code: phoneDigits.substring(0, 2), number: phoneDigits.substring(2) },
                    address: {
                        zip_code: String(buyer.cep).replace(/\D/g, ''),
                        street_name: String(buyer.street),
                        street_number: String(buyer.number || '0'),
                    }
                },
                back_urls: {
                    success: `${frontend}/orders?status=sucesso`,
                    pending: `${frontend}/orders?status=pendente`,
                    failure: `${frontend}/orders?status=erro`,
                },
                external_reference: externalReference,
                statement_descriptor: 'FABRIN MARKET',
                payment_methods: { installments: 12 }
            };

            console.log('📦 Criando preferência (produto único):', product.name);
            const result = await preference.create({ body: preferenceBody });
            console.log('✅ Preferência criada! ID:', result.id);

            // Gravar pedido no banco se logado
            const userData = (req as any).user;
            if (userData?.id) {
                try {
                    const orderId = await orderRepository.createOrder(
                        userData.id,
                        parseFloat(Number(product.price).toFixed(2)) * Number(quantity),
                        [{ product_id: product.id, quantity: Number(quantity), price: parseFloat(Number(product.price).toFixed(2)) }]
                    );
                    await orderRepository.saveExternalReference(orderId, externalReference);
                    await orderRepository.createPayment(orderId, 'mercadopago', 'pending', result.id || '');
                    console.log(`📝 Pedido #${orderId} gravado.`);
                } catch (dbErr: any) {
                    console.error('⚠️ Erro ao gravar pedido (não bloqueante):', dbErr.message);
                }
            }

            return res.status(201).json({
                preference_id: result.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point,
            });

        } catch (error: any) {
            console.error('❌ Erro MP:', error?.message);
            if (error?.status === 401) return res.status(401).json({ erro: 'Credenciais inválidas.' });
            return res.status(500).json({ erro: 'Erro ao processar pagamento.', detalhe: error?.message });
        }
    },

    // ─── PREFERÊNCIA CARRINHO (MÚLTIPLOS ITENS) ───────────────────────────────────
    createPreferenceCart: async (req: Request, res: Response) => {
        try {
            const { items, total, buyer, cartItems } = req.body;
            if (!items?.length || !buyer) return res.status(400).json({ erro: 'Dados obrigatórios ausentes.' });
            if (!process.env.MP_ACCESS_TOKEN) return res.status(500).json({ erro: 'Credenciais MP não configuradas.' });

            const preference = new Preference(client);
            const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
            const externalReference = `carrinho-${Date.now()}`;
            const phoneDigits = String(buyer.phone).replace(/\D/g, '');

            const preferenceBody: any = {
                items: items.map((item: any) => ({
                    id: String(item.id),
                    title: String(item.title).substring(0, 256),
                    quantity: Number(item.quantity),
                    currency_id: 'BRL',
                    unit_price: parseFloat(Number(item.unit_price).toFixed(2)),
                })),
                payer: {
                    name: String(buyer.name),
                    email: String(buyer.email),
                    phone: { area_code: phoneDigits.substring(0, 2), number: phoneDigits.substring(2) },
                    address: {
                        zip_code: String(buyer.cep).replace(/\D/g, ''),
                        street_name: String(buyer.street),
                        street_number: String(buyer.number || '0'),
                    }
                },
                back_urls: {
                    success: `${frontend}/orders?status=sucesso`,
                    pending: `${frontend}/orders?status=pendente`,
                    failure: `${frontend}/orders?status=erro`,
                },
                external_reference: externalReference,
                statement_descriptor: 'FABRIN MARKET',
                payment_methods: { installments: 12 }
            };

            console.log(`🛒 Criando preferência (carrinho) — ${items.length} item(s) — Total: R$${total}`);
            const result = await preference.create({ body: preferenceBody });
            console.log('✅ Preferência do carrinho criada! ID:', result.id);

            // Gravar pedido consolidado no banco se logado
            const userData = (req as any).user;
            if (userData?.id && cartItems?.length) {
                try {
                    const dbItems = cartItems.map((i: any) => ({
                        product_id: i.id,
                        quantity: Number(i.quantity),
                        price: parseFloat(Number(i.price).toFixed(2)),
                    }));
                    const orderId = await orderRepository.createOrder(userData.id, parseFloat(Number(total).toFixed(2)), dbItems);
                    await orderRepository.saveExternalReference(orderId, externalReference);
                    await orderRepository.createPayment(orderId, 'mercadopago', 'pending', result.id || '');
                    console.log(`📝 Pedido do carrinho #${orderId} gravado.`);
                } catch (dbErr: any) {
                    console.error('⚠️ Erro ao gravar pedido do carrinho (não bloqueante):', dbErr.message);
                }
            }

            return res.status(201).json({
                preference_id: result.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point,
            });

        } catch (error: any) {
            console.error('❌ Erro MP carrinho:', error?.message);
            if (error?.status === 401) return res.status(401).json({ erro: 'Credenciais inválidas.' });
            return res.status(500).json({ erro: 'Erro ao processar carrinho.', detalhe: error?.message });
        }
    },

    // ─── WEBHOOK ─────────────────────────────────────────────────────────────────
    webhook: async (req: Request, res: Response) => {
        try {
            const { type, data } = req.body;
            console.log(`🔔 Webhook MP — tipo: ${type} | id: ${data?.id}`);

            if (type === 'payment' && data?.id) {
                const paymentId = String(data.id);
                await orderRepository.updatePaymentStatus(paymentId, 'approved');
                const order = await orderRepository.findByTransactionId(paymentId);
                if (order) {
                    await orderRepository.updateOrderStatus(order.id, 'paid');
                    console.log(`✅ Pedido #${order.id} marcado como PAGO.`);
                }
            }

            return res.status(200).json({ recebido: true });
        } catch (error: any) {
            console.error('❌ Erro no webhook:', error?.message);
            return res.status(200).json({ recebido: true });
        }
    }
};

export default paymentController;
