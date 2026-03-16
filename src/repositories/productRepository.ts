import db from '../config/database'; 

const productRepository = {
    create: async (productData: any) => {
        try {
            const { seller_id, name, description, price, stock, image_url } = productData;
            
            const query = `
                INSERT INTO products (seller_id, name, description, price, stock, image_url) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const values = [seller_id, name, description, price, stock, image_url];
            
            const [result] = await db.execute(query, values);
            return result;
        } catch (error) {
            console.error("❌ Erro ao criar produto no banco:", error);
            throw error;
        }
    }
};

export default productRepository;