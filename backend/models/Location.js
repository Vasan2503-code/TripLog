const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, { timestamps: true });

liveLocationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("LiveLocation" , liveLocationSchema);
