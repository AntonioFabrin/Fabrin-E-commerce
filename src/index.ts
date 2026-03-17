import express from 'express';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';

const app = express();
app.use(express.json());

// Tente bater NESTA rota aqui primeiro:
app.get('/api/ping', (req, res) => {
    res.json({ mensagem: "O servidor está vivo e ouvindo!" });
});

app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);

app.listen(3333, () => { 
    console.log('🚀 Servidor rodando na porta 3333!');
});