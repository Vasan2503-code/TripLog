const express = require("express");
const LiveLocation = require("../models/Location");

const postLocation = async (req, res) => {
    try {
        const { tripId, userId, latitude, longitude } = req.body;

        if (!tripId || !userId || !latitude || !longitude) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const location = await LiveLocation.findOneAndUpdate(
            { tripId, userId },
            {
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (req.io) {
            req.io.to(tripId).emit("receive_location", location);
        } else {
            console.error("Socket.io instance not found on request object");
        }

        res.status(200).json(location);
    } catch (error) {
        console.error("Error sharing location:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    postLocation
}