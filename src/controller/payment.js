const paymentRepo = require('../repo/payment');
const sendResponse = require('../helper/sendResponse');

const postPayment = async (req, res) => {
  try {
    const { user_id } = req.userPayload;
    const response = await paymentRepo.postPayment(user_id, req.body);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getBookingCustomer = async (req, res) => {
  try {
    const { user_id } = req.userPayload;
    const response = await paymentRepo.getBookingCustomer(user_id, req.params.status);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getBookingOwner = async (req, res) => {
  try {
    const { user_id } = req.userPayload;
    const response = await paymentRepo.getBookingOwner(user_id, req.query);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const patchStatusBooking = async (req, res) => {
  try {
    const total = await paymentRepo.getTotalAmount(req.params.id);
    const response = await paymentRepo.patchStatusBooking(req.params.id, req.body.status, total);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const patchBookingTimeAndDate = async (req, res) => {
  try {
    const response = await paymentRepo.patchBookingTimeAndDate(req.params.id, req.body);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const paymentController = {
  postPayment,
  getBookingCustomer,
  getBookingOwner,
  patchStatusBooking,
  patchBookingTimeAndDate,
};

module.exports = paymentController;
