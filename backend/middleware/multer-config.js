const multer = require('multer');
const path = require('path');

// This middleware download an image file and save it in the image folder

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

const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        next();
    });
};