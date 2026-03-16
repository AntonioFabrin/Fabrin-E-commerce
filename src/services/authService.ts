import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository';

const authService = {
    registerUser: async (userData: any) => {
        console.log("3. Chegou no Service. Dados recebidos:", userData);
        try {
            const usuarioExistente = await userRepository.findByEmail(userData.email);
            if (usuarioExistente) {
                throw new Error('Este e-mail já está em uso!');
            }

            const saltRounds = 10;
            
            console.log("4. Valor que vai para o bcrypt:", userData.password);

            if (!userData.password) {
                throw new Error("A senha está chegando vazia no Service!");
            }

            const hashPassword = await bcrypt.hash(userData.password, saltRounds);

            const novoUserId = await userRepository.create({
                name: userData.name,
                email: userData.email,
                password: hashPassword,
                role: userData.role || 'customer'
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
            // AGORA SIM: Vamos printar o erro real do banco de dados no terminal!
            console.error("❌ ERRO REAL NO BANCO:", error.message);
            throw new Error(`Erro no banco de dados: ${error.message}`);
        }
    },
}

export default authService;