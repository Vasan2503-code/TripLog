const multer = require('multer');
const { storage } = require('../config/cloudConfig');

const upload = multer({ storage: storage });

module.exports = { upload };
