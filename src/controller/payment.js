const paymentRepo = require('../repo/payment');
const sendResponse = require("../helper/sendResponse")

const postPayment = async (req, res) => {
    try {
      const { user_id } = req.userPayload;
      const response = await paymentRepo.postPayment(
        user_id,
        req.body
      );
      sendResponse.success(res, response.status, response);
    } catch (error) {
      sendResponse.error(res, error.status, error);
    }
  };

const paymentController = {postPayment}

module.exports = paymentController;