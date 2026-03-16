import express from 'express';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes); 

app.listen(3001, () => { 
    console.log('🚀 Servidor rodando na porta 3001!');
});

app.use('/api/products', productRoutes);