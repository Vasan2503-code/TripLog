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
    socket.on("join_room", (tripId) => {
        socket.join(tripId);
    });

    socket.on("send_message", async (data) => {
        const { tripId, senderId, message } = data;

        try {
            const newMessage = new Message({
                tripId,
                sender: senderId,
                message
            });
            await newMessage.save();

            const populatedMessage = await newMessage.populate("sender", "name");

            io.to(tripId).emit("receive_message", populatedMessage);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on("disconnect", () => {
    });
};

module.exports = { getChatHistory, handleConnection };

