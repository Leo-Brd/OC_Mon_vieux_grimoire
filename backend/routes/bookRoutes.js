const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/bookController');

router.post('/', bookCtrl.createBook);
router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', bookCtrl.modifyBook);
router.delete('/:id', bookCtrl.deleteBook);

module.exports = router;