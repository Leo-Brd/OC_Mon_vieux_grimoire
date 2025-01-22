const Book = require('../models/bookModel');
const fs = require('fs');
const sharp = require('sharp');


async function compressImg(req) {
    if (!req.file) {
        throw new Error('Aucun fichier trouvé dans la requête.');
    }

    const tempPath = req.file.path;
    const compressedImagePath = `images/compressed_${req.file.filename}`;

    await sharp(tempPath)
        .resize(800)
        .jpeg({ quality: 70 })
        .toFile(compressedImagePath);

    fs.unlink(tempPath, (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du fichier temporaire:', err);
        }
    });
    return compressedImagePath;
}

exports.createBook = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier trouvé dans la requête.' });
        }
        console.log('Fichier reçu :', req.file);
        console.log('Données du livre :', req.body.book);


        const bookObject = JSON.parse(req.body.book);

        delete bookObject._id;
        delete bookObject._userId;

        const compressedImagePath = await compressImg(req);

        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/${compressedImagePath}`,
            ratings: []
        });

        await book.save();
        res.status(201).json({ message: 'Livre enregistré !' });
    } catch (error) {
        console.error('Erreur lors de la création du livre :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
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

exports.addRating = async (req, res, next) => {
    try {
        const { userId, grade } = req.body;

        if (grade < 0 || grade > 5) {
            return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
        }

        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé.' });
        }

        const existingRating = book.ratings.find(rating => rating.userId === userId);
        if (existingRating) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
        }

        book.ratings.push({ userId, grade });

        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = sumRatings / totalRatings;

        await book.save();

        res.status(201).json({ message: 'Note ajoutée avec succès !', book });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de la note.' });
    }
};

exports.getBestRatedBooks = async (req, res, next) => {
    try {
        const bestBooks = await Book.find()
            .sort({ averageRating: -1 })
            .limit(3);

        res.status(200).json(bestBooks);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des livres les mieux notés.' });
    }
};
