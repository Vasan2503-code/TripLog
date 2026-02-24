const express = require("express");
const router = express.Router();
const middleware = require("../middleware/AuthMiddle");

const getTripSuggestions = require("../controller/AIController");

router.post("/", middleware, getTripSuggestions);

module.exports = router;