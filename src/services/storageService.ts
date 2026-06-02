import path from 'path';
import { supabase } from '../config/supabase';

const DEFAULT_PRODUCT_BUCKET = 'product-images';

const sanitizeFileName = (fileName: string) => {
    const ext = path.extname(fileName).toLowerCase();
    const base = path.basename(fileName, ext)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    return `${base || 'produto'}${ext}`;
};

export const uploadProductImage = async (file: Express.Multer.File, sellerId: number) => {
    if (!supabase) {
        throw new Error('Supabase Storage nao configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.');
    }

    const bucket = process.env.SUPABASE_PRODUCTS_BUCKET || DEFAULT_PRODUCT_BUCKET;
    const fileName = sanitizeFileName(file.originalname);
    const objectPath = `${sellerId}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${fileName}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(objectPath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '31536000',
            upsert: false,
        });

    if (error) {
        if (error.message.toLowerCase().includes('invalid compact jws')) {
            throw new Error('Chave do Supabase Storage invalida. Confira SUPABASE_SERVICE_ROLE_KEY no backend da Vercel e cole a service_role/secret key completa, sem espacos ou quebras de linha.');
        }

        throw new Error(`Erro ao enviar imagem para o Supabase Storage: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return data.publicUrl;
};

export const deleteProductImageByUrl = async (imageUrl?: string | null) => {
    if (!imageUrl || !supabase || !process.env.SUPABASE_URL) {
        return;
    }

    const bucket = process.env.SUPABASE_PRODUCTS_BUCKET || DEFAULT_PRODUCT_BUCKET;
    const publicPrefix = `${process.env.SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/`;

    if (!imageUrl.startsWith(publicPrefix)) {
        return;
    }

    const objectPath = decodeURIComponent(imageUrl.slice(publicPrefix.length));
    if (!objectPath) {
        return;
    }

    const { error } = await supabase.storage.from(bucket).remove([objectPath]);
    if (error) {
        throw new Error(`Erro ao remover imagem antiga do Supabase Storage: ${error.message}`);
    }
};
