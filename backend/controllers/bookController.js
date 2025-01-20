const Book = require('../models/bookModel');
const fs = require('fs');
const sharp = require('sharp');

async function compressImg(req) {
    const tempPath = req.file.path;
    const compressedImagePath = `images/compressed_${req.file.filename}`;

    await sharp(tempPath)
        .resize(800)
        .jpeg({ quality: 70 })
        .toFile(compressedImagePath);

    fs.unlinkSync(tempPath);
    return compressedImagePath;
}

exports.createBook = async (req, res, next) => {
    try {
        const bookObject = JSON.parse(req.body.book);

        delete bookObject._id;
        delete bookObject._userId;

        let compressedImagePath = await compressImg(req);

        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/${compressedImagePath}`,
            ratings: []
        });

        book.save()
            .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
            .catch(error => res.status(400).json({ error }));
    } catch (error) {
        res.status(400).json({ error: 'Requête invalide' });
    }
};


exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = async (req, res, next) => {
    try {
        let bookObject;

        if (req.file) {
            let compressedImagePath = await compressImg(req);

            bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/${compressedImagePath}`,
            };
        } else {
            bookObject = { ...req.body };
        }
      
        delete bookObject._userId;
        Book.findOne({_id: req.params.id})
            .then((book) => {
                if (book.userId != req.auth.userId) {
                    res.status(401).json({ message : 'Non autorisé !'});
                } else {
                    if (req.file && book.imageUrl) {
                        const oldFilename = book.imageUrl.split('/images/')[1];
                        fs.unlink(`images/${oldFilename}`, (err) => {
                          if (err) console.error(`Erreur lors de la suppression de l'ancienne image : ${err}`);
                        });
                    }

                    Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Livre modifié!'}))
                    .catch(error => res.status(401).json({ error }));
                }
            })
            .catch((error) => {
                res.status(400).json({ error });
            });
    } catch (error) {
        res.status(500).json({ error : 'Une erreur est survenue lors de la modification du Livre !'});
    }
  
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé !'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};