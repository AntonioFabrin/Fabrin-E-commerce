import express from 'express';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import path from 'path';
const app = express();
app.use(express.json());

app.use(express.json());
app.get('/api/ping', (req, res) => {
    res.json({ mensagem: "O servidor está vivo e ouvindo!" });
});
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.listen(3333, () => { 
    console.log('🚀 Servidor rodando na porta 3333!');
});