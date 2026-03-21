import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extensao = path.extname(file.originalname);
        
        cb(null,nomeUnico + extensao)
    }
});
export const upload = multer({ storage });