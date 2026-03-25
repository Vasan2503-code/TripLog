const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amt: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Settlement', settlementSchema);
