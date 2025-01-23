const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier trouvé dans la requête.' });
        }

        const tempPath = req.file.path;
        const compressedImagePath = path.join(
            path.dirname(tempPath),
            `compressed_${req.file.filename}`
        );

        await sharp(tempPath)
            .resize(800)
            .jpeg({ quality: 70 })
            .toFile(compressedImagePath);

        fs.unlink(tempPath, (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier temporaire:', err);
            }
        });

        req.file.path = compressedImagePath;
        req.file.filename = `compressed_${req.file.filename}`;

        next();
    } catch (error) {
        console.error('Erreur lors de la compression de l\'image:', error);
        res.status(500).json({ error: 'Erreur lors de la compression de l\'image.' });
    }
};
