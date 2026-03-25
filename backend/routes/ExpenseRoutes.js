const express = require('express');
const router = express.Router();
const expenseController = require('../controller/ExpenseController');
const middleware = require('../middleware/AuthMiddle');

router.post('/add-expense/:tripId', middleware, expenseController.addExpense);
router.post('/add-settlement/:tripId', middleware, expenseController.addSettlement);
router.get('/data/:tripId', middleware, expenseController.getTripFinanceData);
router.put('/update-phase/:tripId', middleware, expenseController.updateTripPhase);

module.exports = router;
