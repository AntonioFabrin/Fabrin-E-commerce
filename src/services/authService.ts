import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository';

const authService = {
    registerUser: async (userData: any) => {
        try {
            const usuarioExistente = await userRepository.findByEmail(userData.email);
            if (usuarioExistente) {
                throw new Error('Este e-mail já está em uso!');
            }

            if (!userData.password) {
                throw new Error('A senha não pode ser vazia.');
            }

            const hashPassword = await bcrypt.hash(userData.password, 10);

            // Aceita 'customer' ou 'seller' — qualquer outro valor cai para 'customer'
            const role = userData.role === 'seller' ? 'seller' : 'customer';

            const novoUserId = await userRepository.create({
                name: userData.name,
                email: userData.email,
                password: hashPassword,
                role,
            });

            return novoUserId;
        } catch (error) {
            throw error;
        }
    },

    login: async (email:string, password: string) => {
        try {
            const user = await userRepository.findByEmail(email);
            if(!user) {
                throw new Error ('Usuário não encontrado');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error ('Senha errada!');
            }
            return user;
        } catch (error) {
            throw error;
        }
    },

    updateUser: async (id: number, updateData: any) =>{
        try{
            const user = await userRepository.findById(id);
            if(!user) {
                throw new Error ('Usuário não econtrado!');
            }
            const sucesso = await userRepository.update(id, updateData);
            return sucesso;
        } catch (error) {
            throw error;
        }
    },

    deleteUser: async (id: number) => {
        try {
            const user = await userRepository.findById(id);
            if(!user) {
                throw new Error ('Usuário não encontrado para exclusão');
            }
            return await userRepository.delete(id);
        } catch (error) {
            throw error;
        }
    },

   getAllUsers: async () => {
        try {
            const users = await userRepository.findAll();
            return users;
        } catch (error: any) { 
            throw new Error(`Erro no banco de dados: ${error.message}`);
        }
    },

    updateUserRole: async (id: number, newRole: string) => {
        try {
            const validRoles = ['customer', 'seller']; 
            
            if (!validRoles.includes(newRole)) {
                throw new Error("Cargo inválido! Escolha entre: customer ou seller.");
            }
            
            // 1. Buscamos o usuário no banco:
            const user = await userRepository.findById(id);
            
            if (!user) {
                throw new Error("Usuário não encontrado no sistema.");
            }

            // 3. Atualizamos a role dele no banco
            await userRepository.update(id, { role: newRole });

            return { mensagem: `Sucesso! A conta agora tem permissões de ${newRole.toUpperCase()}.` };
        } catch (error) {
            throw error;
        }
    },
}

export default authService;