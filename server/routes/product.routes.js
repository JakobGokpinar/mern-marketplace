const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const { findProductQuery } = require('../schemas/user.schema');

router.get('/', validate(findProductQuery, 'query'), productController.findProduct);

module.exports = router;
