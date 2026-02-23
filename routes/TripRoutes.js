const express = require("express");
const router = express.Router();
const tripController = require("../controller/TripController");
const middleware = require("../middleware/AuthMiddle");

const chatController = require("../controller/ChatController");

router.post("/create-trip", middleware, tripController.createTrip);
router.put("/update-trip/:id", middleware, tripController.updateTrip);
router.delete("/delete-trip/:id", middleware, tripController.deleteTrip);
router.post("/add-members/:id", middleware, tripController.addMembers);
router.get("/get-members/:id", middleware, tripController.getAllMembers);
router.delete("/delete-members/:id", middleware, tripController.deleteMembers);
router.get("/chat/:tripId", middleware, chatController.getChatHistory);

module.exports = router;
