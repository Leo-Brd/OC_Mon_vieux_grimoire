const fs = require('fs/promises');
const path = require('path');

// This middleware clear the temp folder

const clearTempFolder = async (req, res, next) => {
    try {
        const tempFolder = path.join(__dirname, '../temp');

        const files = await fs.readdir(tempFolder);

        if (files.length === 0) {
            return next();
        }

        for (const file of files) {
            const filePath = path.join(tempFolder, file);
            await fs.unlink(filePath);
        }

        next();
    } catch (error) {
        console.error('Erreur lors du nettoyage du dossier temp:', error);
        next();
    }
};

module.exports = clearTempFolder;
