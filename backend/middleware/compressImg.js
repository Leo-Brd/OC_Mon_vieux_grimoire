const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

// This middleware compress the image and replace the original one

module.exports = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }

        const tempPath = req.file.path;
        const tempDir = path.dirname(tempPath);
        const compressedPath = path.join(tempDir, `compressed_${req.file.filename}`);

        await sharp(tempPath)
            .resize(800)
            .jpeg({ quality: 70 })
            .toFile(compressedPath);

        await fs.rename(compressedPath, tempPath);

        next();
    } catch (error) {
        res.status(500).json({ error });
    }
};
