const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    amt: {
        type: Number,
        required: true
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    splitAmong: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    cat: {
        type: String,
        required: true
    },
    phase: {
        type: String,
        enum: ['pre', 'live'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
