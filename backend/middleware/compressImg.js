const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

// This middleware compress the image and put it in the images folder

module.exports = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const tempPath = req.file.path;
        const compressedImagePath = path.join(
            path.dirname(tempPath).replace('temp', 'images'),
            `compressed_${req.file.filename}`
        );

        await sharp(tempPath)
            .resize(800)
            .jpeg({ quality: 70 })
            .toFile(compressedImagePath);


        req.file.path = compressedImagePath;
        req.file.filename = `compressed_${req.file.filename}`;

        next();
    } catch (error) {
        console.error('Erreur lors de la compression de l\'image:', error);
        res.status(500).json({ error: 'Erreur lors de la compression de l\'image.' });
    }
};
