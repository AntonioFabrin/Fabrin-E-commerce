import db from '../config/database';

const userRepository = {
    findByEmail: async (email: string) => {
        const query = "SELECT * FROM users WHERE email = ?"; 
        const [results]: any = await db.execute(query, [email]);
        return results[0];
    },

    create: async (user: any) => {
        const { name, email, password, role } = user;
       
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        
        const [result]: any = await db.execute(query, [name, email, password, role]);
        return result.insertId;
    },

async update(id: number, userData: any) {
    const name = userData.name ?? null;
    const email = userData.email ?? null;
    const role = userData.role ?? null;

    const query = "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?";
    
    return await db.execute(query, [name, email, role, id]);
},

    findById: async (id:number) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows]: any = await db.execute(query,[id]);
        return rows [0];
    },

    delete:async (id: number) => {
        try {
            const query = 'DELETE FROM users WHERE id = ?';
            const [result]: any = await db.execute(query, [id]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    findAll: async () => {
        try {
            const query = 'SELECT id, name, email, role FROM users';
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    },
};

export default userRepository;