const express = require("express")
const router = express.Router();
const LocationController = require("../controller/LocationController")

router.post("/post-location" , LocationController.postLocation);

module.exports = router;