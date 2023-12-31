const adminRepo = require('../repo/admin');
const sendResponse = require('../helper/sendResponse');

// const client = require("../config/redis");

const suspendUser = async (req, res) => {
  try {
    const response = await adminRepo.suspendUser(req.params.id, req.body.msg);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const unsuspendUser = async (req, res) => {
  try {
    const response = await adminRepo.unsuspendUser(req.params.id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getUser = async (req, res) => {
  try {
    const response = await adminRepo.getUser(req.params.role, req.query);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getOwnerField = async (req, res) => {
  try {
    const response = await adminRepo.getOwnerField(req.params.id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const getDetailOwnerField = async (req, res) => {
  try {
    const response = await adminRepo.getDetailField(req.params.id);
    sendResponse.success(res, response.status, response);
  } catch (error) {
    sendResponse.error(res, error.status, error);
  }
};

const adminController = {
  suspendUser,
  getUser,
  getOwnerField,
  getDetailOwnerField,
  unsuspendUser,
};

module.exports = adminController;
