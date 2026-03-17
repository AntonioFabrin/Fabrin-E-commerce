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
    },

    findAll: async () => {
        try {
            const query = 'SELECT * FROM products';
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            console.error("❌ Erro ao buscar produtos:", error);
            throw error;
        }
    },

    findById: async (id: number) => {
        try {
            const query = 'SELECT * FROM products WHERE id = ?';
            const [rows] = await db.execute(query, [id]);

            return (rows as any []) [0]; 
        } catch (error) {
            console.error("❌ Erro ao buscar produto específico:", error)
            throw error;
        }
    },

    update: async (id:number, productData: any) => {
        try {
            const {name, description, price, stock, image_url} = productData;
            const query = `
            UPDATE procuts
            SET name = ?, description = ?, price = ?, stock = ? image_url = ?, 
            WHERE id = ?
            `;
            const values = [name, description, price, stock, image_url, id];
            const result = await db.execute(query, values);
            return result;
        } catch (error) {
            console.error("❌ Erro ao atualizar produto no banco:",error)
            throw error;
        }
    },

    delete: async (id:number) => {
        try {
            const query = 'DELETE FROM products WHERE id = ?';
            const [result] = await db.execute(query,[id]);
            return result;
        } catch (error) {
            console.error ("❌ Erro ao deletar produto no banco:", error);
        }
    }

};

export default productRepository;