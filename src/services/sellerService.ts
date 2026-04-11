import sellerRepository from '../repositories/sellerRepository';

const sellerService = {

    getPublicProfile: async (sellerId: number) => {
        const [profile, products, reviews, stats] = await Promise.all([
            sellerRepository.findPublicProfile(sellerId),
            sellerRepository.findProductsWithStats(sellerId),
            sellerRepository.findRecentReviews(sellerId, 6),
            sellerRepository.findStats(sellerId),
        ]);

        if (!profile) throw new Error('Vendedor não encontrado.');

        const memberSince = new Date(profile.created_at).toLocaleDateString('pt-BR', {
            month: 'long', year: 'numeric',
        });

        return {
            seller: { id: profile.id, name: profile.name, member_since: memberSince },
            stats,
            products,
            recent_reviews: reviews,
        };
    },

    getAnalytics: async (sellerId: number) => {
        const [kpis, revenueByMonth, topProducts, ordersByStatus, ratingDist] = await Promise.all([
            sellerRepository.getKpis(sellerId),
            sellerRepository.getRevenueByMonth(sellerId),
            sellerRepository.getTopProducts(sellerId),
            sellerRepository.getOrdersByStatus(sellerId),
            sellerRepository.getRatingDistribution(sellerId),
        ]);

        return {
            kpis,
            revenue_by_month:    revenueByMonth,
            top_products:        topProducts,
            orders_by_status:    ordersByStatus,
            rating_distribution: ratingDist,
        };
    },
};

export default sellerService;
