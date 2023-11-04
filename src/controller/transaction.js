const transactionRepo = require("../repo/transaction");
const sendResponse = require("../helper/sendResponse");

const postbooking = async (req, res) => {
  try {
    const response = await transactionRepo.postBooking(
      req.body,
      req.userPayload.user_id
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const payment = async (req, res) => {
  try {
    const response = await transactionRepo.payment(
      req.body,
      req.file.secure_url
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const getByStatus = async (req, res) => {
  try {
    const response = await transactionRepo.getTransactionsByStatus_booking(
      req.userPayload.user_id,
      req.params.status
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const getHistory = async (req, res) => {
  try {
    const response = await transactionRepo.getHistoryCustomer(
      req.params.status,
      req.userPayload.user_id
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const getStatuspaid = async (req, res) => {
  try {
    const response = await transactionRepo.getStatusPaid(
      req.userPayload.user_id,
      req.params.status
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const acceptOrder = async (req, res) => {
  try {
    const response = await transactionRepo.acceptOrder(req.params.id,req.body.status);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const finishOrder = async (req, res) => {
  try {
    const response = await transactionRepo.finishOrder(req.params.id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const deleteOwner = async (req, res) => {
  try {
    const response = await transactionRepo.deleteTransactionOwner(
      req.params.id
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};
const deleteCustomer = async (req, res) => {
  try {
    const response = await transactionRepo.deleteTransactionCustomer(
      req.params.id
    );
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const kontrakanController = {
  postbooking,
  payment,
  getByStatus,
  getStatuspaid,
  getHistory,
  acceptOrder,
  finishOrder,
  deleteCustomer,
  deleteOwner,
};

module.exports = kontrakanController;
