const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/AuthMiddle");
const getAdvancedTripSuggestions = require("../controller/AdvancedAIController");

/**
 * Route for getting advanced travel suggestions with AI.
 * POST /location-suggestions
 * Protected by AuthMiddle
 */
router.post("/", authMiddleware, getAdvancedTripSuggestions);

module.exports = router;
