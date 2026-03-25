const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Trip = require('../models/Trip');

const addExpense = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { desc, amt, paidBy, splitAmong, cat, phase } = req.body;

        const newExpense = new Expense({
            tripId,
            desc,
            amt,
            paidBy,
            splitAmong,
            cat,
            phase
        });

        await newExpense.save();
        res.status(201).send({ message: "Expense added successfully", expense: newExpense });
    } catch (e) {
        res.status(500).send({ message: "Server side error", error: e.message });
    }
};

const getTripFinanceData = async (req, res) => {
    try {
        const { tripId } = req.params;

        const expenses = await Expense.find({ tripId }).populate('paidBy', 'name email').populate('splitAmong', 'name email').sort({ createdAt: -1 });
        const settlements = await Settlement.find({ tripId }).populate('from', 'name email').populate('to', 'name email').sort({ createdAt: 1 });
        
        const trip = await Trip.findById(tripId)
            .select('phase title members createdBy')
            .populate('members', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).send({ message: "Finance data fetched successfully", expenses, settlements, trip });
    } catch (e) {
        res.status(500).send({ message: "Server side error", error: e.message });
    }
};

const addSettlement = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { from, to, amt } = req.body;

        const newSettlement = new Settlement({ tripId, from, to, amt });
        await newSettlement.save();
        
        res.status(201).send({ message: "Settlement added successfully", settlement: newSettlement });
    } catch (e) {
        res.status(500).send({ message: "Server side error", error: e.message });
    }
};

const updateTripPhase = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { phase } = req.body;

        const trip = await Trip.findByIdAndUpdate(tripId, { phase }, { new: true });
        
        if(!trip) {
            return res.status(404).send({ message: "Trip not found" });
        }
        res.status(200).send({ message: "Trip phase updated", trip });
    } catch (e) {
        res.status(500).send({ message: "Server side error", error: e.message });
    }
};

module.exports = { addExpense, getTripFinanceData, addSettlement, updateTripPhase };
