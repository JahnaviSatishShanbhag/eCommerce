const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        let fileName = file.originalname.replace(' ', '-');
        // fileName=fileName.split('.');
        // cb(null,`${fileName[0]}-${Date.now()}.${fileName[1]}`);
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.status(500).json({
            success: false
        });
    }
    else {
        res.status(200).send(productList);
    }
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        return res.status(404).send('Product with the given id is not found');
    }
    res.send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid category');
    // console.log('Before fileName');
    const file = req.file;
    if (!file) return res.status(400).send('No image found');
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated
    });
    await product.save();
    res.send(product);
});

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid product id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid category');
    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            dateCreated: req.body.dateCreated
        }, { new: true });
    if (!product) {
        return res.status(404).send('The product with the given id is not found')
    }
    res.send(product);
});

router.put('/gallery-images/:id', uploadOptions.array('images'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid product id');
    }
    const files = req.files;
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if (files) {
        files.map((file) => {
            imagePaths.push(`${basePath}$${file.filename}`);
        });
    }
    else{
        return res.status(400).send('No images found');
    }
    const product = await Product.findByIdAndUpdate(req.params.id,
        {
            images: imagePaths
        },
        { new: true });
    if (!product) {
        return res.status(404).send('The product with the given id is not found')
    }
    res.send(product);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'the product is deleted'
                });
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: 'the product is not found'
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);
    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.json({ count: productCount });
});

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);
    if (!products) {
        return res.status(500).json({ success: false });
    }
    res.send(products);
});

module.exports = router;