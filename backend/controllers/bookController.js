const Book = require('../models/bookModel');
const fs = require('fs');

// ALL THE FUNCTIONS FOR THE BOOKS

// We get all the books
exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};

// We get one specific book
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

// We create a new book
exports.createBook = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier trouvé dans la requête.' });
        }

        const bookObject = JSON.parse(req.body.book);

        delete bookObject._id;
        delete bookObject._userId;

        const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            ratings: []
        });

        await book.save();
        res.status(201).json({ message: 'Livre enregistré !' });
        next();
    } catch (error) {
        console.error('Erreur lors de la création du livre :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

// We modify a book and manage the new image if there is one
exports.modifyBook = async (req, res, next) => {
    try {
        let bookObject;

        if (req.file) {

            bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            };
        } else {
            bookObject = { ...req.body };
        }
      
        delete bookObject._userId;
        Book.findOne({_id: req.params.id})
            .then((book) => {
                if (book.userId != req.auth.userId) {
                    res.status(403).json({ message : '403: unauthorized request'});
                } else {
                    if (req.file && book.imageUrl) {
                        const oldFilename = book.imageUrl.split('/images/')[1];
                        fs.unlink(`images/${oldFilename}`, (err) => {
                          if (err) console.error(`Erreur lors de la suppression de l'ancienne image : ${err}`);
                        });
                    }

                    Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                    .then(() => {
                        res.status(200).json({message : 'Livre modifié!'});
                        next();
                    })
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

// We delete a book
exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: '403: unauthorized request'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => {
                            res.status(200).json({message: 'Livre supprimé !'});
                            next();
                        })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

// We add a valid rating to a book and calculate the new average rating
exports.addRating = async (req, res, next) => {
    try {
        const { userId, rating } = req.body;

        if (rating < 0 || rating > 5) {
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

        book.ratings.push({ userId, grade: rating });

        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        book.averageRating = sumRatings / totalRatings;

        await book.save();

        res.status(201).json({ message: 'Note ajoutée avec succès !', book });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de l\'ajout de la note.' });
    }
};

// We get the 3 best rated books
exports.getBestRatedBooks = async (req, res, next) => {
    try {
        const bestBooks = await Book.find()
            .sort({ averageRating: -1 })
            .limit(3);

        if (bestBooks.length === 0) {
            return res.status(404).json({ message: 'Aucun livre trouvé.' });
        }

        res.status(200).json(bestBooks);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des livres les mieux notés.' });
    }
};
