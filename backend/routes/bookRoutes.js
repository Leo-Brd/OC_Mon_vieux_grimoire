const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const compressImg = require('../middleware/compressImg');
const router = express.Router();

const bookCtrl = require('../controllers/bookController');

router.post('/', auth, multer, compressImg, bookCtrl.createBook);
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, compressImg, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.addRating);


module.exports = router;