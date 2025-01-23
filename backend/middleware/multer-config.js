const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../images'));
    },
    filename: (req, file, callback) => {
        const name = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const extension = MIME_TYPES[file.mimetype];
        const uniqueSuffix = Date.now();
        callback(null, `${name}_${uniqueSuffix}.${extension}`);
    }
});



module.exports = multer({ storage }).single('image');