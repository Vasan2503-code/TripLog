const express = require("express");
const routes = express.Router();
const { uploadImages, getImages } = require('../controller/UploadImageConroller');
const { upload } = require('../middleware/multer');

routes.post('/upload', upload.single('image'), uploadImages);
routes.get('/images', getImages);

module.exports = routes;
