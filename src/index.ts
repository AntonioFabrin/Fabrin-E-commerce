import 'dotenv/config';
import express from 'express';
import authRoutes    from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes   from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes  from './routes/reviewRoutes';
import sellerRoutes  from './routes/sellerRoutes';
import path from 'path';
import cors from 'cors';

const app = express();
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://26.36.11.61:3000',
    ...(process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean),
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.get('/api/ping', (req, res) => {
    res.json({ mensagem: 'Servidor rodando!' });
});

app.get('/', (req, res) => {
    res.json({ mensagem: 'API FabrinMarket online!' });
});

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/sellers',  sellerRoutes); // ✅ Perfil público do vendedor

const PORT = Number(process.env.PORT) || 3333;
if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}!`);
    });
}

export default app;
