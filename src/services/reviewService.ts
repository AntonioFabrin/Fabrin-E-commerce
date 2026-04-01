import reviewRepository from '../repositories/reviewRepository';

const reviewService = {

    createReview: async (data: {
        product_id: number;
        user_id: number;
        order_id: number;
        rating: number;
        comment: string;
    }) => {
        if (data.rating < 1 || data.rating > 5) {
            throw new Error('A nota deve ser entre 1 e 5 estrelas.');
        }

        // Verifica se o usuário comprou o produto
        const bought = await reviewRepository.userBoughtProduct(data.user_id, data.product_id);
        if (!bought) {
            throw new Error('Você só pode avaliar produtos que comprou.');
        }

        // Verifica se já avaliou
        const already = await reviewRepository.alreadyReviewed(data.user_id, data.product_id, data.order_id);
        if (already) {
            throw new Error('Você já avaliou este produto neste pedido.');
        }

        const id = await reviewRepository.create(data);
        return { mensagem: 'Avaliação enviada com sucesso!', id };
    },

    getProductReviews: async (productId: number) => {
        const [reviews, stats] = await Promise.all([
            reviewRepository.findByProduct(productId),
            reviewRepository.getStats(productId),
        ]);
        return { reviews, stats };
    },

    getStatsBulk: async (productIds: number[]) => {
        return await reviewRepository.getStatsBulk(productIds);
    }
};

export default reviewService;
