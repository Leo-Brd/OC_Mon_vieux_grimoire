const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const compressImg = require('../middleware/compressImg');
const clearTempFolder = require('../middleware/clearTempFolder');
const router = express.Router();

const bookCtrl = require('../controllers/bookController');

// All the routes for the books
router.post('/', auth, multer, compressImg, bookCtrl.createBook, clearTempFolder);
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, compressImg, bookCtrl.modifyBook, clearTempFolder);
router.delete('/:id', auth, bookCtrl.deleteBook, clearTempFolder);
router.post('/:id/rating', auth, bookCtrl.addRating);


module.exports = router;