const express = require("express");
const Message = require("../models/Message");
const Trip = require("../models/Trip")

const getChatHistory = async (req, res) => {
    try {
        const { tripId } = req.params;
        const messages = await Message.find({ tripId })
            .populate("sender", "name email")
            .sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat history", error });
    }
};

const handleConnection = (socket, io) => {
    socket.on("join-trip", (tripId, userDetails) => {
        socket.join(tripId);
        if (userDetails) {
            socket.to(tripId).emit("user_joined", userDetails);
        }
    });

    socket.on("message", async (data) => {
        const { tripId, senderId, message } = data;

        try {
            const newMessage = new Message({
                tripId,
                sender: senderId,
                message
            });
            await newMessage.save();

            const populatedMessage = await newMessage.populate("sender", "name");

            io.to(tripId).emit("new-message", populatedMessage);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on("disconnect", () => {
    });
};

module.exports = { getChatHistory, handleConnection };
