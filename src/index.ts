import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import path from 'path';
import cors from 'cors';

const app = express();

app.use(cors({ 
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.get('/api/ping', (req, res) => {
    res.json({ mensagem: 'Servidor rodando!' });
});

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes); // ✅ Avaliações

app.listen(3333, '0.0.0.0', () => {
    console.log('🚀 Servidor rodando na porta 3333!');
    console.log(`💳 MP Token: ${process.env.MP_ACCESS_TOKEN?.substring(0, 20)}...`);
});
