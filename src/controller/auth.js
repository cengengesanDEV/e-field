const authRepo = require('../repo/auth');
const sendResponse = require("../helper/sendResponse")

// const client = require("../config/redis");

const login = async (req, res) => {
    try {
        const response = await authRepo.login(req.body)
        sendResponse.success(res, response.status, response);
    } catch (error) {
        sendResponse.error(res, error.status, error);
    }
}

const logout = async (req, res) => {
    try {
        const response = await authRepo.logout(req.userPayload)
        sendResponse.success(res, response.status, response)

    } catch (error) {
        sendResponse.error(res, error.status, error)
    }
}

const authController = {
    login,
    logout
}

module.exports = authController;