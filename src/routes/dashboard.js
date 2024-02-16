const express = require('express');
const route = express.Router();
const isLogin = require('../middleware/isLogin.js');
const allowedRole = require('../middleware/allowedRole.js');
const dashboardController = require('../controller/dashboard.js');

route.get('/incomes', isLogin(), allowedRole('owner'), dashboardController.getIncomes);

module.exports = route;
