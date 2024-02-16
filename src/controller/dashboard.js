const sendResponse = require('../helper/sendResponse');
const dashboardRepo = require('../repo/dashboard');

const getIncomes = async (req, res) => {
  try {
    const response = await dashboardRepo.getIncomes(req.userPayload.user_id, req.query.type);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    sendResponse.error(res, error.status, error);
  }
};

const dashboardController = {
  getIncomes,
};

module.exports = dashboardController;
