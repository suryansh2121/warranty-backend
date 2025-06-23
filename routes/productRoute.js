const express = require('express');
const router = express.Router();
const warrantyController = require('../controller/productsController');
const auth = require('../middleware/auth');
const {upload} = require('../middleware/upload');

router.post('/create', auth, upload.single('warrantyDocument'), warrantyController.createWarranty);
router.get('/', auth, warrantyController.getWarranties);
router.put('/:id', auth, upload.single('warrantyDocument'), warrantyController.updateWarranty);
router.delete('/:id', auth, warrantyController.deleteWarranty);
router.get('/search', auth, warrantyController.searchWarranties);
router.get('/:id', auth, warrantyController.getWarrantyById);


module.exports = router;